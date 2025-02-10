
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmergencyButton = () => {
  const openEmergencyForm = () => {
    // Find the form toggle button and click it
    const formButton = document.querySelector('[data-form-toggle]') as HTMLButtonElement;
    if (formButton) {
      formButton.click();
    }
  };

  return (
    <Button 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-emergency hover:bg-emergency/90 text-white px-8 py-6 rounded-full shadow-lg animate-float transition-transform transform hover:scale-105"
      onClick={openEmergencyForm}
    >
      <Phone className="h-6 w-6 mr-2" />
      <span className="text-lg font-semibold">Signaler une urgence</span>
    </Button>
  );
};

export default EmergencyButton;
