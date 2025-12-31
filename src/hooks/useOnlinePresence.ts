import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineUser {
  user_id: string;
  name: string;
  online_at: string;
}

export function useOnlinePresence() {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user || !profile) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          if (presences.length > 0) {
            users.push({
              user_id: key,
              name: presences[0].name || 'Unknown',
              online_at: presences[0].online_at,
            });
          }
        });
        
        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: profile.name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile]);

  return { onlineUsers, onlineCount };
}
