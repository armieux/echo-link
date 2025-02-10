
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EmergencyPrioritySliderProps {
  priority: number;
  onPriorityChange: (value: number[]) => void;
}

const EmergencyPrioritySlider = ({ priority, onPriorityChange }: EmergencyPrioritySliderProps) => {
  return (
    <div className="space-y-4">
      <Label>Niveau de priorité</Label>
      <div className="pt-2">
        <Slider
          value={[priority]}
          onValueChange={onPriorityChange}
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
  );
};

export default EmergencyPrioritySlider;
