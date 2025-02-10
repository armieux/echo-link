
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useAI } from "@/contexts/AIContext";
import { Bot, Send, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AIAssistant = () => {
  const { messages, isLoading, sendMessage } = useAI();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white shadow-lg">
      <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Assistant EchoLink</h2>
      </div>

      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              Bonjour ! Je suis l'assistant EchoLink. Je peux vous aider avec :
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Les gestes de premiers secours</li>
              <li>• La gestion du stress en situation d'urgence</li>
              <li>• Les pannes de véhicule</li>
              <li>• Les situations d'urgence médicale</li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-2 items-start",
              message.role === "assistant" ? "flex-row" : "flex-row-reverse"
            )}
          >
            {message.role === "assistant" ? (
              <Bot className="h-8 w-8 p-1.5 rounded-full bg-primary/10 text-primary shrink-0" />
            ) : (
              <User className="h-8 w-8 p-1.5 rounded-full bg-gray-100 text-gray-600 shrink-0" />
            )}
            
            <div className={cn(
              "rounded-lg p-3 max-w-[80%]",
              message.role === "assistant" 
                ? "bg-primary/5 text-gray-800" 
                : "bg-primary text-white"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {format(message.timestamp, "HH:mm", { locale: fr })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">L'assistant réfléchit...</span>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question ici..."
            className="min-h-[50px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AIAssistant;
