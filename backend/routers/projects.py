from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])

def calculate_project_stats(project: models.Project) -> dict:
    total = len(project.tasks) if project.tasks else 0
    completed = sum(1 for t in project.tasks if t.status == "Completed") if project.tasks else 0
    rate = round((completed / total * 100), 1) if total > 0 else 0.0
    return {
        "id": project.id,
        "user_id": project.user_id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date,
        "deadline": project.deadline,
        "color": project.color or "#6366f1",
        "category": project.category or "General",
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "total_tasks": total,
        "completed_tasks": completed,
        "completion_rate": rate
    }

@router.get("", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    projects = db.query(models.Project).filter(models.Project.user_id == current_user.id).order_by(models.Project.created_at.desc()).all()
    return [calculate_project_stats(p) for p in projects]

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return calculate_project_stats(project)

@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = models.Project(
        user_id=current_user.id,
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        start_date=project_data.start_date,
        deadline=project_data.deadline,
        color=project_data.color or "#6366f1",
        category=project_data.category or "General"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Activity log
    act = models.ActivityLog(
        user_id=current_user.id,
        action="created_project",
        entity_type="project",
        entity_id=project.id,
        details=f"Created new project '{project.name}'"
    )
    db.add(act)
    db.commit()

    return calculate_project_stats(project)

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project_data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.description is not None:
        project.description = project_data.description
    if project_data.status is not None:
        project.status = project_data.status
    if project_data.start_date is not None:
        project.start_date = project_data.start_date
    if project_data.deadline is not None:
        project.deadline = project_data.deadline
    if project_data.color is not None:
        project.color = project_data.color
    if project_data.category is not None:
        project.category = project_data.category

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)

    # Activity log
    act = models.ActivityLog(
        user_id=current_user.id,
        action="updated_project",
        entity_type="project",
        entity_id=project.id,
        details=f"Updated project '{project.name}'"
    )
    db.add(act)
    db.commit()

    return calculate_project_stats(project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    p_name = project.name
    db.delete(project)
    
    act = models.ActivityLog(
        user_id=current_user.id,
        action="deleted_project",
        entity_type="project",
        entity_id=project_id,
        details=f"Deleted project '{p_name}'"
    )
    db.add(act)
    db.commit()
    return None
