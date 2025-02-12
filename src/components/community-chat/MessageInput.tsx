
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import type { MessageInputProps } from "@/types/community-chat";

export default function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  handleKeyPress,
  disabled
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
          disabled={disabled}
        />
        <Button 
          onClick={sendMessage}
          className="bg-emergency hover:bg-emergency/90"
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
