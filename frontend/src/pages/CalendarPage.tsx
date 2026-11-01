import React, { useState, useEffect } from 'react';
import { CalendarTask, Task } from '../types';
import { api } from '../api';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface CalendarPageProps {
  onSelectTaskById: (taskId: number) => void;
  onOpenCreateTaskWithDate: (dateStr: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  onSelectTaskById,
  onOpenCreateTaskWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    loadCalendar();
  }, [currentYear, currentMonth]);

  const loadCalendar = async () => {
    try {
      setIsLoading(true);
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const data = await api.getCalendarTasks(monthStr);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load calendar tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Shift to start on Monday: 0 (Sun) becomes 6, 1 (Mon) becomes 0
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const totalCells = Math.ceil((startDayOffset + daysInMonth) / 7) * 7;
  const calendarCells = [];

  const todayStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startDayOffset + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        dayNumber
      ).padStart(2, '0')}`;
      const dayTasks = tasks.filter((t) => t.due_date === dateStr);
      calendarCells.push({
        dayNumber,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: dayTasks,
      });
    } else {
      calendarCells.push({
        dayNumber: null,
        dateStr: null,
        isCurrentMonth: false,
        isToday: false,
        tasks: [],
      });
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Project Calendar</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize deadlines, track scheduled deliveries, and manage workload time horizons.
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-200 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm flex flex-col flex-1 min-h-[580px]">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/90 text-center py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/20">
          {calendarCells.map((cell, index) => {
            if (!cell.isCurrentMonth || !cell.dayNumber) {
              return (
                <div
                  key={`empty-${index}`}
                  className="bg-slate-950/40 p-2 min-h-[100px] opacity-25"
                />
              );
            }

            const isPast =
              cell.dateStr &&
              cell.dateStr < todayStr;

            return (
              <div
                key={cell.dateStr}
                onClick={() => cell.dateStr && onOpenCreateTaskWithDate(cell.dateStr)}
                className={`p-2 min-h-[105px] flex flex-col justify-between hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                  cell.isToday ? 'bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cell.dateStr) onOpenCreateTaskWithDate(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 rounded transition-opacity"
                    title={`Add task on ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Tasks */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                  {cell.tasks.map((task) => {
                    const overdue = isPast && task.status !== 'Completed';
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTaskById(task.id);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center justify-between gap-1 transition-all hover:scale-[1.02] shadow-sm cursor-pointer ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : overdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                        }`}
                        title={`${task.task_id_code}: ${task.title} (${task.status})`}
                      >
                        <span className="truncate">{task.title}</span>
                        {task.status === 'Completed' ? (
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                        ) : overdue ? (
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-rose-400" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
