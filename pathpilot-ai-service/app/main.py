from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from app.services.ai_service import ai_service
from app.services.rag_service import rag_service
from app.utils.parser import extract_text_from_bytes
from app.utils.vector_store import vector_store_manager

app = FastAPI(title="PathPilot AI - Python Engine Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"VALIDATION ERROR DETAIL: {exc.errors()}", flush=True)
    try:
        body = await request.json()
        print(f"VALIDATION REQUEST BODY (json): {body}", flush=True)
    except Exception:
        body = await request.body()
        print(f"VALIDATION REQUEST BODY (raw): {body}", flush=True)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(body)}
    )


# ==========================================
# ROOT & HEALTH ENDPOINTS (For Keep-Alive & Monitoring)
# ==========================================

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "VertexPath AI Engine",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "VertexPath AI Engine"}

# ==========================================
# REQUEST BODY SCHEMAS
# ==========================================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    profile: Optional[dict] = None

class RoadmapRequest(BaseModel):
    topic: str

class ProjectRequest(BaseModel):
    stack: str

class InterviewGenerateRequest(BaseModel):
    role: str

class InterviewEvaluateRequest(BaseModel):
    question: str
    answer: str

class RagQueryRequest(BaseModel):
    userId: str
    query: str

class BulletOptimizeRequest(BaseModel):
    bullet: str
    targetRole: Optional[str] = "Software Engineer"

class DailyChallengeRequest(BaseModel):
    careerPath: Optional[str] = "Full Stack Engineer"

# ==========================================
# API ROUTE HANDLERS
# ==========================================

@app.post("/api/ai/resume/optimize-bullet")
def optimize_bullet(request: BulletOptimizeRequest):
    try:
        return ai_service.optimize_bullet_point(request.bullet, request.targetRole)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bullet optimization failed: {str(e)}")

@app.post("/api/ai/daily-challenge")
def daily_challenge(request: DailyChallengeRequest):
    try:
        return ai_service.generate_daily_challenge(request.careerPath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily challenge generation failed: {str(e)}")

@app.post("/api/ai/chat")
def chat(request: ChatRequest):
    history_list = [{"role": msg.role, "content": msg.content} for msg in request.history]
    response = ai_service.chat_session(request.message, history_list, request.profile)
    return {"response": response}

@app.post("/api/ai/roadmap")
def roadmap(request: RoadmapRequest):
    try:
        return ai_service.generate_roadmap(request.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.post("/api/ai/project")
def project(request: ProjectRequest):
    try:
        return ai_service.generate_project(request.stack)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project generation failed: {str(e)}")

@app.post("/api/ai/interview/generate")
def generate_interview(request: InterviewGenerateRequest):
    try:
        return ai_service.generate_interview_question(request.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview question generation failed: {str(e)}")

@app.post("/api/ai/interview/evaluate")
def evaluate_interview(request: InterviewEvaluateRequest):
    try:
        return ai_service.evaluate_interview_answer(request.question, request.answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview evaluation failed: {str(e)}")

@app.post("/api/ai/analyze-resume")
def analyze_resume(file: UploadFile = File(...)):
    try:
        file_bytes = file.file.read()
        resume_text = extract_text_from_bytes(file_bytes, file.filename)
        return ai_service.analyze_resume(resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/api/ai/compare-jd")
def compare_jd(file: UploadFile = File(...), jd_text: str = Form(...)):
    try:
        file_bytes = file.file.read()
        resume_text = extract_text_from_bytes(file_bytes, file.filename)
        return ai_service.compare_jd(resume_text, jd_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job description matching failed: {str(e)}")

# ==========================================
# RAG INGESTION & QUERY ENDPOINTS
# ==========================================

@app.post("/api/ai/rag/upload")
async def rag_upload(
    userId: str = Form(...),
    documentId: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_bytes = file.file.read()
        raw_text = extract_text_from_bytes(file_bytes, file.filename)
        # Vectorize and index in ChromaDB
        vector_store_manager.add_document(
            user_id=userId,
            document_id=documentId,
            text=raw_text,
            filename=file.filename
        )
        return {"status": "success", "message": f"Document indexed: {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG document upload failed: {str(e)}")

@app.post("/api/ai/rag/query")
async def rag_query(request: RagQueryRequest):
    try:
        return rag_service.answer_query_from_documents(user_id=request.userId, query=request.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG document search failed: {str(e)}")

@app.delete("/api/ai/rag/delete/{document_id}")
async def rag_delete(document_id: str):
    try:
        vector_store_manager.delete_document(document_id)
        return {"status": "success", "message": f"Document indexes deleted: {document_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG document delete failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
