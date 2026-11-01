from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from seed_data import seed_database
from routers import auth, tasks, projects, dashboard, calendar, reports, notifications

# Initialize tables
Base.metadata.create_all(bind=engine)

# Auto seed default demo data if empty
with SessionLocal() as session:
    try:
        seed_database(session)
    except Exception as e:
        print(f"Seed note: {e}")

app = FastAPI(
    title="TaskFlow API",
    description="Smart Task Management Platform Backend - Auspify Technologies Internship",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(calendar.router)
app.include_router(reports.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "app": "TaskFlow – Smart Task Management Application",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "app": "TaskFlow API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8002, reload=True)

