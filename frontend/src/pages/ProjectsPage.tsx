import React, { useState, useEffect } from 'react';
import { Project, Task } from '../types';
import { api } from '../api';
import {
  FolderKanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  onOpenCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onRefreshProjects: () => void;
  onFilterByProject: (projectId: number) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onOpenCreateProject,
  onEditProject,
  onRefreshProjects,
  onFilterByProject,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!window.confirm(`Delete project '${project.name}' and all associated tasks?`)) return;
    try {
      await api.deleteProject(project.id);
      onRefreshProjects();
      if (selectedProject?.id === project.id) {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const loadProjectTasks = async (p: Project) => {
    setSelectedProject(p);
    setIsLoadingTasks(true);
    try {
      const data = await api.getTasks({ project_id: p.id });
      setProjectTasks(data);
    } catch (err) {
      console.error('Failed to load project tasks:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize roadmaps, align milestones, and track completion progress across initiatives.
          </p>
        </div>
        <button
          onClick={onOpenCreateProject}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-600 stroke-1" />
            <h3 className="text-sm font-bold text-slate-200">No active projects</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create your first project to start grouping tasks and monitoring velocity.
            </p>
            <button
              onClick={onOpenCreateProject}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
            >
              Create Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => loadProjectTasks(project)}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer group hover:translate-y-[-2px]"
            >
              <div>
                {/* Header: Color Accent Bar & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-sm"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  >
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        project.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : project.status === 'In Progress'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {project.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Progress & Milestone Info */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Completion</span>
                  <span className="text-slate-200">{project.completion_rate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${project.completion_rate}%`,
                      backgroundColor: project.color || '#6366f1',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {project.completed_tasks} / {project.total_tasks} tasks
                  </span>
                  {project.deadline && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {project.deadline}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterByProject(project.id);
                    }}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    View Tasks <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Project Tasks Drawer / Modal */}
      {selectedProject && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Project Detail
              </span>
              <h2 className="text-lg font-bold text-slate-100">{selectedProject.name}</h2>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>

          {isLoadingTasks ? (
            <p className="text-xs text-slate-400 py-4">Loading tasks...</p>
          ) : projectTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No tasks associated with this project.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {projectTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-indigo-400 font-bold">
                      {t.task_id_code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200">{t.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
