from typing import List
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStatsOut)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today_str = date.today().isoformat()
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    projects = db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "Completed")
    pending_tasks = sum(1 for t in tasks if t.status == "To Do")
    in_progress_tasks = sum(1 for t in tasks if t.status in ["In Progress", "In Review"])
    
    # Overdue tasks: status != Completed and due_date < today_str
    overdue_tasks = sum(
        1 for t in tasks 
        if t.status != "Completed" and t.due_date and t.due_date < today_str
    )

    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status in ["Planning", "In Progress"])

    # Priority distribution
    priority_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    priority_colors = {
        "Critical": "#ef4444",
        "High": "#f97316",
        "Medium": "#3b82f6",
        "Low": "#10b981"
    }
    for t in tasks:
        p = t.priority if t.priority in priority_counts else "Medium"
        priority_counts[p] += 1

    priority_distribution = [
        {"name": k, "value": v, "color": priority_colors[k]}
        for k, v in priority_counts.items()
    ]

    # Status distribution
    status_counts = {"To Do": 0, "In Progress": 0, "In Review": 0, "Completed": 0}
    for t in tasks:
        s = t.status if t.status in status_counts else "To Do"
        status_counts[s] += 1

    status_distribution = [
        {
            "label": k,
            "count": v,
            "percentage": round((v / total_tasks * 100), 1) if total_tasks > 0 else 0.0
        }
        for k, v in status_counts.items()
    ]

    # Weekly Productivity: past 7 days (Mon-Sun or past 7 days up to today)
    weekly_prod = []
    today = date.today()
    for i in range(6, -1, -1):
        target_day = today - timedelta(days=i)
        day_str = target_day.isoformat()
        day_label = target_day.strftime("%a")

        # tasks created on target_day
        created_count = sum(
            1 for t in tasks 
            if t.created_at and t.created_at.date() == target_day
        )
        # tasks completed on target_day
        completed_count = sum(
            1 for t in tasks 
            if t.completed_at and t.completed_at.date() == target_day
        )
        weekly_prod.append({
            "day": day_label,
            "date": target_day.strftime("%b %d"),
            "completed": completed_count,
            "created": created_count
        })

    # Task completion trend (last 4 weeks / periods)
    trend = []
    for week_idx in range(4, 0, -1):
        w_start = today - timedelta(days=week_idx * 7)
        w_end = w_start + timedelta(days=6)
        comp = sum(1 for t in tasks if t.completed_at and w_start <= t.completed_at.date() <= w_end)
        trend.append({
            "period": f"Week {5 - week_idx}",
            "completed": comp,
            "target": max(comp + 2, 5)
        })

    # Upcoming deadlines (due within next 14 days, status != Completed)
    upcoming_deadlines = []
    active_tasks_with_due = [t for t in tasks if t.status != "Completed" and t.due_date]
    # Sort by due_date
    active_tasks_with_due.sort(key=lambda x: x.due_date or "9999-12-31")

    for t in active_tasks_with_due[:8]:
        try:
            d_date = datetime.strptime(t.due_date, "%Y-%m-%d").date()
            delta_days = (d_date - today).days
        except Exception:
            delta_days = 0

        upcoming_deadlines.append({
            "id": t.id,
            "task_id_code": t.task_id_code,
            "title": t.title,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date,
            "project_name": t.project.name if t.project else "No Project",
            "days_left": delta_days
        })

    # Recent activities (last 10)
    activities = db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == current_user.id
    ).order_by(models.ActivityLog.created_at.desc()).limit(10).all()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate,
        "total_projects": total_projects,
        "active_projects": active_projects,
        "weekly_productivity": weekly_prod,
        "task_completion_trend": trend,
        "priority_distribution": priority_distribution,
        "status_distribution": status_distribution,
        "upcoming_deadlines": upcoming_deadlines,
        "recent_activities": activities
    }
