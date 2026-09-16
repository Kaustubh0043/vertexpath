import os
import json
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

# Preferred model list with automatic fallback
CANDIDATE_MODELS = [
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
]

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
        self.active_model_name = "gemini-flash-latest"

    def _get_configured_genai(self):
        api_key = (settings.GEMINI_API_KEY or "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured in Render environment variables.")
        genai.configure(api_key=api_key)
        return api_key

    def _generate(self, prompt: str, json_mode: bool = False, system_instruction: str = None) -> str:
        self._get_configured_genai()
        
        gen_config = {
            "temperature": 0.3,
        }
        if json_mode:
            gen_config["response_mime_type"] = "application/json"

        last_error = None
        # Try candidate models in order
        for model_name in [self.active_model_name] + [m for m in CANDIDATE_MODELS if m != self.active_model_name]:
            try:
                model_kwargs = {"generation_config": gen_config}
                if system_instruction:
                    model_kwargs["system_instruction"] = system_instruction
                
                model = genai.GenerativeModel(model_name, **model_kwargs)
                response = model.generate_content(prompt)
                self.active_model_name = model_name
                return response.text
            except Exception as e:
                last_error = e
                logger.warning(f"Model {model_name} failed: {e}. Trying next available model...")

        raise RuntimeError(f"All candidate Gemini models failed. Last error: {last_error}")

    def _invoke_json(self, prompt: str) -> dict:
        text = self._generate(prompt, json_mode=True).strip()
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        return json.loads(text)

    def chat_session(self, message: str, history: List[dict], profile: dict = None) -> str:
        self._get_configured_genai()
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

        formatted_history = []
        for item in history:
            role = "user" if item.get("role") == "user" else "model"
            formatted_history.append({
                "role": role,
                "parts": [item.get("content", "")]
            })

        for model_name in [self.active_model_name] + [m for m in CANDIDATE_MODELS if m != self.active_model_name]:
            try:
                model = genai.GenerativeModel(model_name, system_instruction=system_instruction)
                chat = model.start_chat(history=formatted_history)
                resp = chat.send_message(message)
                self.active_model_name = model_name
                return resp.text
            except Exception as e:
                logger.warning(f"Chat failed with {model_name}: {e}")

        # Fallback to single-turn generate
        return self._generate(f"User Question: {message}", json_mode=False, system_instruction=system_instruction)

    def generate_roadmap(self, topic: str) -> dict:
        prompt = (
            f"Generate an industry-grade, highly comprehensive and detailed 4-week learning roadmap for: '{topic}'.\n"
            "Guidelines:\n"
            "- Define a highly progressive week-by-week study plan with structured, sequential modules.\n"
            "- Each week must have a professional title and a detailed description explaining what concepts are mastered.\n"
            "- Under each week, provide a list of highly specific, actionable study tasks and hands-on coding exercises.\n"
            "- Estimate realistic, practical hours for each task.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "title": "Overall title of the curriculum",\n'
            '  "description": "High-level description of what the user will master",\n'
            '  "nodes": [\n'
            '    {\n'
            '      "title": "Title of the week/module (e.g., Week 1: Basics of React)",\n'
            '      "weekNumber": 1,\n'
            '      "description": "Syllabus overview and concepts taught this week",\n'
            '      "tasks": [\n'
            '        {\n'
            '          "title": "Actionable learning task or resource to study",\n'
            '          "estimatedHours": 4\n'
            '        }\n'
            '      ]\n'
            '    }\n'
            '  ]\n'
            "}"
        )
        return self._invoke_json(prompt)

    def generate_project(self, stack: str) -> dict:
        prompt = (
            f"Generate a comprehensive, detailed, production-ready software project blueprint for the tech stack/concept: '{stack}'.\n"
            "Guidelines:\n"
            "- ideas: Suggest a production-grade application idea with detailed descriptions of core features, security protocols, and architecture patterns.\n"
            "- folder_structure: Provide a complete, highly organized directory tree diagram showcasing all layers (backend source code, controllers, services, database config, and frontend client views) showcasing src files, tests, and configuration assets.\n"
            "- api_suggestions: List specific REST API endpoints, detailing HTTP verbs, exact paths, expected query/path parameters, request payloads, and response status codes.\n"
            "- database_design: Detail a database design schema indicating table fields, data types, relationships (primary/foreign keys), indexing recommendations, and query performance optimizations.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "ideas": "Production application idea description",\n'
            '  "folder_structure": "Detailed directory tree",\n'
            '  "api_suggestions": "REST API routes endpoints details",\n'
            '  "database_design": "Database tables schema details"\n'
            "}"
        )
        return self._invoke_json(prompt)

    def generate_interview_question(self, role: str) -> dict:
        prompt = (
            f"Generate a mock technical or HR interview question for the following role: '{role}'.\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "question": "The technical or behavioral interview question",\n'
            '  "expected_points": "Key concepts or keywords expected in a perfect answer"\n'
            "}"
        )
        return self._invoke_json(prompt)

    def evaluate_interview_answer(self, question: str, answer: str) -> dict:
        prompt = (
            f"Question: {question}\n"
            f"User's Answer: {answer}\n\n"
            "Strict Evaluation Guidelines:\n"
            "1. Evaluate the user's answer strictly based on correctness, technical depth, and keyword matches.\n"
            "2. If the user's answer is extremely short (e.g. less than 5-10 words, or 'dont know'), or completely irrelevant, YOU MUST ASSIGN A SCORE OF 0 to 10 OUT OF 100.\n"
            "3. If the answer is basic and missing depth, assign a moderate score of 30 to 60.\n"
            "4. Only assign a score of 80+ if the user provides a detailed explanation covering the technical concepts.\n"
            "5. Provide constructive feedback and a clean, perfect, production-grade model answer.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "score": 0,\n'
            '  "feedback": "Critique on what was covered and what was missing",\n'
            '  "model_answer": "Suggested ideal answer to the question"\n'
            "}"
        )
        result = self._invoke_json(prompt)
        clean_ans = answer.strip().lower().replace(".", "").replace(",", "").replace("!", "")
        word_count = len(clean_ans.split())
        lazy_words = ["easy", "simple", "dont know", "don't know", "skip", "pass", "ok", "fine", "nothing", "no idea"]
        is_lazy = any(w in clean_ans for w in lazy_words) or word_count < 10
        if is_lazy:
            if "score" in result:
                result["score"] = 5
                result["feedback"] = "Your response is too short or non-technical. Please provide a detailed explanation to demonstrate your expertise."
            else:
                result = {
                    "score": 5,
                    "feedback": "Your response is too short or non-technical. Please provide a detailed explanation to demonstrate your expertise.",
                    "model_answer": "A proper explanation should cover the architectural tradeoffs and technical details."
                }
        return result

    def analyze_resume(self, resume_text: str) -> dict:
        prompt = (
            f"Analyze the following resume text:\n\n{resume_text}\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "ats_score": 85,\n'
            '  "summary": "Executive summary of candidate profile strengths",\n'
            '  "missing_skills": ["skill1", "skill2"],\n'
            '  "improvement_suggestions": ["suggestion1", "suggestion2"],\n'
            '  "feedback": "General evaluator comments and suggestions"\n'
            "}"
        )
        return self._invoke_json(prompt)

    def compare_jd(self, resume_text: str, jd_text: str) -> dict:
        prompt = (
            f"Resume Text:\n{resume_text}\n\n"
            f"Job Description Text:\n{jd_text}\n\n"
            "Compare them. You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "match_percentage": 70,\n'
            '  "skill_gap_analysis": ["gap1", "gap2"],\n'
            '  "missing_technologies": ["tech1", "tech2"],\n'
            '  "recommended_learning_path": ["step1", "step2"],\n'
            '  "interview_prep_topics": ["topic1", "topic2"]\n'
            "}"
        )
        return self._invoke_json(prompt)

    def optimize_bullet_point(self, bullet: str, target_role: str = "") -> dict:
        prompt = (
            f"Original Resume Bullet Point:\n\"{bullet}\"\n"
            f"Target Role (if any): {target_role or 'Software Engineer'}\n\n"
            "Generate 3 distinct, production-grade, metric-driven ATS resume bullet point improvements.\n"
            "Each must follow the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.\n"
            "Include strong action verbs, technical specifics, and quantified business impact metrics.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "original": "The original input bullet",\n'
            '  "critique": "Brief 1-2 sentence critique explaining what was missing",\n'
            '  "variations": [\n'
            '    {\n'
            '      "label": "Metric & Performance Focused",\n'
            '      "bullet": "High-impact bullet with latency/throughput percentage improvements",\n'
            '      "action_verb": "Architected",\n'
            '      "metric_highlight": "reduced latency by 35%"\n'
            '    },\n'
            '    {\n'
            '      "label": "Scale & Architecture Focused",\n'
            '      "bullet": "Focus on architectural design patterns and high concurrency",\n'
            '      "action_verb": "Engineered",\n'
            '      "metric_highlight": "scaling to 100k+ DAU"\n'
            '    },\n'
            '    {\n'
            '      "label": "Product & Business Impact",\n'
            '      "bullet": "Focus on user adoption, cost savings, or business deliverables",\n'
            '      "action_verb": "Spearheaded",\n'
            '      "metric_highlight": "saving 20+ dev hours weekly"\n'
            '    }\n'
            '  ]\n'
            "}"
        )
        return self._invoke_json(prompt)

    def generate_daily_challenge(self, career_path: str = "Full Stack Engineer") -> dict:
        prompt = (
            f"Career Path: {career_path}\n\n"
            "Generate a quick 1-question multiple-choice technical drill testing core conceptual knowledge.\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "title": "Topic / Domain (e.g., PostgreSQL Indexing, React Hooks, System Design)",\n'
            '  "question": "Clear, concise technical scenario question",\n'
            '  "options": [\n'
            '    "Option A text",\n'
            '    "Option B text",\n'
            '    "Option C text",\n'
            '    "Option D text"\n'
            '  ],\n'
            '  "correct_index": 1,\n'
            '  "explanation": "Concise 2-sentence explanation of why the correct answer is right."\n'
            "}"
        )
        return self._invoke_json(prompt)

ai_service = AIService()
