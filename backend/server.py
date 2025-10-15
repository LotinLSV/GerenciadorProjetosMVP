from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ===== MODELS =====

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "team_member"  # admin, project_manager, team_member

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    user: User

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"  # active, completed, on_hold
    budget: Optional[float] = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BaselineBase(BaseModel):
    name: str
    snapshot_data: dict

class ProjectBaseline(BaselineBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    frozen_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    frozen_by_user_id: str

class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_id: str
    assigned_to_user_id: Optional[str] = None
    status: str = "todo"  # todo, in_progress, completed
    priority: str = "medium"  # low, medium, high
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_frozen: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskBaseline(BaselineBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    frozen_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    frozen_by_user_id: str

class ResourceBase(BaseModel):
    name: str
    type: str  # person, equipment, software
    availability: str = "available"
    cost_per_hour: Optional[float] = 0.0

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ResourceAllocationBase(BaseModel):
    resource_id: str
    project_id: str
    task_id: Optional[str] = None
    allocated_hours: float
    allocation_date: datetime

class ResourceAllocationCreate(ResourceAllocationBase):
    pass

class ResourceAllocation(ResourceAllocationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class CostBase(BaseModel):
    project_id: str
    category: str
    amount: float
    date: datetime
    description: Optional[str] = None

class CostCreate(CostBase):
    pass

class Cost(CostBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class DocumentBase(BaseModel):
    project_id: str
    category: str  # project-documents, images, relationships
    filename: str
    file_path: str
    uploaded_by_user_id: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RelationshipBase(BaseModel):
    from_entity_type: str  # project, task, resource
    from_entity_id: str
    to_entity_type: str
    to_entity_id: str
    relationship_type: str  # dependency, allocation, relates-to

class RelationshipCreate(RelationshipBase):
    pass

class Relationship(RelationshipBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

# ===== AUTHENTICATION HELPERS =====

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_token(user_id: str, username: str, role: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=7)
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== AUTH ROUTES =====

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop('password')
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password_hash'] = hash_password(password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**{k: v for k, v in user.items() if k != 'password_hash'})
    token = create_token(user_obj.id, user_obj.username, user_obj.role)
    
    return TokenResponse(access_token=token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ===== USER ROUTES =====

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserBase, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": user_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(updated_user['created_at'], str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    return User(**updated_user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ===== PROJECT ROUTES =====

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    project_dict = project_data.model_dump()
    project_obj = Project(**project_dict, owner_id=current_user.id)
    
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['start_date']:
        doc['start_date'] = doc['start_date'].isoformat()
    if doc['end_date']:
        doc['end_date'] = doc['end_date'].isoformat()
    
    await db.projects.insert_one(doc)
    return project_obj

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        # Team members see only projects they're assigned to through tasks
        tasks = await db.tasks.find({"assigned_to_user_id": current_user.id}, {"_id": 0}).to_list(1000)
        project_ids = list(set([task['project_id'] for task in tasks]))
        projects = await db.projects.find({"id": {"$in": project_ids}}, {"_id": 0}).to_list(1000)
    else:
        projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
        if isinstance(project['updated_at'], str):
            project['updated_at'] = datetime.fromisoformat(project['updated_at'])
        if project.get('start_date') and isinstance(project['start_date'], str):
            project['start_date'] = datetime.fromisoformat(project['start_date'])
        if project.get('end_date') and isinstance(project['end_date'], str):
            project['end_date'] = datetime.fromisoformat(project['end_date'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    if isinstance(project['updated_at'], str):
        project['updated_at'] = datetime.fromisoformat(project['updated_at'])
    if project.get('start_date') and isinstance(project['start_date'], str):
        project['start_date'] = datetime.fromisoformat(project['start_date'])
    if project.get('end_date') and isinstance(project['end_date'], str):
        project['end_date'] = datetime.fromisoformat(project['end_date'])
    
    return Project(**project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    update_dict = project_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    if update_dict.get('start_date'):
        update_dict['start_date'] = update_dict['start_date'].isoformat()
    if update_dict.get('end_date'):
        update_dict['end_date'] = update_dict['end_date'].isoformat()
    
    result = await db.projects.update_one(
        {"id": project_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updated_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if isinstance(updated_project['created_at'], str):
        updated_project['created_at'] = datetime.fromisoformat(updated_project['created_at'])
    if isinstance(updated_project['updated_at'], str):
        updated_project['updated_at'] = datetime.fromisoformat(updated_project['updated_at'])
    if updated_project.get('start_date') and isinstance(updated_project['start_date'], str):
        updated_project['start_date'] = datetime.fromisoformat(updated_project['start_date'])
    if updated_project.get('end_date') and isinstance(updated_project['end_date'], str):
        updated_project['end_date'] = datetime.fromisoformat(updated_project['end_date'])
    
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# ===== BASELINE ROUTES =====

@api_router.post("/baselines/project", response_model=ProjectBaseline)
async def create_project_baseline(baseline_data: BaselineBase, project_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    baseline_obj = ProjectBaseline(
        **baseline_data.model_dump(),
        project_id=project_id,
        frozen_by_user_id=current_user.id
    )
    
    doc = baseline_obj.model_dump()
    doc['frozen_date'] = doc['frozen_date'].isoformat()
    
    await db.project_baselines.insert_one(doc)
    return baseline_obj

@api_router.get("/baselines/project/{project_id}", response_model=List[ProjectBaseline])
async def get_project_baselines(project_id: str, current_user: User = Depends(get_current_user)):
    baselines = await db.project_baselines.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for baseline in baselines:
        if isinstance(baseline['frozen_date'], str):
            baseline['frozen_date'] = datetime.fromisoformat(baseline['frozen_date'])
    return baselines

@api_router.post("/baselines/task", response_model=TaskBaseline)
async def create_task_baseline(baseline_data: BaselineBase, task_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    baseline_obj = TaskBaseline(
        **baseline_data.model_dump(),
        task_id=task_id,
        frozen_by_user_id=current_user.id
    )
    
    doc = baseline_obj.model_dump()
    doc['frozen_date'] = doc['frozen_date'].isoformat()
    
    await db.task_baselines.insert_one(doc)
    
    # Mark task as frozen
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"is_frozen": True}}
    )
    
    return baseline_obj

@api_router.get("/baselines/task/{task_id}", response_model=List[TaskBaseline])
async def get_task_baselines(task_id: str, current_user: User = Depends(get_current_user)):
    baselines = await db.task_baselines.find({"task_id": task_id}, {"_id": 0}).to_list(1000)
    for baseline in baselines:
        if isinstance(baseline['frozen_date'], str):
            baseline['frozen_date'] = datetime.fromisoformat(baseline['frozen_date'])
    return baselines

# ===== TASK ROUTES =====

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user)):
    task_dict = task_data.model_dump()
    task_obj = Task(**task_dict)
    
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['start_date']:
        doc['start_date'] = doc['start_date'].isoformat()
    if doc['end_date']:
        doc['end_date'] = doc['end_date'].isoformat()
    
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if project_id:
        query['project_id'] = project_id
    if current_user.role == "team_member":
        query['assigned_to_user_id'] = current_user.id
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task['updated_at'], str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
        if task.get('start_date') and isinstance(task['start_date'], str):
            task['start_date'] = datetime.fromisoformat(task['start_date'])
        if task.get('end_date') and isinstance(task['end_date'], str):
            task['end_date'] = datetime.fromisoformat(task['end_date'])
    return tasks

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskCreate, current_user: User = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.get('is_frozen') and current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Cannot edit frozen task")
    
    update_dict = task_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    if update_dict.get('start_date'):
        update_dict['start_date'] = update_dict['start_date'].isoformat()
    if update_dict.get('end_date'):
        update_dict['end_date'] = update_dict['end_date'].isoformat()
    
    result = await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_dict}
    )
    
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(updated_task['created_at'], str):
        updated_task['created_at'] = datetime.fromisoformat(updated_task['created_at'])
    if isinstance(updated_task['updated_at'], str):
        updated_task['updated_at'] = datetime.fromisoformat(updated_task['updated_at'])
    if updated_task.get('start_date') and isinstance(updated_task['start_date'], str):
        updated_task['start_date'] = datetime.fromisoformat(updated_task['start_date'])
    if updated_task.get('end_date') and isinstance(updated_task['end_date'], str):
        updated_task['end_date'] = datetime.fromisoformat(updated_task['end_date'])
    
    return Task(**updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# ===== RESOURCE ROUTES =====

@api_router.post("/resources", response_model=Resource)
async def create_resource(resource_data: ResourceCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    resource_obj = Resource(**resource_data.model_dump())
    doc = resource_obj.model_dump()
    await db.resources.insert_one(doc)
    return resource_obj

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(current_user: User = Depends(get_current_user)):
    resources = await db.resources.find({}, {"_id": 0}).to_list(1000)
    return resources

@api_router.put("/resources/{resource_id}", response_model=Resource)
async def update_resource(resource_id: str, resource_data: ResourceCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.resources.update_one(
        {"id": resource_id},
        {"$set": resource_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    updated_resource = await db.resources.find_one({"id": resource_id}, {"_id": 0})
    return Resource(**updated_resource)

@api_router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.resources.delete_one({"id": resource_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted"}

# ===== RESOURCE ALLOCATION ROUTES =====

@api_router.post("/allocations", response_model=ResourceAllocation)
async def create_allocation(allocation_data: ResourceAllocationCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    allocation_obj = ResourceAllocation(**allocation_data.model_dump())
    doc = allocation_obj.model_dump()
    doc['allocation_date'] = doc['allocation_date'].isoformat()
    
    await db.resource_allocations.insert_one(doc)
    return allocation_obj

@api_router.get("/allocations", response_model=List[ResourceAllocation])
async def get_allocations(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if project_id:
        query['project_id'] = project_id
    
    allocations = await db.resource_allocations.find(query, {"_id": 0}).to_list(1000)
    for allocation in allocations:
        if isinstance(allocation['allocation_date'], str):
            allocation['allocation_date'] = datetime.fromisoformat(allocation['allocation_date'])
    return allocations

# ===== COST ROUTES =====

@api_router.post("/costs", response_model=Cost)
async def create_cost(cost_data: CostCreate, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    cost_obj = Cost(**cost_data.model_dump())
    doc = cost_obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    
    await db.costs.insert_one(doc)
    return cost_obj

@api_router.get("/costs", response_model=List[Cost])
async def get_costs(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if project_id:
        query['project_id'] = project_id
    
    costs = await db.costs.find(query, {"_id": 0}).to_list(1000)
    for cost in costs:
        if isinstance(cost['date'], str):
            cost['date'] = datetime.fromisoformat(cost['date'])
    return costs

@api_router.delete("/costs/{cost_id}")
async def delete_cost(cost_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.costs.delete_one({"id": cost_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cost not found")
    return {"message": "Cost deleted"}

# ===== DOCUMENT ROUTES =====

@api_router.post("/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate, current_user: User = Depends(get_current_user)):
    doc_obj = Document(**doc_data.model_dump())
    doc = doc_obj.model_dump()
    doc['upload_date'] = doc['upload_date'].isoformat()
    
    await db.documents.insert_one(doc)
    return doc_obj

@api_router.get("/documents", response_model=List[Document])
async def get_documents(project_id: Optional[str] = None, category: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if project_id:
        query['project_id'] = project_id
    if category:
        query['category'] = category
    
    documents = await db.documents.find(query, {"_id": 0}).to_list(1000)
    for document in documents:
        if isinstance(document['upload_date'], str):
            document['upload_date'] = datetime.fromisoformat(document['upload_date'])
    return documents

@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, current_user: User = Depends(get_current_user)):
    result = await db.documents.delete_one({"id": document_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}

# ===== RELATIONSHIP ROUTES =====

@api_router.post("/relationships", response_model=Relationship)
async def create_relationship(rel_data: RelationshipCreate, current_user: User = Depends(get_current_user)):
    rel_obj = Relationship(**rel_data.model_dump())
    doc = rel_obj.model_dump()
    await db.relationships.insert_one(doc)
    return rel_obj

@api_router.get("/relationships", response_model=List[Relationship])
async def get_relationships(project_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {}
    if project_id:
        query['$or'] = [
            {"from_entity_type": "project", "from_entity_id": project_id},
            {"to_entity_type": "project", "to_entity_id": project_id}
        ]
    
    relationships = await db.relationships.find(query, {"_id": 0}).to_list(1000)
    return relationships

@api_router.delete("/relationships/{relationship_id}")
async def delete_relationship(relationship_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.relationships.delete_one({"id": relationship_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"message": "Relationship deleted"}

# ===== STATS ROUTES =====

@api_router.get("/stats/dashboard")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    if current_user.role == "team_member":
        tasks = await db.tasks.find({"assigned_to_user_id": current_user.id}, {"_id": 0}).to_list(1000)
        project_ids = list(set([task['project_id'] for task in tasks]))
        projects = await db.projects.find({"id": {"$in": project_ids}}, {"_id": 0}).to_list(1000)
    else:
        projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
        tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    
    total_projects = len(projects)
    active_projects = len([p for p in projects if p['status'] == 'active'])
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
    
    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
    }

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