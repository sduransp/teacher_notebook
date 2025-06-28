from pydantic import BaseModel

class Student(BaseModel):
    id: int
    full_name: str

    class Config:
        orm_mode = True