from pydantic import BaseModel

class Student(BaseModel):
    id: int
    full_name: str

    class Config:
        orm_mode = True

class StudentCreate(BaseModel):
    full_name: str

class StudentRecord(BaseModel):
    id: int
    full_name: str
    ciclos: list[str]
    modulos: list[str]