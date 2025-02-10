
import { useState } from "react";
import { MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface EmergencyFormProps {
  onClose?: () => void;
}

const EMERGENCY_CATEGORIES = [
  { id: "water", label: "Eau potable" },
  { id: "car", label: "Panne de voiture" },
  { id: "person", label: "Personne en difficulté" },
  { id: "medical", label: "Urgence médicale" },
  { id: "other", label: "Autre" },
];

const EmergencyForm = ({ onClose }: EmergencyFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(50);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Position capturée",
          description: "Votre position a été enregistrée avec succès.",
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        toast({
          variant: "destructive",
          title: "Erreur de géolocalisation",
          description: "Impossible de récupérer votre position.",
        });
        setIsLoading(false);
      }
    );
  };

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
      
      // Close the form if onClose prop is provided
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
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
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

      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {EMERGENCY_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Niveau de priorité</Label>
        <div className="pt-2">
          <Slider
            value={[priority]}
            onValueChange={(values) => setPriority(values[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Faible</span>
            <span>Moyenne</span>
            <span>Haute</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleGetLocation}
          disabled={isLoading}
        >
          <MapPin className="mr-2" />
          {location ? "Position capturée" : "Capturer ma position"}
        </Button>
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
