
import { useRef, useEffect, useState } from 'react';
import type { CommunityMessage } from '@/types/community-chat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MessageListProps {
  messages: CommunityMessage[];
  shoulScroll: boolean; // Keep the typo for compatibility
}

interface UserInfo {
  [key: string]: string;
}

export default function MessageList({ messages, shoulScroll = false }: MessageListProps) {
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [usernames, setUsernames] = useState<UserInfo>({});

  useEffect(() => {
    if (shoulScroll) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shoulScroll]);

  useEffect(() => {
    const fetchUsernames = async () => {
      const uniqueUserIds = [...new Set(messages.map(msg => msg.user_id))];
      const userInfoMap: UserInfo = {};

      // Fetch usernames for all unique user IDs
      const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', uniqueUserIds);

      if (error) {
        console.error('Error fetching usernames:', error);
        return;
      }

      data.forEach(profile => {
        userInfoMap[profile.id] = profile.username || `Utilisateur ${profile.id.slice(0, 8)}`;
      });

      setUsernames(userInfoMap);
    };

    if (messages.length > 0) {
      fetchUsernames();
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.user_id === user?.id ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] ${
              message.user_id === user?.id
                ? 'bg-emergency text-white'
                : 'bg-gray-100'
            }`}
          >
            <div className="px-3 pt-2 text-xs font-medium opacity-75">
              {usernames[message.user_id] || 'Chargement...'}
            </div>
            <div className="p-3 pt-1">
              <p className="text-sm">{message.message_text}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
