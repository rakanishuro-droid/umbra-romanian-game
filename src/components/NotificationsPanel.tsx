import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const NotificationsPanel = ({ player, onUpdate }: { player: any; onUpdate: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    if (!player) return;
    const notifs = await db.query('notifications', { 
      player_id: `eq.${player._row_id}`, 
      order: '_created_at.desc',
      limit: '20'
    });
    setNotifications(notifs);
  };

  useEffect(() => { loadNotifications(); }, [player]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [player]);

  const markAsRead = async (notifId: number) => {
    await db.update('notifications', { _row_id: `eq.${notifId}` }, { read: 1 });
    loadNotifications();
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await db.update('notifications', { _row_id: `eq.${notif._row_id}` }, { read: 1 });
    }
    loadNotifications();
  };

  if (!player) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-crimson text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="font-display text-sm tracking-wider">NOTIFICĂRI ({unreadCount} noi)</span>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nu ai notificări.</p>
            ) : (
              <div className="space-y-1">
                {notifications.map(notif => (
                  <div
                    key={notif._row_id}
                    className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                      !notif.read ? 'bg-crimson/10 border border-crimson/30' : 'bg-secondary/30'
                    }`}
                    onClick={() => !notif.read && markAsRead(notif._row_id)}
                  >
                    <div className="flex items-start gap-2">
                      {notif.type === 'warning' && <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5" />}
                      {notif.type === 'success' && <Check className="w-3 h-3 text-green-400 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-medium mb-0.5">{notif.title}</div>
                        <div className="text-muted-foreground">{notif.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-2 border-t border-border text-xs text-muted-foreground hover:text-foreground"
            >
              Marchează toate ca citite
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationsPanel;
