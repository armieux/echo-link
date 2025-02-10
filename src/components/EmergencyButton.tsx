
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EmergencyForm from "./EmergencyForm";

const EmergencyButton = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="fixed bottom-8 w-full flex justify-center z-40 pointer-events-none">
        <Button 
          className="pointer-events-auto bg-emergency hover:bg-emergency/90 text-white px-8 py-6 rounded-full shadow-lg animate-float transition-transform transform hover:scale-105"
          onClick={() => setShowForm(true)}
        >
          <Phone className="h-6 w-6 mr-2" />
          <span className="text-lg font-semibold">Signaler une urgence</span>
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[80vh] bg-white rounded-lg shadow-xl overflow-y-auto">
            <EmergencyForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;
