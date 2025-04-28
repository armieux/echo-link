import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface MissionHistory {
  id: string;
  report_id: string;
  status: "completed" | "refused";
  created_at: string;
  updated_at: string;
  report: {
    title: string;
    description: string;
  } | null;
  reporter: {
    username: string;
  } | null;
}

export function MissionHistoryList() {
  const [missions, setMissions] = useState<MissionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchMissionHistory = async () => {
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

        // Récupérer l'historique des missions (complétées ou refusées)
        const { data, error } = await supabase
          .from("volunteer_requests")
          .select("*")
          .eq("volunteer_id", volunteerData.id)
          .in("status", ["completed", "refused"]) // Missions terminées ou refusées
          .order("created_at", { ascending: false });
          
        if (error) throw error;
          
        // Si aucune mission dans l'historique, retourner un tableau vide
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
            user_id
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
              description: report.description
            } : null,
            reporter: profile ? {
              username: profile.username
            } : null
          };
        });
        
        setMissions(enrichedData);
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique des missions:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre historique de missions"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMissionHistory();
  }, [user, toast]);

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
        <p className="text-muted-foreground">Vous n'avez aucune mission dans l'historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Historique des missions</h2>
      
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
                  {format(new Date(mission.created_at), 'dd/MM/yyyy')}
                </p>
              </div>
              
              <Badge 
                className={mission.status === "completed" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-red-100 text-red-800"}
              >
                {mission.status === "completed" ? "Terminée" : "Refusée"}
              </Badge>
            </div>
            
            <p className="mt-2 text-sm">
              {mission.report?.description || "Aucune description fournie"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
