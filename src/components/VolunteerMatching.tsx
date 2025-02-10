
import { useState } from "react";
import { Button } from "./ui/button";
import { MapPin, Users, ArrowUp, ArrowDown, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

interface Volunteer {
  id: string;
  name: string;
  distance: number;
  available: boolean;
  skills: Skill[];
  rating: number;
}

// Exemple de données (à remplacer par les vraies données)
const mockVolunteers: Volunteer[] = [
  {
    id: "1",
    name: "Marie Dubois",
    distance: 0.5,
    available: true,
    skills: [
      { id: "firstaid", name: "Premiers secours", level: 5 },
      { id: "mechanic", name: "Mécanique", level: 3 },
    ],
    rating: 4.8,
  },
  {
    id: "2",
    name: "Pierre Martin",
    distance: 1.2,
    available: true,
    skills: [
      { id: "firstaid", name: "Premiers secours", level: 4 },
      { id: "driving", name: "Transport", level: 5 },
    ],
    rating: 4.5,
  },
  {
    id: "3",
    name: "Sophie Bernard",
    distance: 2.1,
    available: false,
    skills: [
      { id: "mechanic", name: "Mécanique", level: 5 },
      { id: "firstaid", name: "Premiers secours", level: 3 },
    ],
    rating: 4.2,
  },
];

type SortOption = "distance" | "rating" | "skills";

const VolunteerMatching = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }

    const sortedVolunteers = [...volunteers].sort((a, b) => {
      let comparison = 0;
      switch (option) {
        case "distance":
          comparison = a.distance - b.distance;
          break;
        case "rating":
          comparison = b.rating - a.rating;
          break;
        case "skills":
          const aSkill = a.skills.find((s) => s.id === selectedSkill);
          const bSkill = b.skills.find((s) => s.id === selectedSkill);
          comparison = (bSkill?.level || 0) - (aSkill?.level || 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setVolunteers(sortedVolunteers);
  };

  const handlePropose = (volunteerId: string) => {
    // TODO: Implémenter la logique pour proposer de l'aide
    console.log(`Proposition envoyée au volontaire ${volunteerId}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold">Volontaires disponibles</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par compétence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les compétences</SelectItem>
              <SelectItem value="firstaid">Premiers secours</SelectItem>
              <SelectItem value="mechanic">Mécanique</SelectItem>
              <SelectItem value="driving">Transport</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("distance")}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            Distance
            {sortBy === "distance" && (
              sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort("rating")}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            Note
            {sortBy === "rating" && (
              sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {volunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-emergency/50 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{volunteer.name}</h3>
                {volunteer.available && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {volunteer.distance} km
                </span>
                <span>★ {volunteer.rating.toFixed(1)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill.name} (Niv. {skill.level})
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handlePropose(volunteer.id)}
              className="w-full sm:w-auto"
              disabled={!volunteer.available}
            >
              Proposer de l'aide
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerMatching;
