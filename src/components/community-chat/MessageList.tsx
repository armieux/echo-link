
import { useRef, useEffect } from 'react';
import type { CommunityMessage } from '@/types/community-chat';
import { useAuth } from '@/contexts/AuthContext';

interface MessageListProps {
  messages: CommunityMessage[];
  shoulScroll: boolean; // Keep the typo for compatibility
}

export default function MessageList({ messages, shoulScroll = false }: MessageListProps) {
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shoulScroll) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shoulScroll]);

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
            className={`max-w-[80%] p-3 rounded-lg ${
              message.user_id === user?.id
                ? 'bg-emergency text-white'
                : 'bg-gray-100'
            }`}
          >
            <p className="text-sm">{message.message_text}</p>
            <p className="text-xs mt-1 opacity-70">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}
