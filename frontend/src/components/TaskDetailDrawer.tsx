import React from 'react';
import { Task } from '../types';
import {
  X,
  Calendar,
  FolderKanban,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onUpdateStatus: (taskId: number, status: Task['status']) => void;
  onUpdatePriority: (taskId: number, priority: Task['priority']) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  if (!isOpen || !task) return null;

  const isOverdue =
    task.status !== 'Completed' &&
    task.due_date &&
    new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10));

  const priorityColors = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    High: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const statusColors = {
    'To Do': 'bg-slate-800 text-slate-300 border-slate-700',
    'In Progress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    'In Review': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
              {task.task_id_code}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                statusColors[task.status]
              }`}
            >
              {task.status}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete task ${task.task_id_code}?`)) {
                  onDelete(task.id);
                  onClose();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-100 leading-snug">{task.title}</h1>
            {task.project_name && (
              <div className="flex items-center gap-2 mt-2">
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">Project:</span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold text-white"
                  style={{ backgroundColor: task.project_color || '#6366f1' }}
                >
                  {task.project_name}
                </span>
              </div>
            )}
          </div>

          {/* Overdue alert banner if applicable */}
          {isOverdue && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                This task is overdue! Due date was <strong>{task.due_date}</strong>.
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </div>
          </div>

          {/* Quick Status Flow */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Update Status
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {(['To Do', 'In Progress', 'In Review', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(task.id, st)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    task.status === st
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Priority Flow */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Change Priority
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as const).map((pr) => (
                <button
                  key={pr}
                  onClick={() => onUpdatePriority(task.id, pr)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    task.priority === pr
                      ? `${priorityColors[pr]} ring-2 ring-indigo-500/40`
                      : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Category</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                {task.category}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Due Date</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {task.due_date || 'No deadline'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Start Date</span>
              <span className="text-slate-300">{task.start_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Created At</span>
              <span className="text-slate-300">
                {new Date(task.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
