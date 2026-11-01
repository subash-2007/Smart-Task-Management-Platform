from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

def format_task_out(task: models.Task) -> dict:
    return {
        "id": task.id,
        "task_id_code": task.task_id_code,
        "user_id": task.user_id,
        "project_id": task.project_id,
        "project_name": task.project.name if task.project else None,
        "project_color": task.project.color if task.project else None,
        "title": task.title,
        "description": task.description,
        "category": task.category,
        "priority": task.priority,
        "status": task.status,
        "start_date": task.start_date,
        "due_date": task.due_date,
        "completed_at": task.completed_at,
        "order_index": task.order_index,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

def generate_task_code(db: Session, user_id: int) -> str:
    count = db.query(models.Task).filter(models.Task.user_id == user_id).count()
    return f"TF-{count + 101}"

@router.get("", response_model=List[schemas.TaskOut])
def get_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    due_date: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"), # created_at, due_date, priority, title
    sort_order: Optional[str] = Query("desc"),   # asc, desc
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)

    if project_id is not None:
        query = query.filter(models.Task.project_id == project_id)
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if category:
        query = query.filter(models.Task.category == category)
    if due_date:
        query = query.filter(models.Task.due_date == due_date)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Task.title.ilike(search_filter),
                models.Task.description.ilike(search_filter),
                models.Task.task_id_code.ilike(search_filter)
            )
        )

    # Sorting
    sort_col = getattr(models.Task, sort_by, models.Task.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    tasks = query.all()
    return [format_task_out(t) for t in tasks]

@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return format_task_out(task)

@router.post("", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if task_data.project_id:
        project = db.query(models.Project).filter(
            models.Project.id == task_data.project_id,
            models.Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(status_code=400, detail="Invalid project_id")

    task_code = generate_task_code(db, current_user.id)
    completed_time = datetime.utcnow() if task_data.status == "Completed" else None

    # Get max order_index for this status column
    last_order = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == task_data.status
    ).count()

    task = models.Task(
        task_id_code=task_code,
        user_id=current_user.id,
        project_id=task_data.project_id,
        title=task_data.title,
        description=task_data.description,
        category=task_data.category or "Development",
        priority=task_data.priority or "Medium",
        status=task_data.status or "To Do",
        start_date=task_data.start_date,
        due_date=task_data.due_date,
        completed_at=completed_time,
        order_index=last_order
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Activity log
    act = models.ActivityLog(
        user_id=current_user.id,
        action="created_task",
        entity_type="task",
        entity_id=task.id,
        details=f"Created task [{task.task_id_code}] {task.title}"
    )
    db.add(act)

    # If critical priority, send notification
    if task.priority == "Critical":
        notif = models.Notification(
            user_id=current_user.id,
            title="Critical Priority Task Created",
            message=f"[{task.task_id_code}] '{task.title}' was flagged as Critical priority.",
            type="deadline",
            task_id=task.id
        )
        db.add(notif)

    db.commit()
    return format_task_out(task)

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.project_id is not None:
        if task_data.project_id > 0:
            proj = db.query(models.Project).filter(
                models.Project.id == task_data.project_id,
                models.Project.user_id == current_user.id
            ).first()
            if not proj:
                raise HTTPException(status_code=400, detail="Invalid project_id")
            task.project_id = task_data.project_id
        else:
            task.project_id = None

    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.category is not None:
        task.category = task_data.category
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.start_date is not None:
        task.start_date = task_data.start_date
    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    if task_data.status is not None and task_data.status != task.status:
        old_status = task.status
        task.status = task_data.status
        if task.status == "Completed":
            task.completed_at = datetime.utcnow()
            # Send completion notification
            notif = models.Notification(
                user_id=current_user.id,
                title="Task Completed! 🎉",
                message=f"[{task.task_id_code}] '{task.title}' was marked as completed.",
                type="completion",
                task_id=task.id
            )
            db.add(notif)
        else:
            task.completed_at = None

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    act = models.ActivityLog(
        user_id=current_user.id,
        action="updated_task",
        entity_type="task",
        entity_id=task.id,
        details=f"Updated task [{task.task_id_code}] '{task.title}'"
    )
    db.add(act)
    db.commit()

    return format_task_out(task)

@router.patch("/{task_id}/status", response_model=schemas.TaskOut)
def update_task_status(
    task_id: int,
    status_data: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    task.status = status_data.status
    if status_data.order_index is not None:
        task.order_index = status_data.order_index

    if task.status == "Completed":
        task.completed_at = datetime.utcnow()
        notif = models.Notification(
            user_id=current_user.id,
            title="Task Completed! 🎉",
            message=f"[{task.task_id_code}] '{task.title}' moved to Completed.",
            type="completion",
            task_id=task.id
        )
        db.add(notif)
    else:
        task.completed_at = None

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    act = models.ActivityLog(
        user_id=current_user.id,
        action="status_change",
        entity_type="task",
        entity_id=task.id,
        details=f"Moved [{task.task_id_code}] from '{old_status}' to '{task.status}'"
    )
    db.add(act)
    db.commit()

    return format_task_out(task)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    title = task.title
    code = task.task_id_code
    db.delete(task)
    
    act = models.ActivityLog(
        user_id=current_user.id,
        action="deleted_task",
        entity_type="task",
        entity_id=task_id,
        details=f"Deleted task [{code}] '{title}'"
    )
    db.add(act)
    db.commit()
    return None
