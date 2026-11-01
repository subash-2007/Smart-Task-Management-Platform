import React from 'react';
import { NotificationItem } from '../types';
import { Check, CheckCheck, Clock, AlertTriangle, PartyPopper, Bell, X } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onSelectTask?: (taskId: number) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'completion':
        return <PartyPopper className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-100 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-indigo-500/10 cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-800/50 ${
                !n.is_read ? 'bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 mt-0.5 shrink-0">
                {getIcon(n.type)}
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  if (n.task_id && onSelectTask) onSelectTask(n.task_id);
                  if (!n.is_read) onMarkAsRead(n.id);
                }}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(n.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => onMarkAsRead(n.id)}
                  className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
