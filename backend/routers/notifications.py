from typing import List
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Auto scan for overdue / upcoming deadlines before returning
    today = date.today()
    tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "Completed",
        models.Task.due_date.isnot(None)
    ).all()

    for t in tasks:
        try:
            due = datetime.strptime(t.due_date, "%Y-%m-%d").date()
            # Overdue notice
            if due < today:
                exists = db.query(models.Notification).filter(
                    models.Notification.user_id == current_user.id,
                    models.Notification.task_id == t.id,
                    models.Notification.type == "overdue"
                ).first()
                if not exists:
                    notif = models.Notification(
                        user_id=current_user.id,
                        title="Task Overdue ⚠️",
                        message=f"[{t.task_id_code}] '{t.title}' was due on {t.due_date} and is now overdue.",
                        type="overdue",
                        task_id=t.id
                    )
                    db.add(notif)
            # Due in 2 days or today
            elif 0 <= (due - today).days <= 2:
                exists = db.query(models.Notification).filter(
                    models.Notification.user_id == current_user.id,
                    models.Notification.task_id == t.id,
                    models.Notification.type == "deadline"
                ).first()
                if not exists:
                    days_text = "today" if (due - today).days == 0 else f"in {(due - today).days} day(s)"
                    notif = models.Notification(
                        user_id=current_user.id,
                        title="Upcoming Deadline Reminder ⏰",
                        message=f"[{t.task_id_code}] '{t.title}' is due {days_text} ({t.due_date}).",
                        type="deadline",
                        task_id=t.id
                    )
                    db.add(notif)
        except Exception:
            pass

    db.commit()

    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(30).all()

@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return None
