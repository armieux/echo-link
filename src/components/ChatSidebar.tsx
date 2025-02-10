
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  message_text: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  report_id: string | null;
  is_read: boolean;
}

const ChatSidebar = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isTyping, setUserTyping, loadMessageHistory } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !user) return;
    
    try {
      await sendMessage(activeChat, message.trim());
      setMessage("");
      toast({
        description: "Message envoyé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (activeChat) {
      setUserTyping(activeChat, e.target.value.length > 0);
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-emergency h-5 w-5" />
          <h2 className="font-semibold">Chat Communautaire</h2>
        </div>
      </div>

      {/* Conversations List */}
      <div className="p-4 border-b border-gray-200 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Conversations</h3>
        <div className="space-y-2">
          {Object.entries(groupedMessages).map(([userId, msgs]) => {
            const lastMessage = msgs[msgs.length - 1];
            const unread = msgs.some(m => !m.is_read && m.receiver_id === user?.id);
            
            return (
              <Card
                key={userId}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  activeChat === userId ? "border-emergency" : ""
                }`}
                onClick={() => setActiveChat(userId)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Utilisateur {userId.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage.message_text}
                    </p>
                  </div>
                  {unread && (
                    <div className="w-2 h-2 rounded-full bg-emergency" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {activeChat && messages
            .filter(msg => msg.sender_id === activeChat || msg.receiver_id === activeChat)
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender_id === user?.id
                      ? "bg-emergency text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.message_text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          {isTyping[activeChat || ''] && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emergency focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            onClick={handleSend}
            className="bg-emergency hover:bg-emergency/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
