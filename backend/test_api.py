import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import Base, engine

client = TestClient(app)

class TestTaskFlowAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create all tables
        Base.metadata.create_all(bind=engine)

    def test_01_root_health(self):
        res = client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")

    def test_02_demo_login(self):
        res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "demo@taskflow.io")

    def test_03_dashboard_stats(self):
        # Login first
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        stats_res = client.get("/api/dashboard/stats", headers=headers)
        self.assertEqual(stats_res.status_code, 200)
        data = stats_res.json()
        self.assertGreater(data["total_tasks"], 0)
        self.assertIn("weekly_productivity", data)
        self.assertIn("priority_distribution", data)

    def test_04_tasks_crud_and_status(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create task
        new_task = {
            "title": "Automated Unit Test Task",
            "description": "Testing CRUD flow",
            "category": "Testing",
            "priority": "High",
            "status": "To Do",
            "due_date": "2026-11-15"
        }
        create_res = client.post("/api/tasks", json=new_task, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        task_id = create_res.json()["id"]

        # 2. Get task
        get_res = client.get(f"/api/tasks/{task_id}", headers=headers)
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["title"], "Automated Unit Test Task")

        # 3. Update status (e.g. Kanban move)
        status_res = client.patch(f"/api/tasks/{task_id}/status", json={"status": "Completed"}, headers=headers)
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["status"], "Completed")

        # 4. Delete task
        del_res = client.delete(f"/api/tasks/{task_id}", headers=headers)
        self.assertEqual(del_res.status_code, 204)

    def test_05_reports_and_csv(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        rep_res = client.get("/api/reports/analytics", headers=headers)
        self.assertEqual(rep_res.status_code, 200)
        rep_data = rep_res.json()
        self.assertIn("project_progress", rep_data)

        csv_res = client.get("/api/reports/export-csv", headers=headers)
        self.assertEqual(csv_res.status_code, 200)
        self.assertIn("Task ID,Title", csv_res.text)

    def test_06_user_data_isolation(self):
        import uuid
        unique_email = f"user_{uuid.uuid4().hex[:8]}@taskflow.io"
        reg_b = client.post("/api/auth/register", json={
            "email": unique_email,
            "full_name": "User B",
            "password": "password123"
        })
        self.assertEqual(reg_b.status_code, 201)
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B should see 0 tasks initially
        tasks_b = client.get("/api/tasks", headers=headers_b)
        self.assertEqual(tasks_b.status_code, 200)
        self.assertEqual(len(tasks_b.json()), 0)

    def test_07_projects_crud(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create project
        proj_res = client.post("/api/projects", json={
            "name": "Integration Test Project",
            "description": "Testing project creation & updates",
            "category": "Quality Assurance",
            "status": "In Progress",
            "color": "#10b981",
            "start_date": "2026-11-01",
            "deadline": "2026-11-30"
        }, headers=headers)
        self.assertEqual(proj_res.status_code, 201)
        proj_data = proj_res.json()
        proj_id = proj_data["id"]
        self.assertEqual(proj_data["name"], "Integration Test Project")

        # 2. Get projects list
        list_res = client.get("/api/projects", headers=headers)
        self.assertEqual(list_res.status_code, 200)
        self.assertTrue(any(p["id"] == proj_id for p in list_res.json()))

        # 3. Update project
        upd_res = client.put(f"/api/projects/{proj_id}", json={
            "name": "Updated Integration Project",
            "status": "Completed"
        }, headers=headers)
        self.assertEqual(upd_res.status_code, 200)
        self.assertEqual(upd_res.json()["name"], "Updated Integration Project")

        # 4. Delete project
        del_res = client.delete(f"/api/projects/{proj_id}", headers=headers)
        self.assertEqual(del_res.status_code, 204)

    def test_08_calendar_events(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        cal_res = client.get("/api/calendar/tasks", headers=headers)
        self.assertEqual(cal_res.status_code, 200)
        events = cal_res.json()
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)
        self.assertIn("due_date", events[0])

    def test_09_notifications(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch notifications
        notif_res = client.get("/api/notifications", headers=headers)
        self.assertEqual(notif_res.status_code, 200)
        notifs = notif_res.json()
        self.assertIsInstance(notifs, list)

        # Mark all read
        mark_all = client.post("/api/notifications/mark-all-read", headers=headers)
        self.assertEqual(mark_all.status_code, 200)

    def test_10_user_profile(self):
        login_res = client.post("/api/auth/login", json={
            "email": "demo@taskflow.io",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check /me
        me_res = client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "demo@taskflow.io")

        # Update profile
        upd_res = client.put("/api/auth/profile", json={
            "title": "Principal Architect & Lead Engineer"
        }, headers=headers)
        self.assertEqual(upd_res.status_code, 200)
        self.assertEqual(upd_res.json()["title"], "Principal Architect & Lead Engineer")

if __name__ == "__main__":
    unittest.main()

