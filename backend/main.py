from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

# --- DATABASE ---
DATABASE_URL = "sqlite:///./students.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class StudentDB(Base):
    __tablename__ = "students"
    student_id = Column(String, primary_key=True)
    name = Column(String)
    birth_year = Column(Integer)
    major = Column(String)
    gpa = Column(Float)

Base.metadata.create_all(bind=engine)

# --- SCHEMA ---
class StudentSchema(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float

# --- APP ---
app = FastAPI()

# Fix CORS triệt để
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(StudentDB).all()

@app.post("/students")
def add_student(s: StudentSchema, db: Session = Depends(get_db)):
    # Xóa bản ghi cũ nếu trùng ID để tránh lỗi Primary Key
    db.query(StudentDB).filter(StudentDB.student_id == s.student_id).delete()
    new_student = StudentDB(**s.dict())
    db.add(new_student)
    db.commit()
    return {"message": "Success"}

@app.put("/students/{sid}")
def update_student(sid: str, s: StudentSchema, db: Session = Depends(get_db)):
    db_s = db.query(StudentDB).filter(StudentDB.student_id == sid).first()
    if not db_s: raise HTTPException(404, "Not found")
    for key, value in s.dict().items():
        setattr(db_s, key, value)
    db.commit()
    return {"message": "Updated"}

@app.delete("/students/{sid}")
def delete_student(sid: str, db: Session = Depends(get_db)):
    db.query(StudentDB).filter(StudentDB.student_id == sid).delete()
    db.commit()
    return {"message": "Deleted"}