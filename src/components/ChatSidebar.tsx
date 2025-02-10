
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const ChatSidebar = () => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-emergency h-5 w-5" />
        <h2 className="font-semibold">Chat Communautaire</h2>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div>
                <p className="text-sm font-medium">Utilisateur {i}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Message de la communauté {i}...
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
