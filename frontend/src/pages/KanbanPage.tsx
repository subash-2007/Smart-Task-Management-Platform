import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';
import { api } from '../api';
import {
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

interface KanbanPageProps {
  projects: Project[];
  onOpenCreateTaskWithStatus?: (status: Task['status']) => void;
  onSelectTask: (task: Task) => void;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({
  projects,
  onOpenCreateTaskWithStatus,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const columns: Array<{ id: Task['status']; title: string; color: string; badgeBg: string }> = [
    {
      id: 'To Do',
      title: 'To Do',
      color: 'border-slate-700',
      badgeBg: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      color: 'border-indigo-500/40',
      badgeBg: 'bg-indigo-500/15 text-indigo-400',
    },
    {
      id: 'In Review',
      title: 'In Review',
      color: 'border-purple-500/40',
      badgeBg: 'bg-purple-500/15 text-purple-400',
    },
    {
      id: 'Completed',
      title: 'Completed',
      color: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/15 text-emerald-400',
    },
  ];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks({ sort_by: 'order_index', sort_order: 'asc' });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load kanban tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(taskIdStr);
    if (!taskId) return;

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await api.updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      console.error('Failed to update task status from drop:', err);
      // Revert if error
      loadTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const moveColumn = async (
    e: React.MouseEvent,
    task: Task,
    direction: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const order: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Completed'];
    const currIndex = order.indexOf(task.status);
    const nextIndex = direction === 'right' ? currIndex + 1 : currIndex - 1;
    if (nextIndex < 0 || nextIndex >= order.length) return;

    const nextStatus = order[nextIndex];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await api.updateTaskStatus(task.id, nextStatus);
    } catch (err) {
      console.error('Failed to move column:', err);
      loadTasks();
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

  const isOverdue = (task: Task) => {
    if (task.status === 'Completed' || !task.due_date) return false;
    return new Date(task.due_date) < new Date(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Kanban Board</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Drag and drop tasks between workflow stages to update status and trigger notifications.
          </p>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-sm"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/90 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-slate-200">{col.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                  >
                    {colTasks.length}
                  </span>
                </div>
                {onOpenCreateTaskWithStatus && (
                  <button
                    onClick={() => onOpenCreateTaskWithStatus(col.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tasks Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-36 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-slate-400 text-xs text-center p-4">
                    Drop tasks here or click + to add
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const overdue = isOverdue(task);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onSelectTask(task)}
                        className={`p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 shadow-md cursor-grab active:cursor-grabbing transition-all hover:translate-y-[-1px] space-y-2.5 ${
                          draggedTaskId === task.id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Task Code & Priority */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {task.task_id_code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-200 leading-snug">
                          {task.title}
                        </h4>

                        {/* Project Badge */}
                        {task.project_name && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: task.project_color || '#6366f1' }}
                            />
                            <span className="text-[10px] text-slate-300 font-medium truncate">
                              {task.project_name}
                            </span>
                          </div>
                        )}

                        {/* Footer: Date & Quick Column Move buttons */}
                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className={overdue ? 'text-rose-400 font-bold' : ''}>
                              {task.due_date || 'No date'}
                            </span>
                            {overdue && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
                                title="Overdue"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-0.5">
                            {col.id !== 'To Do' && (
                              <button
                                onClick={(e) => moveColumn(e, task, 'left')}
                                className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id !== 'Completed' && (
                              <button
                                onClick={(e) => moveColumn(e, task, 'right')}
                                className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
