import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Palette,
  Database,
  Cpu,
  Shield,
  RefreshCw,
  Check,
  Code,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [completionSound, setCompletionSound] = useState(true);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const handleSavePreferences = () => {
    setSavedNote('Preferences saved successfully!');
    setTimeout(() => setSavedNote(null), 3000);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure application behavior, notification triggers, and environment details.
        </p>
      </div>

      {savedNote && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{savedNote}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications Settings */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            Notification Rules
          </h3>
          <p className="text-xs text-slate-400">
            Control automated in-app alerts and deadline notifications.
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Upcoming Deadline Reminders
                </span>
                <span className="text-[10px] text-slate-400">
                  Notify 48 hours prior to due dates
                </span>
              </div>
              <input
                type="checkbox"
                checked={deadlineAlerts}
                onChange={(e) => setDeadlineAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Overdue Task Alerts
                </span>
                <span className="text-[10px] text-slate-400">
                  Trigger priority notifications for past-due tasks
                </span>
              </div>
              <input
                type="checkbox"
                checked={overdueAlerts}
                onChange={(e) => setOverdueAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Task Completion Celebrations
                </span>
                <span className="text-[10px] text-slate-400">
                  Broadcast achievement log on finished deliverables
                </span>
              </div>
              <input
                type="checkbox"
                checked={completionSound}
                onChange={(e) => setCompletionSound(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
              />
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
          >
            Save Notification Preferences
          </button>
        </div>

        {/* Technical Architecture Info */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Architecture Stack
          </h3>
          <p className="text-xs text-slate-400">
            Engineered for high velocity and zero runtime bloat.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Frontend</span>
              <span className="font-semibold text-slate-200">React 19 + TypeScript + Vite</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Styling</span>
              <span className="font-semibold text-slate-200">Tailwind CSS v4</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Backend API</span>
              <span className="font-semibold text-slate-200">FastAPI (Python 3.10)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Database ORM</span>
              <span className="font-semibold text-slate-200">SQLite + SQLAlchemy 2.0</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Security</span>
              <span className="font-semibold text-slate-200">JWT + Bcrypt Hashing</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Visualization</span>
              <span className="font-semibold text-slate-200">Recharts + Lucide Icons</span>
            </div>
          </div>
        </div>

        {/* Demo Account Info Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Pre-Seeded Demo Account
            </h4>
            <p className="text-xs text-slate-400">
              Credentials: <code className="text-indigo-400">demo@taskflow.io</code> /{' '}
              <code className="text-indigo-400">password123</code>. Contains 5 real projects, 13+ tasks, and rich analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Database Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
