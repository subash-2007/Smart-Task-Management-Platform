import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Project, Task, NotificationItem } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';

import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { KanbanPage } from './pages/KanbanPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { user, token, isLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (token) {
      loadInitialData();
      const interval = setInterval(loadNotifications, 30000); // Check notifications every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadInitialData = async () => {
    try {
      const [projData, notifData] = await Promise.all([
        api.getProjects(),
        api.getNotifications(),
      ]);
      setProjects(projData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load initial workspace data:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const projData = await api.getProjects();
      setProjects(projData);
    } catch (err) {
      console.error('Failed to reload projects:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifData = await api.getNotifications();
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to reload notifications:', err);
    }
  };

  // Task operations
  const handleOpenCreateTask = (initialStatus?: Task['status'], initialDate?: string) => {
    setEditingTask(
      initialStatus || initialDate
        ? ({
            id: 0,
            task_id_code: '',
            user_id: user?.id || 0,
            title: '',
            description: '',
            category: 'Development',
            priority: 'Medium',
            status: initialStatus || 'To Do',
            start_date: new Date().toISOString().slice(0, 10),
            due_date: initialDate || undefined,
            order_index: 0,
            created_at: '',
            updated_at: '',
          } as Task)
        : null
    );
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask && editingTask.id > 0) {
      const updated = await api.updateTask(editingTask.id, taskData);
      if (selectedTaskDetail?.id === updated.id) {
        setSelectedTaskDetail(updated);
      }
    } else {
      await api.createTask(taskData);
    }
    loadProjects();
    loadNotifications();
  };

  const handleDeleteTask = async (taskId: number) => {
    await api.deleteTask(taskId);
    loadProjects();
    loadNotifications();
  };

  const handleUpdateTaskStatus = async (taskId: number, status: Task['status']) => {
    const updated = await api.updateTaskStatus(taskId, status);
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(updated);
    }
    loadProjects();
    loadNotifications();
  };

  const handleUpdateTaskPriority = async (taskId: number, priority: Task['priority']) => {
    const updated = await api.updateTask(taskId, { priority });
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(updated);
    }
    loadNotifications();
  };

  // Project operations
  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (editingProject) {
      await api.updateProject(editingProject.id, projectData);
    } else {
      await api.createProject(projectData);
    }
    loadProjects();
  };

  // Notification operations
  const handleMarkNotificationRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-semibold tracking-wide">
            Initializing TaskFlow Workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-950">
        <Navbar
          onOpenCreateTask={() => handleOpenCreateTask()}
          onNavigate={(page) => setCurrentPage(page)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentPage !== 'tasks' && q.trim().length > 0) {
              setCurrentPage('tasks');
            }
          }}
        />

        <main className="flex-1 flex flex-col">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onOpenCreateTask={() => handleOpenCreateTask()}
              onNavigate={(page) => setCurrentPage(page)}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {currentPage === 'tasks' && (
            <TasksPage
              projects={projects}
              onOpenCreateTask={() => handleOpenCreateTask()}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              projects={projects}
              onOpenCreateProject={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              onEditProject={(proj) => {
                setEditingProject(proj);
                setIsProjectModalOpen(true);
              }}
              onRefreshProjects={loadProjects}
              onFilterByProject={(projId) => {
                setCurrentPage('tasks');
              }}
            />
          )}

          {currentPage === 'kanban' && (
            <KanbanPage
              projects={projects}
              onOpenCreateTaskWithStatus={(status) => handleOpenCreateTask(status)}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarPage
              onSelectTaskById={async (id) => {
                try {
                  const t = await api.getTask(id);
                  setSelectedTaskDetail(t);
                } catch (err) {
                  console.error('Failed to load task:', err);
                }
              }}
              onOpenCreateTaskWithDate={(dateStr) =>
                handleOpenCreateTask(undefined, dateStr)
              }
            />
          )}

          {currentPage === 'reports' && <ReportsPage />}

          {currentPage === 'profile' && <ProfilePage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        projects={projects}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />

      <TaskDetailDrawer
        task={selectedTaskDetail}
        isOpen={!!selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        onEdit={(task) => {
          setSelectedTaskDetail(null);
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={handleDeleteTask}
        onUpdateStatus={handleUpdateTaskStatus}
        onUpdatePriority={handleUpdateTaskPriority}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
