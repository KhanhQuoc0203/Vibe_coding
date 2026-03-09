from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import csv
import os
from fastapi.responses import FileResponse

# --- CẤU HÌNH DATABASE ---
DATABASE_URL = "sqlite:///./students.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELS (Yêu cầu 1 & 2) ---
class ClassDB(Base):
    __tablename__ = "classes"
    class_id = Column(String, primary_key=True)
    class_name = Column(String)
    advisor = Column(String)
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
class ClassSchema(BaseModel):
    class_id: str
    class_name: str
    advisor: str

class StudentSchema(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: str

# --- APP & MIDDLEWARE ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- API ENDPOINTS ---

# Thêm/Cập nhật Lớp học
@app.post("/classes")
def add_class(c: ClassSchema, db: Session = Depends(get_db)):
    db_class = ClassDB(**c.dict())
    db.merge(db_class)
    db.commit()
    return {"status": "success"}

@app.get("/classes")
def get_classes(db: Session = Depends(get_db)):
    return db.query(ClassDB).all()

# Tìm kiếm & Lấy danh sách SV (Yêu cầu 3)
@app.get("/students")
def get_students(name: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(StudentDB)
    if name:
        query = query.filter(StudentDB.name.contains(name))
    return query.all()

@app.post("/students")
def add_student(s: StudentSchema, db: Session = Depends(get_db)):
    db.query(StudentDB).filter(StudentDB.student_id == s.student_id).delete()
    db.add(StudentDB(**s.dict()))
    db.commit()
    return {"status": "success"}

# Thống kê (Yêu cầu 4)
@app.get("/statistics")
def get_stats(db: Session = Depends(get_db)):
    students = db.query(StudentDB).all()
    if not students: return {"total": 0, "avg_gpa": 0, "by_major": {}}
    
    total = len(students)
    avg_gpa = round(sum(s.gpa for s in students) / total, 2)
    by_major = {}
    for s in students:
        by_major[s.major] = by_major.get(s.major, 0) + 1
    return {"total": total, "avg_gpa": avg_gpa, "by_major": by_major}

# Xuất CSV (Yêu cầu 5)
@app.get("/export-csv")
def export_csv(db: Session = Depends(get_db)):
    students = db.query(StudentDB).all()
    file_path = "data_export.csv"
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Name", "Major", "GPA", "Class"])
        for s in students:
            writer.writerow([s.student_id, s.name, s.major, s.gpa, s.class_id])
    return FileResponse(file_path, filename="students.csv")