
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isVolunteer: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  unread: boolean;
}

const ChatSidebar = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Exemple de données (à remplacer par WebSocket)
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Urgence Eau",
      lastMessage: "Besoin d'aide pour trouver de l'eau potable",
      unread: true,
    },
    {
      id: "2",
      name: "Assistance routière",
      lastMessage: "Véhicule en panne sur A7",
      unread: false,
    },
    {
      id: "3",
      name: "Aide médicale",
      lastMessage: "Recherche pharmacie de garde",
      unread: false,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour, j'ai besoin d'aide pour trouver de l'eau potable.",
      sender: "User1",
      timestamp: new Date(),
      isVolunteer: false,
    },
    {
      id: "2",
      content: "Je peux vous aider. Quelle est votre localisation ?",
      sender: "Volunteer1",
      timestamp: new Date(),
      isVolunteer: true,
    },
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Simulate sending message (replace with WebSocket)
    toast({
      description: "Message envoyé avec succès",
    });
    setMessage("");
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(true);
    
    // Simulate "user is typing" (replace with WebSocket)
    setTimeout(() => setIsTyping(false), 1000);
  };

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
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeChat === conv.id ? "border-emergency" : ""
              }`}
              onClick={() => setActiveChat(conv.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread && (
                  <div className="w-2 h-2 rounded-full bg-emergency" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isVolunteer ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.isVolunteer
                    ? "bg-gray-100"
                    : "bg-emergency text-white"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
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
