import io
import csv
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/analytics")
def get_reports_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Dict[str, Any]:
    today_str = date.today().isoformat()
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    projects = db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "Completed")
    pending = sum(1 for t in tasks if t.status == "To Do")
    in_progress = sum(1 for t in tasks if t.status == "In Progress")
    in_review = sum(1 for t in tasks if t.status == "In Review")
    overdue = sum(1 for t in tasks if t.status != "Completed" and t.due_date and t.due_date < today_str)

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    # Project Progress Report
    project_progress = []
    for p in projects:
        p_total = len(p.tasks) if p.tasks else 0
        p_comp = sum(1 for t in p.tasks if t.status == "Completed") if p.tasks else 0
        p_rate = round((p_comp / p_total * 100), 1) if p_total > 0 else 0.0
        project_progress.append({
            "project_id": p.id,
            "name": p.name,
            "status": p.status,
            "deadline": p.deadline,
            "color": p.color,
            "total_tasks": p_total,
            "completed_tasks": p_comp,
            "completion_rate": p_rate
        })

    # Category Breakdown
    cat_map: Dict[str, Dict[str, int]] = {}
    for t in tasks:
        cat = t.category or "General"
        if cat not in cat_map:
            cat_map[cat] = {"total": 0, "completed": 0}
        cat_map[cat]["total"] += 1
        if t.status == "Completed":
            cat_map[cat]["completed"] += 1

    category_breakdown = [
        {
            "category": k,
            "total": v["total"],
            "completed": v["completed"],
            "rate": round((v["completed"] / v["total"] * 100), 1) if v["total"] > 0 else 0.0
        }
        for k, v in cat_map.items()
    ]

    # Monthly breakdown (last 6 months)
    monthly_data = []
    today = date.today()
    for m in range(5, -1, -1):
        # Rough month steps
        m_date = today - timedelta(days=m * 30)
        m_str = m_date.strftime("%Y-%m")
        m_label = m_date.strftime("%b %Y")
        m_created = sum(1 for t in tasks if t.created_at and t.created_at.strftime("%Y-%m") == m_str)
        m_completed = sum(1 for t in tasks if t.completed_at and t.completed_at.strftime("%Y-%m") == m_str)
        monthly_data.append({
            "month": m_label,
            "created": m_created,
            "completed": m_completed
        })

    return {
        "summary": {
            "total_tasks": total,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "in_review_tasks": in_review,
            "overdue_tasks": overdue,
            "completion_rate": completion_rate,
            "total_projects": len(projects)
        },
        "project_progress": project_progress,
        "category_breakdown": category_breakdown,
        "monthly_productivity": monthly_data
    }

@router.get("/export-csv")
def export_tasks_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).order_by(models.Task.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Task ID", "Title", "Description", "Category", "Priority", 
        "Status", "Project", "Start Date", "Due Date", "Created At", "Completed At"
    ])

    for t in tasks:
        writer.writerow([
            t.task_id_code,
            t.title,
            t.description or "",
            t.category or "",
            t.priority,
            t.status,
            t.project.name if t.project else "Unassigned",
            t.start_date or "",
            t.due_date or "",
            t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else "",
            t.completed_at.strftime("%Y-%m-%d %H:%M") if t.completed_at else ""
        ])

    csv_content = output.getvalue()
    filename = f"taskflow_tasks_{date.today().isoformat()}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
