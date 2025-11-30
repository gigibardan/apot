import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToThread, unsubscribeFromThread, isSubscribedToThread } from "@/lib/supabase/mutations/subscriptions";
import { toast } from "sonner";

interface SubscribeButtonProps {
  postId: string;
}

export function SubscribeButton({ postId }: SubscribeButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isSubscribed = false } = useQuery({
    queryKey: ['thread-subscription', postId, user?.id],
    queryFn: () => isSubscribedToThread(postId),
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeToThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-subscription', postId] });
      toast.success('Te-ai abonat la acest thread');
    },
    onError: () => {
      toast.error('Nu te-ai putut abona');
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: unsubscribeFromThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-subscription', postId] });
      toast.success('Te-ai dezabonat de la acest thread');
    },
    onError: () => {
      toast.error('Nu te-ai putut dezabona');
    },
  });

  if (!user) return null;

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeMutation.mutate(postId);
    } else {
      subscribeMutation.mutate(postId);
    }
  };

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={handleToggleSubscription}
      disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Dezabonează-te
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Abonează-te
        </>
      )}
    </Button>
  );
}
