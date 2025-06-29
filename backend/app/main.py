from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.students import router as students_router

app = FastAPI(
    title="Teacher CheatSheet API",
    description="APP for managing student grades according to the latest Spanish Law on Education.",
    version="0.1.0",
)

# (Optional) Enable CORS so your React frontend can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the students-import router
app.include_router(
    students_router,
    prefix="",
    tags=["students"],
)

@app.get("/", summary="Root endpoint")
async def read_root():
    return {"message": "Notes Management API is running"}

# If you run directly with Uvicorn:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000