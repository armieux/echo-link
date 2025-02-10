
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EMERGENCY_CATEGORIES = [
  { id: "water", label: "Eau potable" },
  { id: "car", label: "Panne de voiture" },
  { id: "person", label: "Personne en difficulté" },
  { id: "medical", label: "Urgence médicale" },
  { id: "other", label: "Autre" },
] as const;

interface EmergencyCategorySelectProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

const EmergencyCategorySelect = ({ category, onCategoryChange }: EmergencyCategorySelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Catégorie</Label>
      <Select value={category} onValueChange={onCategoryChange} required>
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
  );
};

export default EmergencyCategorySelect;
