
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationDto } from '@/hooks/useNotifications';
import NotificationHeader from '../components/NotificationHeader';
import NotificationFilter from '../components/NotificationFilter';
import NotificationList from '../components/NotificationList';
import type { NotificationCategory } from '../components/NotificationFilter';
import NotificationControls from '@/components/engagement/NotificationControls';
import { useEngagement } from '@/features/engagement/EngagementContext';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications: sourceNotifs, isLoading, markRead, markAllRead, deleteNotification } = useNotifications();
  const { preferences, pinNotification, unpinNotification, snoozeNotification, isSnoozed } = useEngagement();
  
  // Step 1: Local ID persistence for bug fix
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ss_read_ids');
    return saved ? new Set(JSON.parse(saved).map(Number)) : new Set();
  });
  
  const [deletedIds, setDeletedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ss_deleted_ids');
    return saved ? new Set(JSON.parse(saved).map(Number)) : new Set();
  });

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  // Step 2 & 8: Smart Merging with Extra Features (Mute/Snooze/Pin)
  const localNotifs = useMemo(() => {
    return (sourceNotifs as NotificationDto[])
      .filter(n => {
        // Correcting visibility based on Muting & Snoozing
        const id = Number(n.id);
        if (deletedIds.has(id)) return false;
        if (isSnoozed(id)) return false;
        
        // Mute logic (Sessions/Updates)
        const type = n.type.toUpperCase();
        if (preferences.mutedCategories.includes('sessions') && (type.includes('SESSION') || type.includes('MENTOR'))) return false;
        if (preferences.mutedCategories.includes('updates') && type.includes('ALERT')) return false;

        return true;
      })
      .map(n => ({
        ...n,
        isRead: n.isRead || readIds.has(Number(n.id))
      }))
      // Sort: Pinned First, then by date
      .sort((a, b) => {
        const aPinned = preferences.pinnedIds.includes(Number(a.id));
        const bPinned = preferences.pinnedIds.includes(Number(b.id));
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0; // Maintain relative date order from backend/list utility
      });
  }, [sourceNotifs, readIds, deletedIds, preferences, isSnoozed]);

  // Derived Counters
  const unreadCount = useMemo(() => localNotifs.filter(n => !n.isRead).length, [localNotifs]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ss_read_ids', JSON.stringify(Array.from(readIds)));
    localStorage.setItem('ss_deleted_ids', JSON.stringify(Array.from(deletedIds)));
  }, [readIds, deletedIds]);

  // Handlers
  const handleMarkAllRead = async () => {
    const newReadIds = new Set(readIds);
    sourceNotifs.forEach((n: NotificationDto) => newReadIds.add(n.id));
    setReadIds(newReadIds);
    try { await markAllRead(); } catch (err) { console.warn('Sync issues:', err); }
  };

  const handleMarkRead = async (id: number) => {
    setReadIds(prev => new Set(prev).add(id));
    try { await markRead(id); } catch (err) { console.warn('Sync issues:', err); }
  };

  const handleDelete = async (id: number) => {
    setDeletedIds(prev => new Set(prev).add(id));
    try { await deleteNotification(id); } catch (err) { console.warn('Sync issues:', err); }
  };

  const handlePin = (id: number) => {
    if (preferences.pinnedIds.includes(id)) unpinNotification(id);
    else pinNotification(id);
  };

  const handleSnooze = (id: number) => {
    snoozeNotification(id, 1); // Snooze for 1 hour as per design
  };

  const handleAction = (n: NotificationDto) => {
    handleMarkRead(n.id);
    const type = n.type.toUpperCase();
    if (type.includes('SESSION')) navigate('/sessions');
    else if (type.includes('PROFILE')) navigate('/profile');
    else if (type.includes('GROWTH')) navigate('/growth');
  };

  // Category Filtering
  const filteredNotifs = useMemo(() => {
    if (activeCategory === 'important') {
      const keywords = ['URGENT', 'ALERT', 'IMPORTANT', 'CRITICAL'];
      return localNotifs.filter(n => keywords.some(k => n.type.toUpperCase().includes(k)) || n.type.toUpperCase().includes('ACHIEVEMENT'));
    }
    if (activeCategory === 'activity') {
      return localNotifs.filter(n => n.type.toUpperCase().includes('SESSION') || n.type.toUpperCase().includes('MENTOR'));
    }
    if (activeCategory === 'system') {
      return localNotifs.filter(n => !n.type.toUpperCase().includes('SESSION') && !n.type.toUpperCase().includes('MENTOR') && !n.type.toUpperCase().includes('ALERT'));
    }
    return localNotifs;
  }, [localNotifs, activeCategory]);

  const counts: Record<NotificationCategory, number> = useMemo(() => {
    const keywords = ['URGENT', 'ALERT', 'IMPORTANT', 'CRITICAL'];
    return {
      all: localNotifs.length,
      important: localNotifs.filter(n => keywords.some(k => n.type.toUpperCase().includes(k))).length,
      activity: localNotifs.filter(n => n.type.toUpperCase().includes('SESSION')).length,
      system: localNotifs.filter(n => !n.type.toUpperCase().includes('SESSION') && !n.type.toUpperCase().includes('ALERT')).length
    };
  }, [localNotifs]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto p-4 lg:p-20 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in font-sans pb-32">
        
        {/* Left: Main Notification Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-10">
          <NotificationHeader 
            totalCount={localNotifs.length}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={() => setDeletedIds(new Set([...Array.from(deletedIds), ...sourceNotifs.map((n: NotificationDto) => n.id)]))}
          />

          <NotificationFilter 
            activeCategory={activeCategory}
            counts={counts}
            onCategoryChange={setActiveCategory}
          />

          <NotificationList 
            notifications={filteredNotifs}
            isLoading={isLoading && localNotifs.length === 0}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            onAction={handleAction}
            onPin={handlePin}
            onSnooze={handleSnooze}
            pinnedIds={preferences.pinnedIds}
          />
        </div>

        {/* Right: Engagement Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
           <div className="sticky top-28 space-y-8">
              <NotificationControls />
              <div className="p-8 bg-primary/5 border border-primary/10 rounded-[32px] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
                 <h5 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Smart Management</h5>
                 <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-wider italic">
                    Pinned items sit at the very top. <br /> Muted categories are hidden automatically. <br /> Snoozed items reappear in 1 hour.
                 </p>
              </div>
           </div>
        </div>

        {/* Global Loading Indicator */}
        {isLoading && localNotifs.length > 0 && (
          <div className="fixed bottom-8 right-8 animate-spin">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
