import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Star, 
  Info, 
  Users, 
  Trash2,
  Check,
  MoreVertical
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/ui/Toast';
import { useActionConfirm } from '../../components/ui/ActionConfirm';
import type { RootState } from '../../store';
import { formatDateTimeIST } from '../../utils/dateTime';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { requestConfirmation } = useActionConfirm();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', userId || 'unknown'],
    queryFn: () => notificationService.getNotifications(0, 50),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      showToast({ message: 'All notifications marked as read', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: () => notificationService.clearAllNotifications(),
    onSuccess: () => {
      showToast({ message: 'All notifications deleted', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const notifications = notificationsData?.content || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleDeleteNotification = async (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleDeleteAllNotifications = async () => {
    const confirmed = await requestConfirmation({
      title: 'Clear All Notifications?',
      message: 'This will permanently remove all your notification history. Continue?',
      confirmLabel: 'Clear All',
    });

    if (confirmed) {
      clearAllNotificationsMutation.mutate();
    }
  };

  const getNotificationConfig = (type: string) => {
    const configs: Record<string, { icon: any; color: string }> = {
      SESSION_REQUEST: { icon: Calendar, color: 'text-primary' },
      SESSION_REQUESTED: { icon: Calendar, color: 'text-primary' },
      SESSION_ACCEPTED: { icon: CheckCircle2, color: 'text-emerald-500' },
      SESSION_APPROVED: { icon: CheckCircle2, color: 'text-emerald-500' },
      SESSION_REJECTED: { icon: XCircle, color: 'text-error' },
      SESSION_CANCELLED: { icon: XCircle, color: 'text-error' },
      SESSION_COMPLETED: { icon: CheckCircle2, color: 'text-emerald-500' },
      MENTOR_APPROVED: { icon: Star, color: 'text-amber-500' },
      REVIEW_RECEIVED: { icon: Star, color: 'text-primary' },
      SYSTEM: { icon: Info, color: 'text-on-surface-variant' },
      GROUP_INVITE: { icon: Users, color: 'text-secondary' },
    };
    return configs[type] || { icon: Info, color: 'text-on-surface-variant' };
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-4xl font-display font-bold text-on-surface tracking-tight mb-2">Notifications</h1>
            <p className="text-on-surface-variant font-medium opacity-80">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''} waiting for review.`
                : 'Your inbox is clear. We\'ll notify you of new activities here.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="btn-secondary h-10 px-5 text-xs gap-2"
              >
                <Check size={14} />
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAllNotifications}
                disabled={clearAllNotificationsMutation.isPending}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low border border-outline/10 text-on-surface-variant hover:text-error hover:bg-error/5 transition-all"
                title="Clear all"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* List Section */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 surface-card animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { icon: Icon, color } = getNotificationConfig(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`group relative surface-card p-5 flex items-start gap-5 transition-all duration-300 ${
                    !notification.isRead ? 'border-primary/20 bg-primary/[0.02]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`mt-1 w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-outline/5 transition-transform group-hover:scale-105 ${color}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-bold text-on-surface truncate ${!notification.isRead ? 'text-base' : 'text-sm'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                      {formatDateTimeIST(notification.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-all"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="surface-card p-20 text-center flex flex-col items-center border-dashed bg-transparent">
            <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center mb-6 text-on-surface-variant/20">
              <Bell size={40} />
            </div>
            <p className="text-xl font-bold text-on-surface mb-2">Inbox is clear</p>
            <p className="text-on-surface-variant font-medium max-w-xs opacity-60">
              You'll receive updates here about session bookings, reviews, and community activity.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default NotificationsPage;
