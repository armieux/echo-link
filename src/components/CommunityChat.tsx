import { useState, useEffect, useRef } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;

    // Get the viewport element via data-radix-scroll-area-viewport
    const viewportElement = scrollAreaRef.current.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]"
    );

    if (viewportElement) {
      viewportElement.scrollTo({
        top: viewportElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Load messages only when selectedTopic or selectedRegion changes
    if (activeTab === 'community') {
      loadCommunityMessages();
    } else {
      loadReportMessages();
    }

    // Set up real-time subscription
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
                      : undefined,
            },
            (payload) => {
              setMessages((prev) => {
                const isDuplicate = prev.some((msg) => msg.id === payload.new.id);
                if (isDuplicate) return prev;

                return [...prev, payload.new as CommunityMessage];
              });

              // Scroll to bottom when a new message arrives
              setTimeout(scrollToBottom, 100);
            }
        )
        .subscribe();

    setChannel(channel);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, selectedTopic, selectedRegion, selectedReport]);

  const loadCommunityMessages = async () => {
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

      // Add topic and region to match CommunityMessage type
      const messagesWithDefaults = (data || []).map(msg => ({
        ...msg,
        topic: msg.topic || selectedTopic,
        region: msg.region || selectedRegion
      })) as CommunityMessage[];

      setMessages(messagesWithDefaults);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages",
      });
    }
  };

  const loadReportMessages = async () => {
    try {
      // First load reports
      const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Then load messages if a report is selected
      if (selectedReport) {
        const { data: messagesData, error: messagesError } = await supabase
            .from('report_messages')
            .select('*')
            .eq('report_id', selectedReport)
            .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Convert to CommunityMessage type
        const messagesWithDefaults = (messagesData || []).map(msg => ({
          ...msg,
          topic: undefined,
          region: undefined
        })) as CommunityMessage[];

        setMessages(messagesWithDefaults);
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
            user_id: user.id,
          }
          : {
            message_text: newMessage.trim(),
            report_id: selectedReport,
            user_id: user.id,
          };

      const { data, error } = await supabase
          .from(table)
          .insert(messageData)
          .select();

      if (error) throw error;

      setNewMessage('');
      toast({
        description: "Message envoyé",
      });

      // Append the new message to the messages state
      if (data && data.length > 0) {
        const newMsg = data[0] as CommunityMessage;
        setMessages((prev) => [...prev, newMsg]);
        // Scroll to bottom after sending a message
        setTimeout(scrollToBottom, 100);
      }
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
      <div className="h-[600px] bg-white shadow-lg rounded-lg flex flex-col">
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

        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {activeTab === 'community' ? (
              (selectedTopic && selectedRegion) ? (
                  <MessageList messages={messages} shouldScroll={false} />
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Veuillez sélectionner un sujet et une région pour afficher les messages.
                  </div>
              )
          ) : (
              selectedReport ? (
                  <MessageList messages={messages} shouldScroll={false} />
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Sélectionner un signalement
                  </div>
              )
          )}
        </ScrollArea>

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