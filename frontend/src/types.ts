export interface User {
  id: number;
  email: string;
  full_name: string;
  role?: string;
  title?: string;
  bio?: string;
  avatar?: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  start_date?: string;
  deadline?: string;
  color: string;
  category: string;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface Task {
  id: number;
  task_id_code: string;
  user_id: number;
  project_id?: number | null;
  project_name?: string | null;
  project_color?: string | null;
  title: string;
  description?: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed';
  start_date?: string;
  due_date?: string;
  completed_at?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'deadline' | 'overdue' | 'completion' | 'system';
  is_read: boolean;
  task_id?: number | null;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details: string;
  created_at: string;
}

export interface UpcomingDeadline {
  id: number;
  task_id_code: string;
  title: string;
  priority: string;
  status: string;
  due_date: string;
  project_name?: string;
  days_left: number;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_projects: number;
  active_projects: number;
  weekly_productivity: Array<{
    day: string;
    date: string;
    completed: number;
    created: number;
  }>;
  task_completion_trend: Array<{
    period: string;
    completed: number;
    target: number;
  }>;
  priority_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  status_distribution: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
  upcoming_deadlines: UpcomingDeadline[];
  recent_activities: ActivityLog[];
}

export interface CalendarTask {
  id: number;
  task_id_code: string;
  title: string;
  start_date?: string;
  due_date?: string;
  status: string;
  priority: string;
  category: string;
  project_id?: number;
  project_name?: string;
  project_color?: string;
}

export interface ReportsAnalytics {
  summary: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    in_review_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    total_projects: number;
  };
  project_progress: Array<{
    project_id: number;
    name: string;
    status: string;
    deadline?: string;
    color: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }>;
  category_breakdown: Array<{
    category: string;
    total: number;
    completed: number;
    rate: number;
  }>;
  monthly_productivity: Array<{
    month: string;
    created: number;
    completed: number;
  }>;
}
