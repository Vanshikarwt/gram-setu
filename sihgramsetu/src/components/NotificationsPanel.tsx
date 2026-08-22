import React from 'react';
import { ArrowLeft, BellOff, CheckCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';
import type { NotificationType } from '../store/useStore';

interface NotificationsPanelProps {
  onClose: () => void;
}

const TYPE_ICON: Record<NotificationType, string> = {
  booking: '📋',
  payment: '💰',
  chat: '💬',
  system: '🔔',
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user, notifications, fetchNotifications, markNotificationAsRead, markAllRead } = useStore();

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const myNotifs = notifications
    .filter((n) => !n.userId || n.userId === user?.id)
    .sort((a, b) => (new Date(b.createdAt ?? b.timestamp).getTime()) - (new Date(a.createdAt ?? a.timestamp).getTime()));

  const unreadCount = myNotifs.filter((n) => !n.isRead).length;

  function timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return t('notif.justNow');
    if (diff < 3600) return `${Math.floor(diff / 60)}${t('notif.minAgo')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t('notif.hrAgo')}`;
    return `${Math.floor(diff / 86400)}${t('notif.dayAgo')}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream-50 animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-cream-800 shadow-xs">
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full hover:bg-cream-100 text-earth-700 active:scale-90 outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-base text-earth-900">{t('notif.heading')}</h1>
          {unreadCount > 0 && (
            <p className="text-[10px] text-earth-500 font-semibold">{unreadCount} {t('notif.unread')}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-rural-green-100 text-rural-green-800 border border-rural-green-200 rounded-xl text-xs font-bold active:scale-95 outline-none"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('notif.markAllRead')}
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {myNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-4">
              <BellOff className="w-10 h-10 text-earth-300" />
            </div>
            <h3 className="text-base font-bold text-earth-700 mb-1">{t('notif.none')}</h3>
            <p className="text-xs text-earth-400">{t('notif.noneDesc')}</p>
          </div>
        ) : (
          myNotifs.map((notif) => (
            <button
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              type="button"
              className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98] outline-none ${
                notif.isRead
                  ? 'bg-cream-50 border-cream-800'
                  : 'bg-rural-green-50 border-rural-green-200 shadow-xs'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                notif.isRead ? 'bg-cream-100' : 'bg-rural-green-100'
              }`}>
                {TYPE_ICON[notif.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-extrabold leading-snug ${notif.isRead ? 'text-earth-600' : 'text-earth-900'}`}>
                    {notif.title}
                  </p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rural-green-600 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-earth-500 leading-snug mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <p className="text-[10px] text-earth-400 mt-1 font-medium">
                  {timeAgo(notif.timestamp)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      {myNotifs.length > 0 && (
        <div className="px-4 py-3 border-t border-cream-800 text-center">
          <p className="text-[10px] text-earth-400 font-medium">
            {t('notif.tapToRead')}
          </p>
        </div>
      )}
    </div>
  );
};
