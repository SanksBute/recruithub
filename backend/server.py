from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import io
import base64
from enum import Enum
import re
import pdfplumber
from docx import Document
from typing import Union
import csv
from io import StringIO
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add root route
@api_router.get("/")
async def root():
    return {"message": "Recruitment Management API", "status": "running"}

# Ensure upload directories exist
UPLOADS_DIR = ROOT_DIR / 'uploads'
JD_DIR = UPLOADS_DIR / 'jds'
RESUME_DIR = UPLOADS_DIR / 'resumes'
JD_DIR.mkdir(parents=True, exist_ok=True)
RESUME_DIR.mkdir(parents=True, exist_ok=True)

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    TEAM_LEADER = "team_leader"
    RECRUITER = "recruiter"

class WorkMode(str, Enum):
    ONSITE = "onsite"
    HYBRID = "hybrid"
    REMOTE = "remote"

class InterviewMode(str, Enum):
    ONLINE = "online"
    FACE_TO_FACE = "face_to_face"
    TELEPHONIC = "telephonic"

class CandidateStatus(str, Enum):
    SOURCED = "sourced"
    SHORTLISTED = "shortlisted"
    APPROVED = "approved"
    REJECTED = "rejected"
    SHARED_WITH_CLIENT = "shared_with_client"
    CLIENT_REVIEW = "client_review"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    SELECTED = "selected"
    ON_HOLD = "on_hold"
    NO_ACTION = "no_action"

class PositionStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    CLOSED = "closed"

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    industry: str
    organization_type: str
    headquarter_location: str
    other_branches: Optional[str] = None
    website: Optional[str] = None
    core_business: str
    contact_emails: List[str] = []
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    client_name: str
    industry: str
    organization_type: str
    headquarter_location: str
    other_branches: Optional[str] = None
    website: Optional[str] = None
    core_business: str
    contact_emails: List[str] = []

class Position(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    job_title: str
    department: str
    num_openings: int
    reason_for_hiring: str
    team_size: Optional[int] = None
    location: str
    work_mode: WorkMode
    working_days: str
    qualification: str
    experience: str
    must_have_skills: List[str] = []
    good_to_have_skills: List[str] = []
    gender_preference: Optional[str] = None
    jd_file: Optional[str] = None
    assigned_recruiters: List[str] = []
    status: PositionStatus = PositionStatus.OPEN
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PositionCreate(BaseModel):
    client_id: str
    job_title: str
    department: str
    num_openings: int
    reason_for_hiring: str
    team_size: Optional[int] = None
    location: str
    work_mode: WorkMode
    working_days: str
    qualification: str
    experience: str
    must_have_skills: List[str] = []
    good_to_have_skills: List[str] = []
    gender_preference: Optional[str] = None
    assigned_recruiters: List[str] = []

class Candidate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    contact_number: str
    qualification: str
    industry_sector: str
    current_designation: str
    department: str
    current_location: str
    current_ctc: float
    years_of_experience: float
    expected_ctc: float
    notice_period: str
    resume_file: Optional[str] = None
    position_id: str
    status: CandidateStatus = CandidateStatus.SOURCED
    added_by: str
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    contact_number: str
    qualification: str
    industry_sector: str
    current_designation: str
    department: str
    current_location: str
    current_ctc: float
    years_of_experience: float
    expected_ctc: float
    notice_period: str
    position_id: str

class CandidateSearch(BaseModel):
    keywords: Optional[str] = None
    current_city: Optional[str] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    qualification: Optional[str] = None
    industry: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    gender: Optional[str] = None

class ProfileAction(BaseModel):
    candidate_id: str
    action: str  # approve, reject, shortlist
    reason: Optional[str] = None

class Interview(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str
    position_id: str
    interview_mode: InterviewMode
    interview_date: datetime
    action_plan: Optional[str] = None
    feedback: Optional[str] = None
    result: Optional[str] = None
    scheduled_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InterviewCreate(BaseModel):
    candidate_id: str
    position_id: str
    interview_mode: InterviewMode
    interview_date: datetime
    action_plan: Optional[str] = None

class EmailDraft(BaseModel):
    to: List[str]
    subject: str
    body: str
    candidate_ids: List[str]

class EmailConfig(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    from_email: str
    use_tls: bool = True

class EmailSend(BaseModel):
    to: List[str]
    subject: str
    body: str
    candidate_ids: List[str] = []
    attachment_base64: Optional[str] = None
    attachment_filename: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str, role: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def check_role(allowed_roles: List[UserRole]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [role.value for role in allowed_roles]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Initialize default admin
@app.on_event("startup")
async def create_default_admin():
    admin_exists = await db.users.find_one({"role": "admin"})
    if not admin_exists:
        admin = User(
            email="admin@recruitment.com",
            name="System Admin",
            role=UserRole.ADMIN
        )
        admin_dict = admin.model_dump()
        admin_dict["password"] = hash_password("Admin@123")
        admin_dict["created_at"] = admin_dict["created_at"].isoformat()
        await db.users.insert_one(admin_dict)
        logger.info("Default admin created: admin@recruitment.com / Admin@123")

# Resume parsing utilities
def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {str(e)}")
        return ""

def extract_email(text: str) -> str:
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else ""

def extract_phone(text: str) -> str:
    """Extract phone number from text"""
    phone_patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\d{10}',
        r'\+\d{12}'
    ]
    for pattern in phone_patterns:
        phones = re.findall(pattern, text)
        if phones:
            return re.sub(r'[^\d+]', '', phones[0])
    return ""

def extract_name(text: str) -> str:
    """Extract name from resume (usually first line or after 'Name:')"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Try to find name after "Name:" label
    for line in lines:
        if re.match(r'(name|full name|candidate name)[\s:]+(.+)', line, re.IGNORECASE):
            match = re.search(r'(name|full name|candidate name)[\s:]+(.+)', line, re.IGNORECASE)
            if match:
                return match.group(2).strip()
    
    # Otherwise, assume first non-empty line is name
    for line in lines[:5]:
        # Skip lines that are likely headers or contact info
        if not re.search(r'(resume|cv|curriculum|email|phone|address)', line, re.IGNORECASE):
            if len(line.split()) <= 4 and len(line) < 50:
                return line
    
    return "Unknown"

def extract_experience_years(text: str) -> float:
    """Extract years of experience from text"""
    experience_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)[\s\w]*(?:of)?\s*(?:experience|exp)',
        r'(?:experience|exp)[\s:]*(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\+?\s*(?:years?|yrs?)'
    ]
    
    for pattern in experience_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return float(matches[0])
    
    return 0.0

def extract_designation(text: str) -> str:
    """Extract current designation from resume"""
    common_titles = [
        'Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Tech Lead',
        'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
        'DevOps Engineer', 'Data Scientist', 'Data Analyst', 'Business Analyst',
        'Project Manager', 'Product Manager', 'Scrum Master',
        'UI/UX Designer', 'Graphic Designer', 'System Administrator',
        'Database Administrator', 'Network Engineer', 'Security Analyst',
        'Quality Assurance Engineer', 'Test Engineer', 'Architect',
        'Consultant', 'Team Leader', 'Manager', 'Director', 'VP', 'CTO', 'CEO'
    ]
    
    text_lower = text.lower()
    
    # Search for designation patterns
    for title in common_titles:
        if title.lower() in text_lower:
            return title
    
    # Try to find designation after keywords
    patterns = [
        r'(?:current role|position|designation|title)[\s:]+([^\n]+)',
        r'(?:working as|employed as)[\s:]+([^\n]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            designation = match.group(1).strip()
            if len(designation) < 50:
                return designation
    
    return 'To be updated'

def extract_location(text: str) -> str:
    """Extract location from resume"""
    # Indian cities pattern
    cities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai',
        'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Noida', 'Gurgaon', 'Gurugram'
    ]
    
    text_lower = text.lower()
    for city in cities:
        if city.lower() in text_lower:
            return city
    
    # Try to find location patterns
    location_patterns = [
        r'(?:location|city|address)[\s:]+([^\n]+)',
        r'(?:based in|residing in)[\s:]+([^\n]+)'
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            if len(location) < 50:
                return location
    
    return 'To be updated'
    """Extract skills from text"""
    common_skills = [
        'Python', 'Java', 'JavaScript', 'React', 'Angular', 'Node.js', 'MongoDB',
        'SQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
        'Machine Learning', 'AI', 'Data Science', 'C++', 'C#', '.NET', 'PHP',
        'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'HTML', 'CSS', 'REST API',
        'GraphQL', 'Redis', 'PostgreSQL', 'MySQL', 'FastAPI', 'Django', 'Flask'
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in common_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return found_skills

def parse_resume(file_path: str) -> dict:
    """Parse resume and extract candidate information"""
    # Determine file type and extract text
    if file_path.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        return None
    
    if not text:
        return None
    
    # Extract information
    candidate_data = {
        'name': extract_name(text),
        'email': extract_email(text),
        'contact_number': extract_phone(text),
        'years_of_experience': extract_experience_years(text),
        'skills': extract_skills(text),
        'current_designation': extract_designation(text),
        'current_location': extract_location(text),
        'raw_text': text[:500]  # Store first 500 chars for reference
    }
    
    return candidate_data

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate, current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER]))):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    return {"message": "User created successfully", "user": user}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password"}
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_response = {k: v for k, v in current_user.items() if k != "password"}
    return user_response

# User routes
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER]))):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

# Client routes
@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    client = Client(**client_data.model_dump(), created_by=current_user["id"])
    client_dict = client.model_dump()
    client_dict["created_at"] = client_dict["created_at"].isoformat()
    await db.clients.insert_one(client_dict)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    
    if role in ["admin", "manager"]:
        clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    elif role == "team_leader":
        # Get positions assigned to this team leader
        positions = await db.positions.find({"created_by": current_user["id"]}, {"_id": 0, "client_id": 1}).to_list(1000)
        client_ids = list(set([p["client_id"] for p in positions]))
        clients = await db.clients.find({"id": {"$in": client_ids}}, {"_id": 0}).to_list(1000)
    else:  # recruiter
        # Get positions assigned to this recruiter
        positions = await db.positions.find({"assigned_recruiters": current_user["id"]}, {"_id": 0, "client_id": 1}).to_list(1000)
        client_ids = list(set([p["client_id"] for p in positions]))
        clients = await db.clients.find({"id": {"$in": client_ids}}, {"_id": 0}).to_list(1000)
    
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate, current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEADER]))):
    result = await db.clients.update_one(
        {"id": client_id},
        {"$set": client_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    updated_client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    return updated_client

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: dict = Depends(check_role([UserRole.ADMIN]))):
    # Check if client has positions
    positions = await db.positions.find_one({"client_id": client_id}, {"_id": 0})
    if positions:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing positions")
    
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client deleted successfully"}

# Position routes
@api_router.post("/positions", response_model=Position)
async def create_position(position_data: PositionCreate, current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEADER]))):
    position = Position(**position_data.model_dump(), created_by=current_user["id"])
    position_dict = position.model_dump()
    position_dict["created_at"] = position_dict["created_at"].isoformat()
    await db.positions.insert_one(position_dict)
    return position

@api_router.get("/positions", response_model=List[Position])
async def get_positions(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    
    if role in ["admin", "manager"]:
        positions = await db.positions.find({}, {"_id": 0}).to_list(1000)
    elif role == "team_leader":
        positions = await db.positions.find({"created_by": current_user["id"]}, {"_id": 0}).to_list(1000)
    else:  # recruiter
        positions = await db.positions.find({"assigned_recruiters": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    return positions

@api_router.get("/positions/{position_id}", response_model=Position)
async def get_position(position_id: str, current_user: dict = Depends(get_current_user)):
    position = await db.positions.find_one({"id": position_id}, {"_id": 0})
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    return position

@api_router.put("/positions/{position_id}", response_model=Position)
async def update_position(position_id: str, position_data: PositionCreate, current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEADER]))):
    result = await db.positions.update_one(
        {"id": position_id},
        {"$set": position_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Position not found")
    
    updated_position = await db.positions.find_one({"id": position_id}, {"_id": 0})
    return updated_position

@api_router.post("/positions/{position_id}/upload-jd")
async def upload_jd(position_id: str, file: UploadFile = File(...), current_user: dict = Depends(check_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.TEAM_LEADER]))):
    file_path = JD_DIR / f"{position_id}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    await db.positions.update_one(
        {"id": position_id},
        {"$set": {"jd_file": str(file_path.name)}}
    )
    return {"message": "JD uploaded successfully", "filename": file_path.name}

# Candidate routes
@api_router.post("/candidates", response_model=Candidate)
async def create_candidate(candidate_data: CandidateCreate, current_user: dict = Depends(get_current_user)):
    candidate = Candidate(**candidate_data.model_dump(), added_by=current_user["id"])
    candidate_dict = candidate.model_dump()
    candidate_dict["created_at"] = candidate_dict["created_at"].isoformat()
    await db.candidates.insert_one(candidate_dict)
    return candidate

@api_router.post("/candidates/bulk-upload")
async def bulk_upload_candidates(
    position_id: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Bulk upload resumes and automatically extract candidate information.
    Supports PDF and DOCX files.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    results = {
        "successful": [],
        "failed": [],
        "total": len(files)
    }
    
    # Verify position exists
    position = await db.positions.find_one({"id": position_id}, {"_id": 0})
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
    
    for file in files:
        try:
            # Validate file type
            if not (file.filename.lower().endswith('.pdf') or file.filename.lower().endswith('.docx')):
                results["failed"].append({
                    "filename": file.filename,
                    "error": "Unsupported file format. Only PDF and DOCX are supported."
                })
                continue
            
            # Save file temporarily
            file_path = RESUME_DIR / f"temp_{uuid.uuid4()}_{file.filename}"
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Parse resume
            parsed_data = parse_resume(str(file_path))
            
            if not parsed_data or not parsed_data.get('name') or not parsed_data.get('email'):
                results["failed"].append({
                    "filename": file.filename,
                    "error": "Could not extract required information (name/email) from resume"
                })
                # Clean up temp file
                if file_path.exists():
                    file_path.unlink()
                continue
            
            # Check if candidate already exists
            existing = await db.candidates.find_one({"email": parsed_data['email']}, {"_id": 0})
            if existing:
                results["failed"].append({
                    "filename": file.filename,
                    "error": f"Candidate with email {parsed_data['email']} already exists"
                })
                # Clean up temp file
                if file_path.exists():
                    file_path.unlink()
                continue
            
            # Create candidate with default values for missing fields
            candidate = Candidate(
                name=parsed_data['name'],
                email=parsed_data['email'],
                contact_number=parsed_data.get('contact_number', 'Not provided'),
                qualification='To be updated',
                industry_sector='To be updated',
                current_designation='To be updated',
                department='To be updated',
                current_location='To be updated',
                current_ctc=0.0,
                years_of_experience=parsed_data.get('years_of_experience', 0.0),
                expected_ctc=0.0,
                notice_period='To be updated',
                position_id=position_id,
                added_by=current_user["id"],
                resume_file=file.filename
            )
            
            candidate_dict = candidate.model_dump()
            candidate_dict["created_at"] = candidate_dict["created_at"].isoformat()
            
            # Save to database
            await db.candidates.insert_one(candidate_dict)
            
            # Rename temp file to permanent name
            permanent_path = RESUME_DIR / f"{candidate.id}_{file.filename}"
            file_path.rename(permanent_path)
            
            # Update candidate with permanent file path
            await db.candidates.update_one(
                {"id": candidate.id},
                {"$set": {"resume_file": permanent_path.name}}
            )
            
            results["successful"].append({
                "filename": file.filename,
                "candidate_name": parsed_data['name'],
                "candidate_email": parsed_data['email'],
                "candidate_id": candidate.id,
                "extracted_skills": parsed_data.get('skills', []),
                "years_of_experience": parsed_data.get('years_of_experience', 0.0)
            })
            
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            results["failed"].append({
                "filename": file.filename,
                "error": str(e)
            })
            # Clean up temp file if it exists
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
    
    return results

@api_router.get("/candidates", response_model=List[Candidate])
async def get_candidates(position_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    
    if position_id:
        query["position_id"] = position_id
    
    role = current_user["role"]
    if role == "recruiter":
        # Only see own candidates
        query["added_by"] = current_user["id"]
    
    candidates = await db.candidates.find(query, {"_id": 0}).to_list(1000)
    return candidates

@api_router.get("/candidates/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: str, current_user: dict = Depends(get_current_user)):
    candidate = await db.candidates.find_one({"id": candidate_id}, {"_id": 0})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@api_router.post("/candidates/{candidate_id}/upload-resume")
async def upload_resume(candidate_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_path = RESUME_DIR / f"{candidate_id}_{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    await db.candidates.update_one(
        {"id": candidate_id},
        {"$set": {"resume_file": str(file_path.name)}}
    )
    return {"message": "Resume uploaded successfully", "filename": file_path.name}

@api_router.post("/candidates/search", response_model=List[Candidate])
async def search_candidates(search_params: CandidateSearch, current_user: dict = Depends(get_current_user)):
    query = {}
    
    if search_params.keywords:
        query["$or"] = [
            {"name": {"$regex": search_params.keywords, "$options": "i"}},
            {"current_designation": {"$regex": search_params.keywords, "$options": "i"}},
            {"department": {"$regex": search_params.keywords, "$options": "i"}}
        ]
    
    if search_params.current_city:
        query["current_location"] = {"$regex": search_params.current_city, "$options": "i"}
    
    if search_params.min_experience is not None:
        query["years_of_experience"] = {"$gte": search_params.min_experience}
    
    if search_params.max_experience is not None:
        query.setdefault("years_of_experience", {})["$lte"] = search_params.max_experience
    
    if search_params.min_salary is not None:
        query["current_ctc"] = {"$gte": search_params.min_salary}
    
    if search_params.max_salary is not None:
        query.setdefault("current_ctc", {})["$lte"] = search_params.max_salary
    
    if search_params.qualification:
        query["qualification"] = {"$regex": search_params.qualification, "$options": "i"}
    
    if search_params.industry:
        query["industry_sector"] = {"$regex": search_params.industry, "$options": "i"}
    
    if search_params.department:
        query["department"] = {"$regex": search_params.department, "$options": "i"}
    
    if search_params.designation:
        query["current_designation"] = {"$regex": search_params.designation, "$options": "i"}
    
    candidates = await db.candidates.find(query, {"_id": 0}).to_list(1000)
    return candidates

# Profile workflow routes
@api_router.post("/candidates/{candidate_id}/action")
async def candidate_action(candidate_id: str, action_data: ProfileAction, current_user: dict = Depends(check_role([UserRole.TEAM_LEADER, UserRole.MANAGER, UserRole.ADMIN]))):
    update_data = {}
    
    if action_data.action == "approve":
        update_data["status"] = CandidateStatus.APPROVED.value
    elif action_data.action == "reject":
        if not action_data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        update_data["status"] = CandidateStatus.REJECTED.value
        update_data["rejection_reason"] = action_data.reason
    elif action_data.action == "shortlist":
        update_data["status"] = CandidateStatus.SHORTLISTED.value
    
    result = await db.candidates.update_one(
        {"id": candidate_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return {"message": f"Candidate {action_data.action}ed successfully"}

# Profile sharing and PDF generation
@api_router.post("/candidates/generate-pdf")
async def generate_candidate_pdf(candidate_ids: List[str] = [], current_user: dict = Depends(check_role([UserRole.MANAGER, UserRole.TEAM_LEADER, UserRole.ADMIN]))):
    candidates = await db.candidates.find({"id": {"$in": candidate_ids}}, {"_id": 0}).to_list(100)
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found")
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=6
    )
    
    # Add company header
    header_text = Paragraph('<font color="#4F46E5"><b>RecruitHub</b></font>', styles['Heading1'])
    elements.append(header_text)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Add each candidate
    for idx, candidate in enumerate(candidates):
        if idx > 0:
            elements.append(Spacer(1, 0.3 * inch))
        
        # Candidate name as title
        elements.append(Paragraph(f'<b>{candidate["name"]}</b>', title_style))
        
        # Candidate details table
        data = [
            ['Qualification:', candidate['qualification']],
            ['Current Designation:', candidate['current_designation']],
            ['Department:', candidate['department']],
            ['Industry:', candidate['industry_sector']],
            ['Location:', candidate['current_location']],
            ['Experience:', f'{candidate["years_of_experience"]} years'],
            ['Current CTC:', f'₹{candidate["current_ctc"]} LPA'],
            ['Expected CTC:', f'₹{candidate["expected_ctc"]} LPA'],
            ['Notice Period:', candidate['notice_period']]
        ]
        
        t = Table(data, colWidths=[2*inch, 4*inch])
        t.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
            ('FONT', (1, 0), (1, -1), 'Helvetica', 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(t)
        
        # Note about contact details
        elements.append(Spacer(1, 0.2 * inch))
        note = Paragraph('<i><font color="#888888">Contact details available upon request.</font></i>', styles['Normal'])
        elements.append(note)
        
        if idx < len(candidates) - 1:
            elements.append(Spacer(1, 0.4 * inch))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    # Return as base64 for preview
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
    
    return {
        "pdf_base64": pdf_base64,
        "filename": f"candidates_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.pdf"
    }

@api_router.post("/candidates/share-email-draft")
async def create_email_draft(email_data: EmailDraft, current_user: dict = Depends(check_role([UserRole.MANAGER, UserRole.TEAM_LEADER, UserRole.ADMIN]))):
    # Mark candidates as shared
    await db.candidates.update_many(
        {"id": {"$in": email_data.candidate_ids}},
        {"$set": {"status": CandidateStatus.SHARED_WITH_CLIENT.value}}
    )
    
    # Log the sharing action
    sharing_log = {
        "id": str(uuid.uuid4()),
        "candidate_ids": email_data.candidate_ids,
        "shared_by": current_user["id"],
        "shared_to": email_data.to,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.profile_sharing_log.insert_one(sharing_log)
    
    return {"message": "Email draft created successfully", "email": email_data}

# Interview routes
@api_router.post("/interviews", response_model=Interview)
async def create_interview(interview_data: InterviewCreate, current_user: dict = Depends(check_role([UserRole.MANAGER, UserRole.TEAM_LEADER, UserRole.ADMIN]))):
    interview = Interview(**interview_data.model_dump(), scheduled_by=current_user["id"])
    interview_dict = interview.model_dump()
    interview_dict["created_at"] = interview_dict["created_at"].isoformat()
    interview_dict["interview_date"] = interview_dict["interview_date"].isoformat()
    
    await db.interviews.insert_one(interview_dict)
    
    # Update candidate status
    await db.candidates.update_one(
        {"id": interview_data.candidate_id},
        {"$set": {"status": CandidateStatus.INTERVIEW_SCHEDULED.value}}
    )
    
    return interview

@api_router.get("/interviews", response_model=List[Interview])
async def get_interviews(current_user: dict = Depends(get_current_user)):
    interviews = await db.interviews.find({}, {"_id": 0}).to_list(1000)
    return interviews

@api_router.put("/interviews/{interview_id}")
async def update_interview(interview_id: str, feedback: Optional[str] = None, result: Optional[str] = None, current_user: dict = Depends(check_role([UserRole.MANAGER, UserRole.TEAM_LEADER, UserRole.ADMIN]))):
    update_data = {}
    if feedback:
        update_data["feedback"] = feedback
    if result:
        update_data["result"] = result
    
    result = await db.interviews.update_one(
        {"id": interview_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {"message": "Interview updated successfully"}

# Dashboard statistics
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    user_id = current_user["id"]
    
    stats = {}
    
    if role in ["admin", "manager"]:
        stats["total_clients"] = await db.clients.count_documents({})
        stats["total_positions"] = await db.positions.count_documents({})
        stats["open_positions"] = await db.positions.count_documents({"status": "open"})
    elif role == "team_leader":
        positions = await db.positions.find({"created_by": user_id}, {"_id": 0, "client_id": 1}).to_list(1000)
        client_ids = list(set([p["client_id"] for p in positions]))
        stats["assigned_clients"] = len(client_ids)
        stats["assigned_positions"] = len(positions)
    else:  # recruiter
        positions = await db.positions.find({"assigned_recruiters": user_id}, {"_id": 0}).to_list(1000)
        stats["assigned_positions"] = len(positions)
    
    stats["profiles_shared"] = await db.candidates.count_documents({"status": "shared_with_client"})
    stats["interviews_scheduled"] = await db.interviews.count_documents({})
    stats["candidates_selected"] = await db.candidates.count_documents({"status": "selected"})
    stats["feedback_pending"] = await db.candidates.count_documents({"status": "client_review"})
    
    return stats

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()