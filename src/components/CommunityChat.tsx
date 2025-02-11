
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';
import type { ChatTopic, CommunityMessage } from '@/types/community-chat';
import TopicRegionSelector from './community-chat/TopicRegionSelector';
import MessageList from './community-chat/MessageList';
import MessageInput from './community-chat/MessageInput';

export default function CommunityChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>('autre');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('community-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chats',
          filter: selectedRegion 
            ? `region=eq.${selectedRegion} and topic=eq.${selectedTopic}`
            : `topic=eq.${selectedTopic}`
        },
        (payload) => {
          const newMessage = payload.new as CommunityMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [selectedTopic, selectedRegion]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('community_chats')
        .select('*')
        .order('created_at', { ascending: true });

      if (selectedRegion) {
        query = query.eq('region', selectedRegion);
      }
      query = query.eq('topic', selectedTopic);

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedRegion) {
      if (!selectedRegion) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner une région",
        });
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('community_chats')
        .insert({
          message_text: newMessage.trim(),
          topic: selectedTopic,
          region: selectedRegion,
          user_id: user.id
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        description: "Message envoyé",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-emergency" />
          <h2 className="font-semibold">Chat Communautaire</h2>
        </div>
        
        <TopicRegionSelector
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      </div>

      <MessageList messages={messages} shoulScroll={false} />

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
      />
    </div>
  );
}
