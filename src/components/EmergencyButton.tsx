
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmergencyButton = () => {
  const openEmergencyForm = () => {
    const formButton = document.querySelector('[data-form-toggle]') as HTMLButtonElement;
    if (formButton) {
      formButton.click();
    }
  };

  return (
    <div className="fixed bottom-8 w-full flex justify-center z-40 pointer-events-none">
      <Button 
        className="pointer-events-auto bg-emergency hover:bg-emergency/90 text-white px-8 py-6 rounded-full shadow-lg animate-float transition-transform transform hover:scale-105"
        onClick={openEmergencyForm}
      >
        <Phone className="h-6 w-6 mr-2" />
        <span className="text-lg font-semibold">Signaler une urgence</span>
      </Button>
    </div>
  );
};

export default EmergencyButton;
