import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useToast } from '@/components/ui/use-toast'
import { MessageSquare, AlertTriangle } from 'lucide-react'
import type { ChatTopic, CommunityMessage } from '@/types/community-chat'
import TopicRegionSelector from './community-chat/TopicRegionSelector'
import MessageList from './community-chat/MessageList'
import MessageInput from './community-chat/MessageInput'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Report {
  id: string
  title: string
  created_at: string
}

export default function CommunityChat() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>('autre')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [activeTab, setActiveTab] = useState('community')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const prevMsgCount = useRef(0)

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
        '[data-radix-scroll-area-viewport]'
    )
    viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    // initial load
    if (activeTab === 'community') {
      loadCommunityMessages()
    } else {
      loadReportMessages()
    }

    const table = activeTab === 'community' ? 'community_chats' : 'report_messages'
    const filterObj =
        activeTab === 'community'
            ? { topic: selectedTopic }
            : selectedReport
                ? { report_id: selectedReport }
                : undefined

    const filter = filterObj
        ? Object.entries(filterObj)
            .map(([k, v]) =>
                k === 'region' ? `region=like.${v}` : `${k}=eq.${v}`
            )
            .join(',')
        : undefined

    const chan = supabase
        .channel('postgres_changes')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table, filter },
            ({ new: payload }) => {
              if (!payload) return
              setMessages(prev =>
                  prev.some(m => m.id === payload.id)
                      ? prev
                      : [...prev, payload as CommunityMessage]
              )
            }
        )
        .subscribe()

    setChannel(chan)
    return () => {
      supabase.removeChannel(chan)
    }
  }, [activeTab, selectedTopic, selectedRegion, selectedReport])

  // only scroll when messages array grows
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      scrollToBottom()
    }
    prevMsgCount.current = messages.length
  }, [messages])

  const loadCommunityMessages = async () => {
    try {
      let query = supabase
          .from('community_chats')
          .select('*')
          .order('created_at', { ascending: true })
      if (selectedRegion) query = query.eq('region', selectedRegion)
      if (selectedTopic) query = query.eq('topic', selectedTopic)
      const { data, error } = await query
      if (error) throw error
      setMessages(
          (data || []).map(msg => ({
            ...msg,
            topic: msg.topic || selectedTopic,
            region: msg.region || selectedRegion,
          })) as CommunityMessage[]
      )
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les messages',
      })
    }
  }

  const loadReportMessages = async () => {
    try {
      const { data: reps, error: repErr } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
      if (repErr) throw repErr
      setReports(reps || [])

      if (selectedReport) {
        const { data: msgs, error: msgErr } = await supabase
            .from('report_messages')
            .select('*')
            .eq('report_id', selectedReport)
            .order('created_at', { ascending: true })
        if (msgErr) throw msgErr
        setMessages(
            (msgs || []).map(msg => ({
              ...msg,
              topic: undefined,
              region: undefined,
            })) as CommunityMessage[]
        )
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les signalements',
      })
    }
  }

  const sendMessage = async () => {
    if (
        !newMessage.trim() ||
        !user ||
        (activeTab === 'community' && !selectedRegion)
    ) {
      if (activeTab === 'community' && !selectedRegion) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Veuillez sélectionner une région',
        })
      }
      return
    }

    try {
      const table =
          activeTab === 'community' ? 'community_chats' : 'report_messages'
      const payload =
          activeTab === 'community'
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
              }

      const { data, error } = await supabase.from(table).insert(payload).select()
      if (error) throw error

      setNewMessage('')
      toast({ description: 'Message envoyé' })

      if (data?.length) {
        setMessages(prev => [...prev, data[0] as CommunityMessage])
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
      <div className="h-[600px] bg-white shadow-lg rounded-lg flex flex-col">
        <Tabs defaultValue="community" onValueChange={setActiveTab}>
          <div className="p-4 border-b border-gray-200">
            <TabsList className="w-full">
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Chat Communautaire
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Signalements
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
                  onChange={e => setSelectedReport(e.target.value)}
              >
                <option value="">Sélectionner un signalement</option>
                {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                ))}
              </select>
            </TabsContent>
          </div>
        </Tabs>

        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {activeTab === 'community' ? (
              selectedTopic && selectedRegion ? (
                  <MessageList messages={messages} />
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Veuillez sélectionner un sujet et une région pour afficher les messages.
                  </div>
              )
          ) : selectedReport ? (
              <MessageList messages={messages} />
          ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sélectionner un signalement
              </div>
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
  )
}