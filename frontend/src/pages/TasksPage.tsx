import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';
import { api } from '../api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Tag,
  Check,
} from 'lucide-react';

interface TasksPageProps {
  projects: Project[];
  onOpenCreateTask: () => void;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  searchQuery: string;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  projects,
  onOpenCreateTask,
  onSelectTask,
  onEditTask,
  searchQuery,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, projectFilter, categoryFilter, sortBy, sortOrder, searchQuery]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        project_id: projectFilter ? Number(projectFilter) : undefined,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStatus = async (e: React.MouseEvent, taskId: number, newStatus: string) => {
    e.stopPropagation();
    try {
      const updated = await api.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!window.confirm(`Delete task [${task.task_id_code}] '${task.title}'?`)) return;
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const priorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const statusBadge = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'In Review':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'In Progress':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'Completed' || !task.due_date) return false;
    return new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">My Tasks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, prioritize, filter, and track all assigned work items.
          </p>
        </div>
        <button
          onClick={onOpenCreateTask}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 min-w-[140px]">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="flex-1 min-w-[160px]">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="created_at">Sort: Created Date</option>
              <option value="due_date">Sort: Deadline</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Task Title</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 transition-colors cursor-pointer"
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {(statusFilter || priorityFilter || projectFilter || categoryFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setProjectFilter('');
                setCategoryFilter('');
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Fetching task catalog...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
            <h3 className="text-sm font-bold text-slate-200">No tasks found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no tasks matching your selected filters or search query. Create a new task or adjust filters.
            </p>
            <button
              onClick={onOpenCreateTask}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
            >
              Create New Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4 w-28">Task ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4 w-40">Project</th>
                  <th className="py-3 px-4 w-28">Priority</th>
                  <th className="py-3 px-4 w-32">Due Date</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Checkbox Quick Mark Completed */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) =>
                            handleQuickStatus(
                              e,
                              task.id,
                              task.status === 'Completed' ? 'To Do' : 'Completed'
                            )
                          }
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-700 hover:border-indigo-400 text-transparent hover:text-indigo-400'
                          }`}
                          title={
                            task.status === 'Completed'
                              ? 'Mark as incomplete'
                              : 'Mark as completed'
                          }
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Task ID Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {task.task_id_code}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          <span
                            className={task.status === 'Completed' ? 'line-through opacity-60' : ''}
                          >
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3 px-4">
                        {task.project_name ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-white max-w-[140px] truncate"
                            style={{ backgroundColor: task.project_color || '#6366f1' }}
                          >
                            {task.project_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No project</span>
                        )}
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${priorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date & Overdue badge */}
                      <td className="py-3 px-4">
                        {task.due_date ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className={`text-[11px] font-medium ${
                                overdue ? 'text-rose-400 font-bold' : 'text-slate-300'
                              }`}
                            >
                              {task.due_date}
                            </span>
                            {overdue && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No deadline</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, task)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
