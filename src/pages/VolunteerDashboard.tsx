import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HelpRequestsList } from "@/components/HelpRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function VolunteerDashboard() {
  const [isVolunteer, setIsVolunteer] = useState<boolean | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkVolunteerStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", user.id);

        if (error) throw error;
        setIsVolunteer(data && data.length > 0);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de volontaire:", error);
        setIsVolunteer(false);
      }
    };

    checkVolunteerStatus();
  }, [user]);

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

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Demandes d'aide</TabsTrigger>
          <TabsTrigger value="pending">Missions en cours</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <HelpRequestsList />
        </TabsContent>

        <TabsContent value="pending">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune mission active pour le moment</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Votre historique de missions apparaîtra ici</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
