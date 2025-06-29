from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict
from app.services.pdf_parser import parse_students_from_pdf
from app.schemas.students import Student, StudentRecord, StudentCreate
from app.services.student_service     import student_data_service

router = APIRouter()

@router.post("/import/students", response_model=List[Student])
async def import_students(file: UploadFile = File(...)):
    """
    Receive a PDF upload, parse student names, and return
    a JSON list of {"id": int, "full_name": str}.
    """
    students = parse_students_from_pdf(file.file)
    return students

@router.post("/students/add", response_model=List[StudentRecord])
async def add_students(payload: Dict[str, List[StudentCreate]]):
    """
    Add checked students to global data structure.
    Prevent duplicates by full_name.
    Persist to disk.
    """
    new_students = [s.dict() for s in payload["students"]]
    added = student_data_service.add_students(new_students)
    if not added:
        raise HTTPException(status_code=400, detail="No new students were added.")
    return added

@router.get(
    "/students",
    response_model=List[StudentRecord],
    summary="List all persisted students"
)
async def list_students():
    """
    Return every student from memory + alumnos.json:
     - id
    - full_name
    - ciclos
     - modulos
    """
    return student_data_service.list_students()