
import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EmergencyPrioritySlider from "./emergency/EmergencyPrioritySlider";
import EmergencyLocationButton from "./emergency/EmergencyLocationButton";
import EmergencyCategorySelect from "./emergency/EmergencyCategorySelect";

interface EmergencyFormProps {
  onClose?: () => void;
}

const EmergencyForm = ({ onClose }: EmergencyFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(50);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast({
        variant: "destructive",
        title: "Position manquante",
        description: "Veuillez capturer votre position avant d'envoyer le signalement.",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Non connecté",
        description: "Vous devez être connecté pour créer un signalement.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            title,
            description,
            category,
            priority,
            latitude: location.lat,
            longitude: location.lng,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été transmis avec succès.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority(50);
      setLocation(null);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du signalement.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6 p-6 bg-white rounded-lg shadow-md">
      {/* Close button */}
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-2 p-2 h-auto"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'urgence</Label>
        <Input
          id="title"
          placeholder="Titre bref de la situation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description de l'urgence</Label>
        <Textarea
          id="description"
          placeholder="Décrivez la situation d'urgence..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>

      <EmergencyCategorySelect 
        category={category} 
        onCategoryChange={setCategory} 
      />

      <EmergencyPrioritySlider 
        priority={priority} 
        onPriorityChange={(values) => setPriority(values[0])} 
      />

      <div className="flex gap-4">
        <EmergencyLocationButton
          onLocationCaptured={setLocation}
          isLoading={isLoading}
          hasLocation={!!location}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-emergency hover:bg-emergency/90"
        disabled={isLoading}
      >
        <Send className="mr-2" />
        {isLoading ? "Envoi en cours..." : "Envoyer le signalement"}
      </Button>
    </form>
  );
};

export default EmergencyForm;
