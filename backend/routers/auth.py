from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    hashed_password = get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email.lower(),
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role="Product Engineer",
        title="Software Engineer",
        bio="Building high-impact productivity workflows with TaskFlow."
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Add welcome notification
    welcome_notif = models.Notification(
        user_id=user.id,
        title="Welcome to TaskFlow! 🚀",
        message="Your workspace has been successfully created. Explore the Dashboard, Kanban, and Projects.",
        type="system"
    )
    # Log activity
    act = models.ActivityLog(
        user_id=user.id,
        action="registered",
        entity_type="auth",
        entity_id=user.id,
        details="Account created successfully"
    )
    db.add(welcome_notif)
    db.add(act)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Log login activity
    act = models.ActivityLog(
        user_id=user.id,
        action="logged_in",
        entity_type="auth",
        entity_id=user.id,
        details="User logged into TaskFlow"
    )
    db.add(act)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    profile_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.role is not None:
        current_user.role = profile_data.role
    if profile_data.title is not None:
        current_user.title = profile_data.title
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.avatar is not None:
        current_user.avatar = profile_data.avatar

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    pwd_data: schemas.UserPasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(pwd_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match"
        )
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
