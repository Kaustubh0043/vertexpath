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

        conversation_context = ""
        for item in history[-6:]:  # Keep recent turns for fast prompt token size
            sender = "User" if item.get("role") == "user" else "AI Coach"
            conversation_context += f"{sender}: {item.get('content', '')}\n"

        prompt = f"{conversation_context}User: {message}\nAI Coach:"
        return self._generate(prompt=prompt, json_mode=False, system_instruction=system_instruction)

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


    def generate_outreach_templates(self, company: str, role: str, recipient: str = "", recipient_type: str = "Hiring Manager", tone: str = "Professional & Value-Driven", target_project: str = "") -> dict:
        """Generates 3 distinct high-converting cold email / LinkedIn outreach templates."""
        prompt = (
            f"Generate 3 personalized, high-converting cold outreach templates for a technical candidate.\n"
            f"Target Company: {company}\n"
            f"Target Role: {role}\n"
            f"Recipient Name (if known): {recipient or '[Hiring Manager Name]'}\n"
            f"Recipient Role/Type: {recipient_type}\n"
            f"Tone: {tone}\n"
            f"Candidate Featured Project/Skills: {target_project or 'Modern full-stack systems and clean architecture'}\n\n"
            "Guidelines:\n"
            "- Avoid generic fluff. Highlight specific value, proactive problem solving, and relevant engineering craftsmanship.\n"
            "- Template 1: 'Direct Value Pitch' (focus on technical impact and relevant project showcase).\n"
            "- Template 2: 'Warm Referral / Engineering Team Lead' (focus on shared stack alignment and team culture).\n"
            "- Template 3: '140-Character InMail / Quick DM' (concise mobile-first format for recruiters/founders).\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "company": "' + company + '",\n'
            '  "role": "' + role + '",\n'
            '  "templates": [\n'
            '    {\n'
            '      "type": "Direct Value Pitch",\n'
            '      "channel": "Email / LinkedIn",\n'
            '      "subject": "Subject line with high open rate",\n'
            '      "body": "Full body text with clear paragraph spacing and [Placeholders]",\n'
            '      "hook_strategy": "1-sentence summary of why this template works",\n'
            '      "best_for": "Engineering Managers & Founders"\n'
            '    },\n'
            '    {\n'
            '      "type": "Warm Referral & Tech Alignment",\n'
            '      "channel": "LinkedIn / Email",\n'
            '      "subject": "Subject line",\n'
            '      "body": "Full body text with [Placeholders]",\n'
            '      "hook_strategy": "Strategy summary",\n'
            '      "best_for": "Senior Staff Engineers & Team Leads"\n'
            '    },\n'
            '    {\n'
            '      "type": "Concise 140-Char InMail DM",\n'
            '      "channel": "LinkedIn InMail / DM",\n'
            '      "subject": "Quick intro",\n'
            '      "body": "Concise text under 150 words",\n'
            '      "hook_strategy": "Strategy summary",\n'
            '      "best_for": "Technical Recruiters & Sourcers"\n'
            '    }\n'
            '  ]\n'
            "}"
        )
        return self._invoke_json(prompt)

    def generate_coding_challenge(self, stack: str = "Full Stack", difficulty: str = "Medium", topic: str = "Algorithms & Data Structures") -> dict:
        """Generates a practical coding challenge tailored to target tech stack."""
        prompt = (
            f"Generate a practical, real-world coding challenge for a software engineer.\n"
            f"Tech Stack / Focus: {stack}\n"
            f"Difficulty Level: {difficulty}\n"
            f"Topic Area: {topic}\n\n"
            "Guidelines:\n"
            "- Design a realistic problem commonly asked by top tier tech companies.\n"
            "- Provide starter code in Python and JavaScript/TypeScript.\n"
            "- Provide 2 clear test cases with sample input and expected output.\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "title": "Title of problem",\n'
            '  "difficulty": "' + difficulty + '",\n'
            '  "category": "' + topic + '",\n'
            '  "description": "Clear problem statement and requirements",\n'
            '  "starter_code": {\n'
            '    "python": "def solution(...):\n    pass",\n'
            '    "javascript": "function solution(...) {\n    // your code\n}"\n'
            '  },\n'
            '  "test_cases": [\n'
            '    {\n'
            '      "input": "Input representation",\n'
            '      "expected": "Expected output",\n'
            '      "explanation": "Brief explanation"\n'
            '    }\n'
            '  ],\n'
            '  "hints": ["Hint 1", "Hint 2"]\n'
            "}"
        )
        return self._invoke_json(prompt)

    def evaluate_code_solution(self, problem_title: str, problem_desc: str, code: str, language: str = "python") -> dict:
        """Analyzes code implementation for algorithmic correctness, time/space complexity, and clean code."""
        prompt = (
            f"Problem: {problem_title}\n"
            f"Description: {problem_desc}\n"
            f"Language: {language}\n\n"
            f"Candidate Code Submission:\n```{language}\n{code}\n```\n\n"
            "Evaluate this submission thoroughly.\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "status": "PASS", // "PASS", "NEEDS_OPTIMIZATION", or "SYNTAX_ERROR"\n'
            '  "score": 85, // Integer 0 to 100\n'
            '  "time_complexity": "O(n)",\n'
            '  "space_complexity": "O(1)",\n'
            '  "analysis": "Detailed technical analysis of algorithm logic, edge cases, and efficiency",\n'
            '  "edge_cases_handled": ["List of edge cases correctly handled"],\n'
            '  "edge_cases_missed": ["List of potential edge cases missed"],\n'
            '  "optimized_solution": "Clean, optimized production-grade solution with brief inline comments"\n'
            "}"
        )
        return self._invoke_json(prompt)

    def analyze_compensation(self, role: str, level: str = "Mid-Level", location: str = "Remote / US", base_offer: str = "120000", currency: str = "USD") -> dict:
        """Calculates market compensation benchmarks and writes strategic counter-offer scripts."""
        prompt = (
            f"Analyze compensation benchmarks and formulate negotiation leverage for:\n"
            f"Role: {role}\n"
            f"Experience Level: {level}\n"
            f"Location: {location}\n"
            f"Current Base Offer / Expectation: {base_offer} {currency}\n\n"
            "You MUST respond ONLY with a JSON object matching this schema:\n"
            "{\n"
            '  "market_benchmarks": {\n'
            '    "p25": 100000,\n'
            '    "p50_median": 125000,\n'
            '    "p75": 150000,\n'
            '    "p90": 175000,\n'
            '    "currency": "' + currency + '"\n'
            '  },\n'
            '  "offer_analysis": "Executive assessment of where this offer stands against current tech market rates",\n'
            '  "leverage_points": [\n'
            '    "Leverage point 1 based on skill scarcity",\n'
            '    "Leverage point 2 based on scope of responsibilities"\n'
            '  ],\n'
            '  "counter_offer_scripts": [\n'
            '    {\n'
            '      "style": "Collaborative Value Proposition",\n'
            '      "subject": "Excited about offer / Exploring compensation alignment",\n'
            '      "body": "Professional email body with [Hiring Manager], [Salary] placeholders",\n'
            '      "recommended_when": "Standard polite negotiation focused on market value and enthusiasm"\n'
            '    },\n'
            '    {\n'
            '      "style": "Competing Offer Leverage",\n'
            '      "subject": "Follow-up regarding offer details and decision timeline",\n'
            '      "body": "Professional email body leveraging secondary pipeline discussions",\n'
            '      "recommended_when": "When you have active interview stages or competing timelines"\n'
            '    },\n'
            '    {\n'
            '      "style": "Total Rewards & Equity Buffer",\n'
            '      "subject": "Exploring overall compensation package structure",\n'
            '      "body": "Email requesting sign-on bonus, equity grants, or accelerated review if base is capped",\n'
            '      "recommended_when": "When base salary bands are rigid and non-negotiable"\n'
            '    }\n'
            '  ]\n'
            "}"
        )
        return self._invoke_json(prompt)

ai_service = AIService()


def get_chat_model():
    return ai_service
