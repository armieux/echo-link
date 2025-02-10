
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  handleKeyPress
}: MessageInputProps) {
  return (
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
  );
}
