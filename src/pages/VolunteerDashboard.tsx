import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HelpRequestsList } from "@/components/HelpRequestsList";
import { ActiveMissionsList } from "@/components/ActiveMissionsList";
import { MissionHistoryList } from "@/components/MissionHistoryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function VolunteerDashboard() {
  const [isVolunteer, setIsVolunteer] = useState<boolean | null>(null);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeMissions: 0,
    completedMissions: 0
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const checkVolunteerStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setIsVolunteer(false);
            return;
          }
          throw error;
        }
        
        setVolunteerId(data.id);
        setIsVolunteer(true);

        // Charger les statistiques
        if (data.id) {
          fetchStats(data.id);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de volontaire:", error);
        setIsVolunteer(false);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de vérifier votre statut de volontaire"
        });
      }
    };

    checkVolunteerStatus();
  }, [user, toast]);

  const fetchStats = async (volunteerId: string) => {
    try {
      // Compter les demandes en attente
      const { count: pendingCount, error: pendingError } = await supabase
        .from("volunteer_requests")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", volunteerId)
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      // Compter les missions actives
      const { count: activeCount, error: activeError } = await supabase
        .from("volunteer_requests")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", volunteerId)
        .eq("status", "accepted");

      if (activeError) throw activeError;

      // Compter les missions terminées
      const { count: completedCount, error: completedError } = await supabase
        .from("volunteer_requests")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", volunteerId)
        .eq("status", "completed");

      if (completedError) throw completedError;

      setStats({
        pendingRequests: pendingCount || 0,
        activeMissions: activeCount || 0,
        completedMissions: completedCount || 0
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  if (isVolunteer === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isVolunteer === false) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Espace volontaire</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'êtes pas inscrit en tant que volontaire.
          </p>
          <p className="text-sm">
            Si vous souhaitez devenir volontaire, veuillez compléter votre profil et
            activer le statut de volontaire dans vos paramètres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Espace volontaire</h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">Demandes en attente</h3>
          <p className="text-2xl font-bold mt-1">{stats.pendingRequests}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">Missions en cours</h3>
          <p className="text-2xl font-bold mt-1">{stats.activeMissions}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm text-gray-500 font-medium">Missions terminées</h3>
          <p className="text-2xl font-bold mt-1">{stats.completedMissions}</p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Demandes d'aide</TabsTrigger>
          <TabsTrigger value="active">Missions en cours</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <HelpRequestsList />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <ActiveMissionsList fetchStats={(id) => fetchStats(id)} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <MissionHistoryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
