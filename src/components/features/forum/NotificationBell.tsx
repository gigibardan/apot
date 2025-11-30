import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  type ForumNotification,
} from "@/lib/supabase/queries/notifications";
import { toast } from "sonner";

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['forum-notifications', user?.id],
    queryFn: () => user ? getUserNotifications(user.id, { limit: 10 }) : Promise.resolve({ notifications: [], count: 0 }),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['forum-notifications-unread', user?.id],
    queryFn: () => user ? getUnreadCount(user.id) : Promise.resolve(0),
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, (notification) => {
      // Show toast notification
      toast.info(notification.message);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['forum-notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-notifications-unread', user.id] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-notifications-unread', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => user ? markAllNotificationsAsRead(user.id) : Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['forum-notifications-unread', user?.id] });
      toast.success('Toate notificările au fost marcate ca citite');
    },
  });

  const handleNotificationClick = async (notification: ForumNotification) => {
    // Mark as read
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    // Navigate to post
    if (notification.post && notification.category) {
      const categorySlug = (notification.category as any).slug;
      navigate(`/forum/${categorySlug}/${notification.post.slug}`);
      setOpen(false);
    }
  };

  if (!user) return null;

  const notifications = notificationsData?.notifications || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificări</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              <Check className="h-4 w-4 mr-1" />
              Marchează tot
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nu ai notificări noi</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const actorName = notification.actor?.full_name || 'Utilizator';
                const actorInitials = actorName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-muted/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={notification.actor?.avatar_url || undefined} />
                        <AvatarFallback>{actorInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">
                          {notification.message}
                        </p>
                        {notification.post && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {notification.post.title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ro,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
