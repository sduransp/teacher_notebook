from fastapi import APIRouter, UploadFile, File
from typing import List, Dict
from app.services.pdf_parser import parse_students_from_pdf
from app.schemas.students import Student

router = APIRouter()

@router.post("/students", response_model=List[Student])
async def import_students(file: UploadFile = File(...)):
    """
    Receive a PDF upload, parse student names, and return
    a JSON list of {"id": int, "full_name": str}.
    """
    students = parse_students_from_pdf(file.file)
    return students