import { useState, useEffect } from "react";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AskForHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerId: string;
  volunteerName?: string;
}

interface Report {
  id: string;
  title: string;
  status: string;
}

export function AskForHelpDialog({
  open,
  onOpenChange,
  volunteerId,
  volunteerName = "ce volontaire"
}: AskForHelpDialogProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Charger les rapports de l'utilisateur
  useEffect(() => {
    if (!open || !user) return;

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("id, title, status")
          .eq("user_id", user.id)
          .in("status", ["pending", "active"]) // Accepter les deux types de statut
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);

        // Sélectionner le premier rapport par défaut s'il existe
        if (data && data.length > 0) {
          setSelectedReportId(data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des rapports:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos rapports",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [open, user, toast]);

  const handleSubmit = async () => {
    if (!selectedReportId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un rapport",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Vérifier si une demande existe déjà pour ce rapport et ce volontaire
      const { data: existingRequest, error: checkError } = await supabase
        .from("volunteer_requests")
        .select("id")
        .eq("report_id", selectedReportId)
        .eq("volunteer_id", volunteerId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRequest) {
        toast({
          title: "Information",
          description: "Une demande d'aide existe déjà pour ce rapport et ce volontaire",
        });
        onOpenChange(false);
        return;
      }
      
      // Créer une demande d'aide
      const { data: requestData, error: requestError } = await supabase
        .from("volunteer_requests")
        .insert({
          report_id: selectedReportId,
          volunteer_id: volunteerId,
          status: "pending",
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // D'abord, récupérer l'ID de l'utilisateur associé au volontaire
      const { data: volunteerData, error: volunteerError } = await supabase
        .from("volunteers")
        .select("user_id")
        .eq("id", volunteerId)
        .single();

      if (volunteerError || !volunteerData) {
        throw new Error("Impossible de récupérer les informations du volontaire");
      }

      // Maintenant, créer une notification pour l'utilisateur associé au volontaire
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: volunteerData.user_id, // Utiliser l'ID de l'utilisateur, pas l'ID du volontaire
          message: `Vous avez reçu une demande d'aide pour un incident`,
          report_id: selectedReportId,
          is_read: false,
          type: "volunteer_request", // Utiliser une valeur d'énumération reconnue par la base de données
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Succès",
        description: `Votre demande d'aide a été envoyée à ${volunteerName}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'aide:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible d'envoyer la demande d'aide: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Demander de l'aide</DialogTitle>
          <DialogDescription>
            Sélectionnez le rapport pour lequel vous souhaitez demander de l'aide à {volunteerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Vous n'avez aucun rapport actif. Veuillez d'abord créer un rapport.
            </p>
          ) : (
            <Select
              value={selectedReportId || ""}
              onValueChange={(value) => setSelectedReportId(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rapport" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedReportId || reports.length === 0}
          >
            {isLoading ? "Envoi en cours..." : "Demander de l'aide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
