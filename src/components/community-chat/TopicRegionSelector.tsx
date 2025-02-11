
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChatTopic } from '@/types/community-chat';

const TOPICS: { value: ChatTopic; label: string }[] = [
  { value: 'premiers_secours', label: 'Premiers Secours' },
  { value: 'pannes_voiture', label: 'Pannes de Voiture' },
  { value: 'secours_montagne', label: 'Secours en Montagne' },
  { value: 'urgences_medicales', label: 'Urgences Médicales' },
  { value: 'catastrophes_naturelles', label: 'Catastrophes Naturelles' },
  { value: 'autre', label: 'Autre' }
];

const REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Hauts-de-France',
  'Grand Est',
  'Provence-Alpes-Côte d\'Azur',
  'Pays de la Loire',
  'Normandie',
  'Bretagne',
  'Bourgogne-Franche-Comté',
  'Centre-Val de Loire',
  'Corse'
];

interface TopicRegionSelectorProps {
  selectedTopic: ChatTopic;
  setSelectedTopic: (topic: ChatTopic) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export default function TopicRegionSelector({
  selectedTopic,
  setSelectedTopic,
  selectedRegion,
  setSelectedRegion
}: TopicRegionSelectorProps) {
  return (
    <div className="flex gap-4">
      <Select
        value={selectedTopic}
        onValueChange={(value: ChatTopic) => {
          setSelectedTopic(value);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Choisir un thème" />
        </SelectTrigger>
        <SelectContent>
          {TOPICS.map(topic => (
            <SelectItem key={topic.value} value={topic.value}>
              {topic.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedRegion}
        onValueChange={(value: string) => {
          setSelectedRegion(value);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Choisir une région" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map(region => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
