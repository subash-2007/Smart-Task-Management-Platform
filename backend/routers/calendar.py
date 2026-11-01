from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/calendar", tags=["Calendar"])

@router.get("/tasks", response_model=List[schemas.CalendarTaskOut])
def get_calendar_tasks(
    month: Optional[str] = Query(None), # e.g. "2026-11"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.due_date.isnot(None)
    )
    if month:
        query = query.filter(models.Task.due_date.startswith(month))

    tasks = query.all()
    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "task_id_code": t.task_id_code,
            "title": t.title,
            "start_date": t.start_date,
            "due_date": t.due_date,
            "status": t.status,
            "priority": t.priority,
            "category": t.category,
            "project_id": t.project_id,
            "project_name": t.project.name if t.project else None,
            "project_color": t.project.color if t.project else "#6366f1"
        })
    return result
