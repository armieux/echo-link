
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from 'lucide-react';
import type { ChatTopic, CommunityMessage } from '@/types/community-chat';

const TOPICS: { value: ChatTopic; label: string }[] = [
  { value: 'premiers_secours', label: 'Premiers Secours' },
  { value: 'pannes_voiture', label: 'Pannes de Voiture' },
  { value: 'secours_montagne', label: 'Secours en Montagne' },
  { value: 'urgences_medicales', label: 'Urgences Médicales' },
  { value: 'catastrophes_naturelles', label: 'Catastrophes Naturelles' },
  { value: 'autre', label: 'Autre' }
];

const REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Hauts-de-France',
  'Grand Est',
  'Provence-Alpes-Côte d\'Azur',
  'Pays de la Loire',
  'Normandie',
  'Bretagne',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
  'Corse'
];

export default function CommunityChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>('autre');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Initial messages load
    loadMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('community-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_chats',
          filter: selectedRegion 
            ? `region=eq.${selectedRegion}` 
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

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('community_chats')
        .select('*')
        .order('created_at', { ascending: true });

      if (selectedRegion) {
        query = query.eq('region', selectedRegion);
      } else {
        query = query.eq('topic', selectedTopic);
      }

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
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('community_chats')
        .insert({
          message_text: newMessage.trim(),
          topic: selectedTopic,
          region: selectedRegion || null,
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
        
        <div className="flex gap-4">
          <Select
            value={selectedTopic}
            onValueChange={(value: ChatTopic) => {
              setSelectedTopic(value);
              setSelectedRegion('');
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir un thème" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map(topic => (
                <SelectItem key={topic.value} value={topic.value}>
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedRegion}
            onValueChange={(value: string) => {
              setSelectedRegion(value);
              setSelectedTopic('autre');
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir une région" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            className="bg-emergency hover:bg-emergency/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
