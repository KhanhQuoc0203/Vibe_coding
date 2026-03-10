from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from fastapi.responses import FileResponse
import os

# --- CẤU HÌNH DATABASE ---
DATABASE_URL = "sqlite:///./students.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS ---
class ClassDB(Base):
    __tablename__ = "classes"
    class_id = Column(String, primary_key=True)
    class_name = Column(String)
    advisor = Column(String, default="Chưa rõ")
    students = relationship("StudentDB", back_populates="student_class")

class StudentDB(Base):
    __tablename__ = "students"
    student_id = Column(String, primary_key=True)
    name = Column(String)
    birth_year = Column(Integer)
    major = Column(String)
    gpa = Column(Float)
    class_id = Column(String, ForeignKey("classes.class_id"))
    student_class = relationship("ClassDB", back_populates="students")

Base.metadata.create_all(bind=engine)

# --- SCHEMAS ---
class StudentSchema(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: str

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- API ENDPOINTS ---

@app.get("/students")
def get_students(name: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(StudentDB)
    if name:
        # Tìm kiếm không phân biệt hoa thường
        query = query.filter(StudentDB.name.ilike(f"%{name}%"))
    return query.all()

@app.post("/students")
def add_student(s: StudentSchema, db: Session = Depends(get_db)):
    if not db.query(ClassDB).filter(ClassDB.class_id == s.class_id).first():
        db.add(ClassDB(class_id=s.class_id, class_name=f"Lớp {s.class_id}"))
    
    db.query(StudentDB).filter(StudentDB.student_id == s.student_id).delete()
    db.add(StudentDB(**s.dict()))
    db.commit()
    return {"message": "Success"}

@app.delete("/students/{sid}")
def delete_student(sid: str, db: Session = Depends(get_db)):
    db.query(StudentDB).filter(StudentDB.student_id == sid).delete()
    db.commit()
    return {"message": "Deleted"}

@app.get("/statistics")
def get_stats(db: Session = Depends(get_db)):
    df = pd.read_sql("SELECT * FROM students", engine)
    if df.empty: return {"total": 0, "avg_gpa": 0}
    return {"total": len(df), "avg_gpa": round(df['gpa'].mean(), 2)}

@app.get("/export-csv")
def export_csv():
    df = pd.read_sql("SELECT * FROM students", engine)
    file_path = "students_export.csv"
    df.to_csv(file_path, index=False, encoding='utf-8-sig')
    return FileResponse(file_path, filename="students.csv")