import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface ActiveMission {
  id: string;
  report_id: string;
  status: string;
  created_at: string;
  report: {
    title: string;
    description: string;
    user_id: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  reporter: {
    username: string;
  } | null;
}

interface ActiveMissionsListProps {
  fetchStats?: (volunteerId: string) => void;
}

export function ActiveMissionsList({ fetchStats }: ActiveMissionsListProps) {
  const [missions, setMissions] = useState<ActiveMission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchActiveMissions = async () => {
      try {
        // Obtenir l'ID du volontaire
        const { data: volunteerData, error: volunteerError } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (volunteerError) {
          if (volunteerError.code === "PGRST116") {
            setMissions([]);
            setLoading(false);
            return;
          }
          throw volunteerError;
        }

        // Récupérer les missions acceptées
        const { data, error } = await supabase
          .from("volunteer_requests")
          .select("*")
          .eq("volunteer_id", volunteerData.id)
          .eq("status", "accepted")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
          
        // Si aucune mission active, retourner un tableau vide
        if (!data || data.length === 0) {
          setMissions([]);
          setLoading(false);
          return;
        }

        // Récupérer les détails des rapports associés
        const reportIds = data.map(mission => mission.report_id);
        
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select(`
            id,
            title,
            description,
            user_id,
            latitude,
            longitude
          `)
          .in("id", reportIds);
          
        if (reportsError) throw reportsError;
        
        // Récupérer les informations des utilisateurs
        const userIds = reportsData?.map(report => report.user_id) || [];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        // Construire les données enrichies
        const enrichedData = data.map(mission => {
          const report = reportsData?.find(r => r.id === mission.report_id);
          const profile = report ? profilesData?.find(p => p.id === report.user_id) : null;
          
          return {
            ...mission,
            report: report ? {
              title: report.title,
              description: report.description,
              user_id: report.user_id,
              latitude: report.latitude,
              longitude: report.longitude
            } : null,
            reporter: profile ? {
              username: profile.username
            } : null
          };
        });
        
        setMissions(enrichedData);
      } catch (error) {
        console.error("Erreur lors du chargement des missions actives:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos missions actives"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveMissions();
  }, [user, toast]);

  const handleCompleteClick = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_requests")
        .update({ status: "completed" })
        .eq("id", missionId);

      if (error) throw error;

      // Mettre à jour l'état local
      setMissions(missions.filter(m => m.id !== missionId));

      // Recharger les statistiques
      if (user) {
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", user.id)
          .single();
          
        if (volunteerData) {
          fetchStats?.(volunteerData.id);
        }
      }

      toast({
        title: "Mission terminée",
        description: "La mission a été marquée comme terminée avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la complétion de la mission:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de terminer cette mission"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vous n'avez aucune mission en cours</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Missions en cours</h2>
      
      {missions.map((mission) => (
        <Card key={mission.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {mission.report?.title || `Mission #${mission.id.substring(0, 8)}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  De {mission.reporter?.username || "utilisateur inconnu"} • 
                  {" "}
                  {formatDistanceToNow(new Date(mission.created_at), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>
              
              <Badge className="bg-green-100 text-green-800">
                En cours
              </Badge>
            </div>
            
            <p className="mt-2 text-sm">
              {mission.report?.description || "Aucune description fournie"}
            </p>

            {(mission.report?.latitude && mission.report?.longitude) && (
              <div className="mt-4">
                <a 
                  href={`https://www.google.com/maps?q=${mission.report.latitude},${mission.report.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  📍 Voir sur la carte
                </a>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => handleCompleteClick(mission.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Marquer comme terminée
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
