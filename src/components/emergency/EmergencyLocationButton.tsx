
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface EmergencyLocationButtonProps {
  onLocationCaptured: (location: { lat: number; lng: number }) => void;
  isLoading: boolean;
  hasLocation: boolean;
}

const EmergencyLocationButton = ({ 
  onLocationCaptured, 
  isLoading,
  hasLocation 
}: EmergencyLocationButtonProps) => {
  const { toast } = useToast();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationCaptured({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Position capturée",
          description: "Votre position a été enregistrée avec succès.",
        });
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        toast({
          variant: "destructive",
          title: "Erreur de géolocalisation",
          description: "Impossible de récupérer votre position.",
        });
      }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="flex-1"
      onClick={handleGetLocation}
      disabled={isLoading}
    >
      <MapPin className="mr-2" />
      {hasLocation ? "Position capturée" : "Capturer ma position"}
    </Button>
  );
};

export default EmergencyLocationButton;
