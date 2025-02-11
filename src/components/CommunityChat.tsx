
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import type { ChatTopic, CommunityMessage } from '@/types/community-chat';
import TopicRegionSelector from './community-chat/TopicRegionSelector';
import MessageList from './community-chat/MessageList';
import MessageInput from './community-chat/MessageInput';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function CommunityChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>('autre');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [activeTab, setActiveTab] = useState('community');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'community') {
      loadMessages();
    } else {
      loadReports();
    }

    const channel = supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: activeTab === 'community' ? 'community_chats' : 'report_messages',
          filter: activeTab === 'community' 
            ? selectedRegion 
              ? `region=eq.${selectedRegion} and topic=eq.${selectedTopic}`
              : `topic=eq.${selectedTopic}`
            : selectedReport
              ? `report_id=eq.${selectedReport}`
              : undefined
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
  }, [activeTab, selectedTopic, selectedRegion, selectedReport]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('community_chats')
        .select('*')
        .order('created_at', { ascending: true });

      if (selectedRegion) {
        query = query.eq('region', selectedRegion);
      }
      if (selectedTopic) {
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

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);

      if (selectedReport) {
        const { data: messages, error: msgError } = await supabase
          .from('report_messages')
          .select('*')
          .eq('report_id', selectedReport)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;
        setMessages(messages || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les signalements",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || (activeTab === 'community' && !selectedRegion)) {
      if (activeTab === 'community' && !selectedRegion) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner une région",
        });
      }
      return;
    }

    try {
      const table = activeTab === 'community' ? 'community_chats' : 'report_messages';
      const messageData = activeTab === 'community' 
        ? {
            message_text: newMessage.trim(),
            topic: selectedTopic,
            region: selectedRegion,
            user_id: user.id
          }
        : {
            message_text: newMessage.trim(),
            report_id: selectedReport,
            user_id: user.id
          };

      const { error } = await supabase
        .from(table)
        .insert(messageData);

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
      <Tabs defaultValue="community" className="w-full" onValueChange={setActiveTab}>
        <div className="p-4 border-b border-gray-200">
          <TabsList className="w-full">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat Communautaire
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Signalements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-4">
            <TopicRegionSelector
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <select
              className="w-full p-2 border rounded"
              value={selectedReport || ''}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="">Sélectionner un signalement</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title}
                </option>
              ))}
            </select>
          </TabsContent>
        </div>
      </Tabs>

      <MessageList 
        messages={messages}
        shouldScroll={true}
      />

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
        disabled={activeTab === 'reports' && !selectedReport}
      />
    </div>
  );
}
