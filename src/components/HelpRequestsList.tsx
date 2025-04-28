import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface VolunteerRequest {
  id: string;
  report_id: string;
  status: "pending" | "accepted" | "refused";
  created_at: string;
  report: {
    title: string;
    description: string;
    user_id: string;
  } | null;
  reporter: {
    username: string;
  } | null;
}

export function HelpRequestsList() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les demandes d'aide
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        // D'abord, obtenir l'ID du volontaire associé à cet utilisateur
        const { data: volunteerData, error: volunteerError } = await supabase
          .from("volunteers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (volunteerError) {
          if (volunteerError.code === "PGRST116") {
            // L'utilisateur n'est pas un volontaire
            setRequests([]);
            setLoading(false);
            return;
          }
          throw volunteerError;
        }

        // Ensuite, récupérer les demandes pour ce volontaire
        const { data, error } = await supabase
          .from("volunteer_requests")
          .select("*")
          .eq("volunteer_id", volunteerData.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
          
        // Récupérer les détails des rapports associés
        if (data && data.length > 0) {
          const reportIds = data.map(request => request.report_id);
          
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
          
          // Récupérer séparément les profils utilisateur
          const reportUserIds = reportsData?.map(report => report.user_id) || [];
          
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", reportUserIds);
            
          if (profilesError) throw profilesError;
          
          // Associer les rapports aux demandes
          const enrichedData = data.map(request => {
            const report = reportsData?.find(r => r.id === request.report_id);
            const profile = report ? profilesData?.find(p => p.id === report.user_id) : null;
            
            return {
              ...request,
              report: report ? {
                title: report.title,
                description: report.description,
                user_id: report.user_id
              } : null,
              reporter: profile ? {
                username: profile.username
              } : null
            };
          });
          
          setRequests(enrichedData);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des demandes d'aide:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les demandes d'aide"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // S'abonner aux changements
    const channel = supabase
      .channel("volunteer_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "volunteer_requests"
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleRequestAction = async (requestId: string, status: "accepted" | "refused") => {
    setProcessingRequestId(requestId);
    try {
      // Mettre à jour le statut de la demande
      const { error } = await supabase
        .from("volunteer_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      // Mettre à jour l'état local
      setRequests(
        requests.map((request) => 
          request.id === requestId ? { ...request, status } : request
        )
      );

      // Envoyer une notification à l'utilisateur qui a fait la demande
      const request = requests.find((r) => r.id === requestId);
      if (request && request.report && request.report.user_id) {
        const notificationMessage = status === "accepted" 
          ? "Votre demande d'aide a été acceptée"
          : "Votre demande d'aide a été refusée";

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: request.report.user_id,
            message: notificationMessage,
            report_id: request.report_id,
            is_read: false,
            type: "volunteer_request" // S'assurer d'utiliser une valeur d'énumération valide
          });

        if (notificationError) console.error("Erreur lors de l'envoi de la notification:", notificationError);
      } else {
        console.error("Impossible d'envoyer une notification: informations incomplètes");
      }

      toast({
        title: "Succès",
        description: status === "accepted" 
          ? "Vous avez accepté la demande d'aide"
          : "Vous avez refusé la demande d'aide"
      });
    } catch (error) {
      console.error(`Erreur lors de l'${status === "accepted" ? "acceptation" : "refus"} de la demande:`, error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de ${status === "accepted" ? "accepter" : "refuser"} la demande d'aide`
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune demande d'aide en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Demandes d'aide reçues</h2>
      
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {request.report?.title || `Demande #${request.id.substring(0, 8)}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  De {request.reporter?.username || "utilisateur inconnu"} • 
                  {" "}
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>
              
              <Badge
                className={
                  request.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {request.status === "pending"
                  ? "En attente"
                  : request.status === "accepted"
                  ? "Acceptée"
                  : "Refusée"}
              </Badge>
            </div>
            
            <p className="mt-2 line-clamp-2 text-sm">
              {request.report?.description || "Aucune description fournie"}
            </p>
          </CardContent>
          
          {request.status === "pending" && (
            <CardFooter className="bg-muted/20 p-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleRequestAction(request.id, "refused")}
                disabled={!!processingRequestId}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {processingRequestId === request.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Refuser
              </Button>
              <Button
                onClick={() => handleRequestAction(request.id, "accepted")}
                disabled={!!processingRequestId}
              >
                {processingRequestId === request.id ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accepter
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
