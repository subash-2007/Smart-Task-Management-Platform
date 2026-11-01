import React, { useState, useEffect } from 'react';
import { ReportsAnalytics } from '../types';
import { api } from '../api';
import {
  BarChart3,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await api.getReportsAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      await api.downloadTasksCSV();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not download CSV export.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Generating Analytics Reports...</span>
        </div>
      </div>
    );
  }

  const { summary, project_progress, category_breakdown, monthly_productivity } = data;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive productivity audits, project health indexes, and full dataset export.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Generating CSV...' : 'Export Dataset to CSV'}
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Task Completion Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-2 mb-1">
            {summary.completion_rate}%
          </div>
          <p className="text-[10px] text-slate-400">
            {summary.completed_tasks} of {summary.total_tasks} completed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Active Pipeline</span>
          <div className="text-2xl font-black text-indigo-400 mt-2 mb-1">
            {summary.in_progress_tasks + summary.in_review_tasks}
          </div>
          <p className="text-[10px] text-slate-400">In Progress & In Review</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Backlog (Pending)</span>
          <div className="text-2xl font-black text-slate-200 mt-2 mb-1">
            {summary.pending_tasks}
          </div>
          <p className="text-[10px] text-slate-400">Awaiting execution</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Overdue Incidents</span>
          <div
            className={`text-2xl font-black mt-2 mb-1 ${
              summary.overdue_tasks > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {summary.overdue_tasks}
          </div>
          <p className="text-[10px] text-slate-400">
            {summary.overdue_tasks > 0 ? 'Requires immediate action' : 'Zero overdue items'}
          </p>
        </div>
      </div>

      {/* Monthly Productivity Trend Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Monthly Productivity & Throughput
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Long-term cadence of created tasks vs completed tasks
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-3 h-3 rounded-sm bg-indigo-500"></span> Created
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Completed
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly_productivity}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Project Progress Report & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Report */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              Project Progress Audit
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Execution percentage per initiative</p>
          </div>

          <div className="space-y-4">
            {project_progress.map((p) => (
              <div key={p.project_id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-200">{p.name}</span>
                  <span className="text-indigo-400">{p.completion_rate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${p.completion_rate}%`,
                      backgroundColor: p.color || '#6366f1',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    {p.completed_tasks} / {p.total_tasks} tasks finished
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Category Workload Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Task volumes by functional domain</p>
          </div>

          <div className="space-y-3">
            {category_breakdown.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-200">{cat.category}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cat.completed} completed of {cat.total} total
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">{cat.rate}%</span>
                  <span className="block text-[10px] text-slate-400">rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
