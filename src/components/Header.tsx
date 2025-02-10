
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emergency font-bold text-2xl">EchoLink</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-emergency rounded-full" />
          </Button>
          <Button className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Connexion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
