import { useRef, useEffect, useState } from 'react';
import type { CommunityMessage } from '@/types/community-chat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: CommunityMessage[];
  shouldScroll?: boolean; // Fixed the typo from 'shoulScroll' to 'shouldScroll'
}

interface UserInfo {
  [key: string]: string;
}

export default function MessageList({ messages, shouldScroll = true }: MessageListProps) {
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [usernames, setUsernames] = useState<UserInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  useEffect(() => {
    const fetchUsernames = async () => {
      setIsLoading(true);
      const uniqueUserIds = [...new Set(messages.map(msg => msg.user_id))];
      const userInfoMap: UserInfo = {};

      try {
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
      } catch (error) {
        console.error('Error in fetchUsernames:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (messages.length > 0) {
      fetchUsernames();
    } else {
      setIsLoading(false);
    }
  }, [messages]);


  const renderMessageContent = (text: string) => {
    const parts = text.split(/\s+/);

    return parts.map((part, index) => {
      const isUrl = /^(https?:\/\/[^\s]+)$/.test(part);
      const isImage = isUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(part);

      if (isImage) {
        return (
            <img
                key={index}
                src={part}
                alt="Message attachment"
                className="max-w-full h-auto rounded-lg my-2"
                loading="lazy"
            />
        );
      } else if (isUrl) {
        return (
            <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
            >
              {part}
            </a>
        );
      }
      return <span key={index}>{part} </span>;
    });
  };

  if (isLoading) {
    return (
        <div className="flex-1 flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-emergency" />
        </div>
    );
  }

  return (
      <div ref={messageListRef} className="p-4 space-y-4">
        {messages.map((message) => (
            <div
                key={message.id}
                className={`flex ${
                    message.user_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                  className={`max-w-[80%] rounded-lg overflow-hidden ${
                      message.user_id === user?.id
                          ? 'bg-emergency text-white'
                          : 'bg-gray-100'
                  }`}
              >
                <div className="px-3 pt-2 text-xs font-medium opacity-75">
                  {usernames[message.user_id] || 'Chargement...'}
                </div>
                <div className="p-3 pt-1">
                  <p className="text-sm break-words">
                    {renderMessageContent(message.message_text)}
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
        ))}
        <div ref={messageEndRef} />
      </div>
  );
}