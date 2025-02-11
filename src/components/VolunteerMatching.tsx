
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
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Volunteer {
  id: string;
  user_id: string;
  skills: string[];
  distance_meters: number;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  skill_match_percentage: number;
}

type SortOption = "distance" | "rating" | "skills";

async function fetchNearbyVolunteers(reportId: string) {
  const { data: report } = await supabase
    .from('reports')
    .select('latitude, longitude, required_skills')
    .eq('id', reportId)
    .single();

  if (!report) {
    throw new Error("Report not found");
  }

  // Ensure required_skills is always an array
  const requiredSkills = report.required_skills || [];
  if (!Array.isArray(requiredSkills)) {
    throw new Error("Required skills must be an array");
  }

  const { data, error } = await supabase
    .rpc('find_nearby_volunteers', {
      report_latitude: report.latitude,
      report_longitude: report.longitude,
      required_skills: requiredSkills,
      max_distance_km: 10
    });

  if (error) throw error;

  // Get volunteer profiles
  const volunteerIds = data.map(v => v.volunteer_id);
  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('*')
    .in('id', volunteerIds);

  // Merge data
  return data.map(v => ({
    ...volunteers?.find(vol => vol.id === v.volunteer_id),
    distance_meters: v.distance_meters,
    skill_match_percentage: v.skill_match_percentage,
  }));
}

const VolunteerMatching = ({ reportId }: { reportId: string }) => {
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const { toast } = useToast();

  const { data: volunteers = [], isLoading } = useQuery({
    queryKey: ['volunteers', reportId],
    queryFn: () => fetchNearbyVolunteers(reportId),
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      const { error } = await supabase
        .from('volunteer_requests')
        .insert({
          report_id: reportId,
          volunteer_id: volunteerId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "La demande d'aide a été envoyée au volontaire",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'aide",
      });
    },
  });

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const handlePropose = (volunteerId: string) => {
    sendRequestMutation.mutate(volunteerId);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "distance":
        comparison = a.distance_meters - b.distance_meters;
        break;
      case "rating":
        comparison = b.rating - a.rating;
        break;
      case "skills":
        comparison = b.skill_match_percentage - a.skill_match_percentage;
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const filteredVolunteers = selectedSkill === "all"
    ? sortedVolunteers
    : sortedVolunteers.filter(v => v.skills.includes(selectedSkill));

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
        {filteredVolunteers.map((volunteer) => (
          <div
            key={volunteer.id}
            className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-emergency/50 transition-colors"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Volontaire #{volunteer.id.slice(0, 8)}</h3>
                {volunteer.availability === 'available' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Disponible
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {(volunteer.distance_meters / 1000).toFixed(1)} km
                </span>
                <span>★ {volunteer.rating.toFixed(1)}</span>
                <span>{volunteer.skill_match_percentage.toFixed(0)}% de correspondance</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handlePropose(volunteer.id)}
              className="w-full sm:w-auto"
              disabled={volunteer.availability !== 'available' || sendRequestMutation.isPending}
            >
              Proposer de l'aide
            </Button>
          </div>
        ))}

        {filteredVolunteers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun volontaire disponible ne correspond à vos critères
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerMatching;
