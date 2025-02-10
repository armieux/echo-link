
import { useRef, useEffect, useState } from 'react';
import type { CommunityMessage } from '@/types/community-chat';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageListProps {
  messages: CommunityMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return true;
    
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop <= container.clientHeight + threshold;
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    setShowScrollButton(!isNearBottom());
  };

  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLength;
    setPrevMessagesLength(messages.length);

    if (hasNewMessages && isNearBottom()) {
      scrollToBottom();
    } else if (hasNewMessages) {
      setShowScrollButton(true);
    }
  }, [messages]);

  return (
    <div className="relative flex-1">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
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
      
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
