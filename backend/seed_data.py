from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import models
from auth import get_password_hash

def seed_database(db: Session):
    # Check if demo user exists
    demo_email = "demo@taskflow.io"
    user = db.query(models.User).filter(models.User.email == demo_email).first()
    if user:
        return user

    print("Seeding database with realistic demo projects and tasks...")
    user = models.User(
        email=demo_email,
        full_name="Alex Morgan",
        hashed_password=get_password_hash("password123"),
        role="Lead Full-Stack Engineer",
        title="Senior Software Architect",
        bio="Passionate engineer driving high-scale architecture and modern workflow productivity.",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    today = date.today()

    # Projects
    p1 = models.Project(
        user_id=user.id,
        name="Cloud Architecture & Microservices Migration",
        description="Refactor monolithic services into resilient, auto-scaling Kubernetes microservices.",
        status="In Progress",
        start_date=(today - timedelta(days=20)).isoformat(),
        deadline=(today + timedelta(days=25)).isoformat(),
        color="#6366f1",
        category="DevOps & Backend"
    )
    p2 = models.Project(
        user_id=user.id,
        name="Fintech Mobile App Redesign 2.0",
        description="Revamp user onboarding experience, biometric verification, and dark-mode dashboards.",
        status="In Progress",
        start_date=(today - timedelta(days=14)).isoformat(),
        deadline=(today + timedelta(days=12)).isoformat(),
        color="#ec4899",
        category="Mobile & UI/UX"
    )
    p3 = models.Project(
        user_id=user.id,
        name="AI Smart Search & Recommendation Engine",
        description="Integrate vector search embeddings and real-time personalized query suggestions.",
        status="Planning",
        start_date=(today - timedelta(days=5)).isoformat(),
        deadline=(today + timedelta(days=40)).isoformat(),
        color="#8b5cf6",
        category="AI / Machine Learning"
    )
    p4 = models.Project(
        user_id=user.id,
        name="Enterprise Security & SOC2 Compliance Audit",
        description="Implement end-to-end secret rotations, automated vulnerability scans, and audit logging.",
        status="In Progress",
        start_date=(today - timedelta(days=30)).isoformat(),
        deadline=(today + timedelta(days=6)).isoformat(),
        color="#10b981",
        category="Cybersecurity"
    )
    p5 = models.Project(
        user_id=user.id,
        name="Design System & UI Component Library",
        description="Standardize typography, tokens, accessibility standards, and reusable Figma components.",
        status="Completed",
        start_date=(today - timedelta(days=45)).isoformat(),
        deadline=(today - timedelta(days=2)).isoformat(),
        color="#f59e0b",
        category="Frontend Design"
    )

    db.add_all([p1, p2, p3, p4, p5])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    db.refresh(p3)
    db.refresh(p4)
    db.refresh(p5)

    # Tasks with diverse statuses and priorities
    sample_tasks = [
        # To Do
        {
            "code": "TF-101",
            "project_id": p1.id,
            "title": "Provision Kubernetes Cluster on EKS",
            "description": "Configure Terraform modules for worker nodes, ingress controller, and VPC peering.",
            "category": "DevOps",
            "priority": "Critical",
            "status": "To Do",
            "start_date": (today + timedelta(days=1)).isoformat(),
            "due_date": (today + timedelta(days=4)).isoformat(),
            "completed_at": None,
            "order": 0
        },
        {
            "code": "TF-102",
            "project_id": p3.id,
            "title": "Evaluate Vector DB benchmarks (Milvus vs Pinecone)",
            "description": "Run query latency and memory consumption stress tests on 500k sample embeddings.",
            "category": "Research",
            "priority": "Medium",
            "status": "To Do",
            "start_date": (today + timedelta(days=2)).isoformat(),
            "due_date": (today + timedelta(days=8)).isoformat(),
            "completed_at": None,
            "order": 1
        },
        {
            "code": "TF-103",
            "project_id": p2.id,
            "title": "Design Biometric FaceID Flow in Figma",
            "description": "Create high-fidelity screens and fallback passcode screens for iOS and Android.",
            "category": "Design",
            "priority": "High",
            "status": "To Do",
            "start_date": (today + timedelta(days=3)).isoformat(),
            "due_date": (today + timedelta(days=7)).isoformat(),
            "completed_at": None,
            "order": 2
        },
        {
            "code": "TF-104",
            "project_id": p4.id,
            "title": "Penetration Testing on API Gateways",
            "description": "Perform dynamic application security testing (DAST) on authentication endpoints.",
            "category": "Testing",
            "priority": "Critical",
            "status": "To Do",
            "start_date": today.isoformat(),
            "due_date": (today + timedelta(days=2)).isoformat(),
            "completed_at": None,
            "order": 3
        },

        # In Progress
        {
            "code": "TF-105",
            "project_id": p1.id,
            "title": "Migrate PostgreSQL database to Aurora Multi-AZ",
            "description": "Perform zero-downtime replication sync and cutover rehearsal.",
            "category": "Development",
            "priority": "Critical",
            "status": "In Progress",
            "start_date": (today - timedelta(days=3)).isoformat(),
            "due_date": (today + timedelta(days=1)).isoformat(), # due tomorrow
            "completed_at": None,
            "order": 0
        },
        {
            "code": "TF-106",
            "project_id": p2.id,
            "title": "Implement JWT Refresh Token Rotation",
            "description": "Store hashed refresh tokens in Redis with sliding expiration windows.",
            "category": "Development",
            "priority": "High",
            "status": "In Progress",
            "start_date": (today - timedelta(days=2)).isoformat(),
            "due_date": (today + timedelta(days=3)).isoformat(),
            "completed_at": None,
            "order": 1
        },
        {
            "code": "TF-107",
            "project_id": p4.id,
            "title": "Enforce Strict Content Security Policy (CSP)",
            "description": "Prevent cross-site scripting vulnerabilities across all web client headers.",
            "category": "Development",
            "priority": "Medium",
            "status": "In Progress",
            "start_date": (today - timedelta(days=4)).isoformat(),
            "due_date": (today - timedelta(days=1)).isoformat(), # OVERDUE!
            "completed_at": None,
            "order": 2
        },

        # In Review
        {
            "code": "TF-108",
            "project_id": p2.id,
            "title": "Dark Mode & High Contrast Accessibility Audit",
            "description": "Ensure WCAG AAA compliant color contrast on buttons and text labels.",
            "category": "Design",
            "priority": "Medium",
            "status": "In Review",
            "start_date": (today - timedelta(days=6)).isoformat(),
            "due_date": (today + timedelta(days=2)).isoformat(),
            "completed_at": None,
            "order": 0
        },
        {
            "code": "TF-109",
            "project_id": p1.id,
            "title": "Refactor Task API Endpoints with Rate Limiting",
            "description": "Add IP-based token bucket rate limiter to prevent API abuse.",
            "category": "Development",
            "priority": "High",
            "status": "In Review",
            "start_date": (today - timedelta(days=5)).isoformat(),
            "due_date": (today + timedelta(days=1)).isoformat(),
            "completed_at": None,
            "order": 1
        },

        # Completed
        {
            "code": "TF-110",
            "project_id": p5.id,
            "title": "Publish NPM UI Design System Package v1.0",
            "description": "Export headless components, Tailwind preset, and icon catalogue.",
            "category": "Development",
            "priority": "High",
            "status": "Completed",
            "start_date": (today - timedelta(days=15)).isoformat(),
            "due_date": (today - timedelta(days=2)).isoformat(),
            "completed_at": datetime.utcnow() - timedelta(days=2),
            "order": 0
        },
        {
            "code": "TF-111",
            "project_id": p5.id,
            "title": "Setup Automated Storybook Documentation",
            "description": "Host interactive UI component playground on GitHub Pages.",
            "category": "Design",
            "priority": "Low",
            "status": "Completed",
            "start_date": (today - timedelta(days=20)).isoformat(),
            "due_date": (today - timedelta(days=5)).isoformat(),
            "completed_at": datetime.utcnow() - timedelta(days=5),
            "order": 1
        },
        {
            "code": "TF-112",
            "project_id": p4.id,
            "title": "Configure SSL/TLS 1.3 Termination on CloudFront",
            "description": "Update cipher suites and disable deprecated TLS 1.0/1.1 protocols.",
            "category": "DevOps",
            "priority": "Medium",
            "status": "Completed",
            "start_date": (today - timedelta(days=12)).isoformat(),
            "due_date": (today - timedelta(days=7)).isoformat(),
            "completed_at": datetime.utcnow() - timedelta(days=7),
            "order": 2
        },
        {
            "code": "TF-113",
            "project_id": p3.id,
            "title": "Data Pipeline for Query Click-Through Analytics",
            "description": "Stream search events to S3 parquet format for model retraining.",
            "category": "Development",
            "priority": "Medium",
            "status": "Completed",
            "start_date": (today - timedelta(days=10)).isoformat(),
            "due_date": (today - timedelta(days=3)).isoformat(),
            "completed_at": datetime.utcnow() - timedelta(days=3),
            "order": 3
        }
    ]

    for item in sample_tasks:
        t = models.Task(
            task_id_code=item["code"],
            user_id=user.id,
            project_id=item["project_id"],
            title=item["title"],
            description=item["description"],
            category=item["category"],
            priority=item["priority"],
            status=item["status"],
            start_date=item["start_date"],
            due_date=item["due_date"],
            completed_at=item["completed_at"],
            order_index=item["order"]
        )
        db.add(t)

    # Activity logs
    db.add(models.ActivityLog(
        user_id=user.id,
        action="completed_task",
        entity_type="task",
        entity_id=1,
        details="Alex completed [TF-110] 'Publish NPM UI Design System Package v1.0'",
        created_at=datetime.utcnow() - timedelta(days=2)
    ))
    db.add(models.ActivityLog(
        user_id=user.id,
        action="status_change",
        entity_type="task",
        entity_id=2,
        details="Moved [TF-109] 'Refactor Task API Endpoints' to In Review",
        created_at=datetime.utcnow() - timedelta(hours=5)
    ))
    db.add(models.ActivityLog(
        user_id=user.id,
        action="created_task",
        entity_type="task",
        entity_id=3,
        details="Created critical task [TF-105] 'Migrate PostgreSQL database to Aurora Multi-AZ'",
        created_at=datetime.utcnow() - timedelta(hours=14)
    ))

    # Notifications
    db.add(models.Notification(
        user_id=user.id,
        title="Task Overdue ⚠️",
        message="[TF-107] 'Enforce Strict Content Security Policy (CSP)' is past due.",
        type="overdue",
        is_read=False
    ))
    db.add(models.Notification(
        user_id=user.id,
        title="Upcoming Deadline Reminder ⏰",
        message="[TF-105] 'Migrate PostgreSQL database to Aurora Multi-AZ' is due tomorrow.",
        type="deadline",
        is_read=False
    ))
    db.add(models.Notification(
        user_id=user.id,
        title="Milestone Completed 🎉",
        message="Project 'Design System & UI Component Library' reached 100% completion!",
        type="completion",
        is_read=True
    ))

    db.commit()
    print("Database seeding completed successfully.")
    return user
