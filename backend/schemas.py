from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

# ----------------- Project Schemas -----------------
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = "In Progress"
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    color: Optional[str] = "#6366f1"
    category: Optional[str] = "Software Engineering"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    status: str
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    color: str
    category: str
    created_at: datetime
    updated_at: datetime
    total_tasks: int = 0
    completed_tasks: int = 0
    completion_rate: float = 0.0

    class Config:
        from_attributes = True

# ----------------- Task Schemas -----------------
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = "Development"
    priority: str = "Medium" # Low, Medium, High, Critical
    status: str = "To Do"    # To Do, In Progress, In Review, Completed
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    project_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    project_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: str
    order_index: Optional[int] = None

class TaskOut(BaseModel):
    id: int
    task_id_code: str
    user_id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    project_color: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    status: str
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    completed_at: Optional[datetime] = None
    order_index: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Notification Schemas -----------------
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    task_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Activity Log Schemas -----------------
class ActivityLogOut(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Dashboard & Analytics Schemas -----------------
class MetricCount(BaseModel):
    label: str
    count: int
    percentage: Optional[float] = 0.0

class PriorityDistribution(BaseModel):
    name: str
    value: int
    color: str

class WeeklyProductivity(BaseModel):
    day: str
    date: str
    completed: int
    created: int

class UpcomingDeadline(BaseModel):
    id: int
    task_id_code: str
    title: str
    priority: str
    status: str
    due_date: str
    project_name: Optional[str] = None
    days_left: int

class DashboardStatsOut(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    overdue_tasks: int
    completion_rate: float
    total_projects: int
    active_projects: int
    weekly_productivity: List[WeeklyProductivity]
    task_completion_trend: List[dict]
    priority_distribution: List[PriorityDistribution]
    status_distribution: List[MetricCount]
    upcoming_deadlines: List[UpcomingDeadline]
    recent_activities: List[ActivityLogOut]

# ----------------- Calendar Schemas -----------------
class CalendarTaskOut(BaseModel):
    id: int
    task_id_code: str
    title: str
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    status: str
    priority: str
    category: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    project_color: Optional[str] = None
