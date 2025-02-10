
import { createContext, useContext, useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  report_id: string | null;
  is_read: boolean;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (receiverId: string, text: string, reportId?: string) => Promise<void>;
  isTyping: { [key: string]: boolean };
  setUserTyping: (receiverId: string, isTyping: boolean) => void;
  loadMessageHistory: (reportId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id},receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    setChannel(channel);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (receiverId: string, text: string, reportId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message_text: text,
        report_id: reportId || null,
      });

      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    }
  };

  const loadMessageHistory = async (reportId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger l'historique des messages",
      });
    }
  };

  const setUserTyping = (receiverId: string, typing: boolean) => {
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user?.id, typing },
    });

    setIsTyping((prev) => ({
      ...prev,
      [receiverId]: typing,
    }));
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const value = {
    messages,
    sendMessage,
    isTyping,
    setUserTyping,
    loadMessageHistory,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
