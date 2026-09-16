import os
import json
import logging
import requests
from typing import List, Optional
from pydantic import BaseModel, Field
from app.config import settings

logger = logging.getLogger(__name__)

# ==========================================
# PYDANTIC STRUCTURED OUTPUT SCHEMA DEFINITIONS
# ==========================================

class TaskModel(BaseModel):
    title: str = Field(description="Actionable learning task or resource to study")
    estimatedHours: int = Field(description="Estimated hours to complete the task")

class WeekModel(BaseModel):
    title: str = Field(description="Title of the week/module (e.g., Week 1: Basics of React)")
    weekNumber: int = Field(description="Sequential week number starting at 1")
    description: str = Field(description="Syllabus overview and concepts taught this week")
    tasks: List[TaskModel] = Field(description="List of actionable learning tasks")

class SyllabusModel(BaseModel):
    title: str = Field(description="Overall title of the curriculum")
    description: str = Field(description="High-level description of what the user will master")
    nodes: List[WeekModel] = Field(description="List of weeks/modules")

class ProjectBlueprintModel(BaseModel):
    ideas: str = Field(description="General architectural suggestions and core features")
    folder_structure: str = Field(description="Standard folder structure diagram")
    api_suggestions: str = Field(description="Suggested API routes and method verbs")
    database_design: str = Field(description="Database design schema and entity linkages")

class InterviewQuestionModel(BaseModel):
    question: str = Field(description="The technical or behavioral interview question")
    expected_points: str = Field(description="Key concepts or keywords expected in a perfect answer")

class InterviewEvaluationModel(BaseModel):
    score: int = Field(description="Rating score from 0 to 100")
    feedback: str = Field(description="Critique on what was covered and what was missing")
    model_answer: str = Field(description="Suggested ideal answer to the question")

class ResumeAnalysisModel(BaseModel):
    ats_score: int = Field(description="Calculated ATS parser score from 0 to 100")
    summary: str = Field(description="Executive summary of the candidate's profile strengths")
    missing_skills: List[str] = Field(description="Top skills and keywords missing from the resume")
    improvement_suggestions: List[str] = Field(description="Specific actionable layout or content enhancements")
    feedback: str = Field(description="General evaluator comments and suggestions")

class JdComparisonModel(BaseModel):
    match_percentage: int = Field(description="Compatibility score from 0 to 100")
    skill_gap_analysis: List[str] = Field(description="Concrete details about why the profile doesn't match")
    missing_technologies: List[str] = Field(description="Technologies listed in JD but missing in resume")
    recommended_learning_path: List[str] = Field(description="Action steps to acquire the missing tech")
    interview_prep_topics: List[str] = Field(description="Suggested topics to review for an interview for this role")

# ==========================================
# SERVICE LAYER CLASS
# ==========================================

class AIService:
    def __init__(self):
        self.model_name = "gemini-1.5-flash"

    def _call_gemini_rest(self, contents: list, json_mode: bool = False, system_instruction: str = None) -> str:
        """Direct HTTPS REST call to Gemini 1.5 Flash API with reliable timeouts and zero gRPC overhead."""
        api_key = settings.GEMINI_API_KEY.strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured in environment variables on Render. Please set GEMINI_API_KEY in Render dashboard.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={api_key}"
        
        generation_config = {
            "temperature": 0.3,
            "maxOutputTokens": 4096
        }
        if json_mode:
            generation_config["responseMimeType"] = "application/json"

        payload = {
            "contents": contents,
            "generationConfig": generation_config
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        headers = {"Content-Type": "application/json"}
        
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=25)
        except requests.exceptions.Timeout:
            raise RuntimeError("Gemini API call timed out after 25 seconds.")
        except Exception as e:
            raise RuntimeError(f"Network error contacting Gemini API: {str(e)}")

        if resp.status_code != 200:
            err_body = resp.text
            try:
                err_json = resp.json()
                err_msg = err_json.get("error", {}).get("message", err_body)
            except Exception:
                err_msg = err_body
            raise RuntimeError(f"Gemini API returned status {resp.status_code}: {err_msg}")

        data = resp.json()
        candidates = data.get("candidates", [])
        if not candidates:
            raise RuntimeError("Gemini returned empty candidate response.")

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts or "text" not in parts[0]:
            raise RuntimeError("Gemini response missing text parts.")

        return parts[0]["text"]

    def _invoke_json(self, prompt: str) -> dict:
        """Helper to invoke Gemini via REST in native JSON mode and parse the response dict."""
        contents = [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
        text = self._call_gemini_rest(contents, json_mode=True).strip()
        
        # Strip markdown fences if Gemini added them despite json_mode
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        return json.loads(text)

    def chat_session(self, message: str, history: List[dict], profile: dict = None) -> str:
        """Runs conversational dialogue using history and user profile context."""
        system_instruction = (
            "You are VertexPath's senior AI career coach. Offer actionable, concrete advice on software development, "
            "portfolio building, technical interviews, and job searching. Support code snippet formatting using standard markdown backticks."
        )
        if profile:
            system_instruction += (
                f"\n\nUser Profile Context for Personalization:\n"
                f"- Target Career Goal: {profile.get('careerGoal') or 'Software Engineer'}\n"
                f"- Experience Level: {profile.get('experienceLevel') or 'Not specified'}\n"
                f"- Primary Objective: {profile.get('careerObjective') or 'Not specified'}\n"
                f"- Identified Gaps / Focus Areas: {profile.get('skillGaps') or 'Not specified'}\n"
                f"- Technologies Stack: {profile.get('technologies') or 'Not specified'}\n"
                f"- Weekly Time Commitment: {profile.get('weeklyCommitment') or 'Not specified'}\n"
                f"- Preferred Learning Style: {profile.get('optionalLearningStyle') or 'Not specified'}\n"
                f"- Job Location Preference: {profile.get('optionalJobPreference') or 'Not specified'}\n"
                f"Use this context to tailor advice directly to this user's situation."
            )

        contents = []
        for item in history:
            role = "user" if item.get("role") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": item.get("content", "")}]
            })

        contents.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        return self._call_gemini_rest(contents, json_mode=False, system_instruction=system_instruction)

    def generate_roadmap(self, topic: str) -> dict:
        """Generates a structured syllabus learning path."""
        prompt = (
            f"Generate an industry-grade, highly comprehensive and detailed 4-week learning roadmap for: '{topic}'.\n"
            "Guidelines:\n"
            "- Define a highly progressive week-by-week study plan with structured, sequential modules.\n"
            "- Each week must have a professional title and a detailed description explaining what concepts are mastered.\n"
            "- Under each week, provide a list of highly specific, actionable study tasks and hands-on coding exercises. Avoid generic tasks.\n"
            "- Estimate realistic, practical hours for each task.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"title\": \"Overall title of the curriculum\",\n"
            "  \"description\": \"High-level description of what the user will master\",\n"
            "  \"nodes\": [\n"
            "    {\n"
            "      \"title\": \"Title of the week/module (e.g., Week 1: Basics of React)\",\n"
            "      \"weekNumber\": 1,\n"
            "      \"description\": \"Syllabus overview and concepts taught this week\",\n"
            "      \"tasks\": [\n"
            "        {\n"
            "          \"title\": \"Actionable learning task or resource to study\",\n"
            "          \"estimatedHours\": 4\n"
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        return self._invoke_json(prompt)

    def generate_project(self, stack: str) -> dict:
        """Generates a structured project blueprint sandbox configuration."""
        prompt = (
            f"Generate a comprehensive, detailed, production-ready software project blueprint for the tech stack/concept: '{stack}'.\n"
            "Guidelines:\n"
            "- ideas: Suggest a production-grade application idea with detailed descriptions of core features, security protocols, and advanced architecture patterns.\n"
            "- folder_structure: Provide a complete, highly organized directory tree diagram showcasing all layers of the project (backend source code, controllers, services, database config, and frontend client views) showcasing src files, tests, and configuration assets.\n"
            "- api_suggestions: List specific REST API endpoints, detailing HTTP verbs, exact paths, expected query/path parameters, request payloads, and response status codes.\n"
            "- database_design: Detail a database design schema indicating table fields, data types, relationships (primary/foreign keys), indexing recommendations, and query performance optimizations.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"ideas\": \"Production application idea description\",\n"
            "  \"folder_structure\": \"Detailed directory tree\",\n"
            "  \"api_suggestions\": \"REST API routes endpoints details\",\n"
            "  \"database_design\": \"Database tables schema details\"\n"
            "}"
        )
        return self._invoke_json(prompt)

    def generate_interview_question(self, role: str) -> dict:
        """Generates a mock interview question based on target role."""
        prompt = (
            f"Generate a mock technical or HR interview question for the following role: '{role}'.\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"question\": \"The technical or behavioral interview question\",\n"
            "  \"expected_points\": \"Key concepts or keywords expected in a perfect answer\"\n"
            "}"
        )
        return self._invoke_json(prompt)

    def evaluate_interview_answer(self, question: str, answer: str) -> dict:
        """Evaluates a user's mock interview response."""
        prompt = (
            f"Question: {question}\n"
            f"User's Answer: {answer}\n\n"
            "Strict Evaluation Guidelines:\n"
            "1. Evaluate the user's answer strictly based on correctness, technical depth, and specific keyword matches.\n"
            "2. If the user's answer is extremely short (e.g. less than 5-10 words, or single-word answers like 'easy', 'yes', 'no', 'dont know'), or completely irrelevant, or nonsense, YOU MUST ASSIGN A SCORE OF 0 to 10 OUT OF 100.\n"
            "3. If the answer is basic and missing depth, assign a moderate score of 30 to 60.\n"
            "4. Only assign a score of 80+ if the user provides a detailed explanation covering the technical concepts required by the question.\n"
            "5. Provide constructive feedback detailing what they answered right and what is missing. Provide a clean, perfect, production-grade model answer.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"score\": 0,\n"
            "  \"feedback\": \"Critique on what was covered and what was missing\",\n"
            "  \"model_answer\": \"Suggested ideal answer to the question\"\n"
            "}"
        )
        result = self._invoke_json(prompt)
        
        # Fallback check for extremely short/lazy answers
        clean_ans = answer.strip().lower().replace(".", "").replace(",", "").replace("!", "")
        word_count = len(clean_ans.split())
        lazy_words = ["easy", "simple", "dont know", "don't know", "skip", "pass", "ok", "fine", "nothing", "no idea", "too easy", "whatever"]
        is_lazy = any(w in clean_ans for w in lazy_words) or word_count < 10
        if is_lazy:
            if "score" in result:
                result["score"] = 5
                result["feedback"] = "Your response is too short, non-technical, or lazy. Please provide a detailed technical explanation to demonstrate your expertise."
            else:
                result = {
                    "score": 5,
                    "feedback": "Your response is too short, non-technical, or lazy. Please provide a detailed technical explanation to demonstrate your expertise.",
                    "model_answer": "A proper explanation should cover the architectural tradeoffs and technical details of the question."
                }
        
        return result

    def analyze_resume(self, resume_text: str) -> dict:
        """Evaluates resume content to suggest enhancements."""
        prompt = (
            f"Analyze the following resume text:\n\n{resume_text}\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"ats_score\": 85,\n"
            "  \"summary\": \"Executive summary of the candidate's profile strengths\",\n"
            "  \"missing_skills\": [\"skill1\", \"skill2\"],\n"
            "  \"improvement_suggestions\": [\"suggestion1\", \"suggestion2\"],\n"
            "  \"feedback\": \"General evaluator comments and suggestions\"\n"
            "}"
        )
        return self._invoke_json(prompt)

    def compare_jd(self, resume_text: str, jd_text: str) -> dict:
        """Compares a candidate's resume with a target Job Description."""
        prompt = (
            f"Resume Text:\n{resume_text}\n\n"
            f"Job Description Text:\n{jd_text}\n\n"
            "Compare them. You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"match_percentage\": 70,\n"
            "  \"skill_gap_analysis\": [\"gap1\", \"gap2\"],\n"
            "  \"missing_technologies\": [\"tech1\", \"tech2\"],\n"
            "  \"recommended_learning_path\": [\"step1\", \"step2\"],\n"
            "  \"interview_prep_topics\": [\"topic1\", \"topic2\"]\n"
            "}"
        )
        return self._invoke_json(prompt)

    def optimize_bullet_point(self, bullet: str, target_role: str = "") -> dict:
        """Transforms a raw resume bullet point into 3 high-impact, metric-driven ATS alternatives."""
        prompt = (
            f"Original Resume Bullet Point:\n\"{bullet}\"\n"
            f"Target Role (if any): {target_role or 'Software Engineer'}\n\n"
            "Generate 3 distinct, production-grade, metric-driven ATS resume bullet point improvements.\n"
            "Each must follow the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.\n"
            "Include strong action verbs, technical specifics, and quantified business impact metrics.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"original\": \"The original input bullet\",\n"
            "  \"critique\": \"Brief 1-2 sentence critique explaining what was missing (e.g. lack of metrics, passive tone)\",\n"
            "  \"variations\": [\n"
            "    {\n"
            "      \"label\": \"Metric & Performance Focused\",\n"
            "      \"bullet\": \"High-impact bullet with speed/latency/throughput percentage improvements\",\n"
            "      \"action_verb\": \"Architected\",\n"
            "      \"metric_highlight\": \"reduced latency by 35%\"\n"
            "    },\n"
            "    {\n"
            "      \"label\": \"Scale & Architecture Focused\",\n"
            "      \"bullet\": \"Focus on architectural design patterns and handling high concurrency\",\n"
            "      \"action_verb\": \"Engineered\",\n"
            "      \"metric_highlight\": \"scaling to 100k+ DAU\"\n"
            "    },\n"
            "    {\n"
            "      \"label\": \"Product & Business Impact\",\n"
            "      \"bullet\": \"Focus on user adoption, cost savings, or business deliverables\",\n"
            "      \"action_verb\": \"Spearheaded\",\n"
            "      \"metric_highlight\": \"saving 20+ dev hours weekly\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        return self._invoke_json(prompt)

    def generate_daily_challenge(self, career_path: str = "Full Stack Engineer") -> dict:
        """Generates a quick 1-question technical drill for the daily streak."""
        prompt = (
            f"Career Path: {career_path}\n\n"
            "Generate a quick, engaging 1-question multiple-choice technical drill testing core conceptual knowledge.\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            "  \"title\": \"Topic / Domain (e.g., PostgreSQL Indexing, React Hooks, System Design)\",\n"
            "  \"question\": \"Clear, concise technical scenario question\",\n"
            "  \"options\": [\n"
            "    \"Option A text\",\n"
            "    \"Option B text\",\n"
            "    \"Option C text\",\n"
            "    \"Option D text\"\n"
            "  ],\n"
            "  \"correct_index\": 1,\n"
            "  \"explanation\": \"Concise 2-sentence explanation of why the correct answer is right and why other choices fail.\"\n"
            "}"
        )
        return self._invoke_json(prompt)

# Backward compatibility helper
def get_chat_model():
    return ai_service

ai_service = AIService()
