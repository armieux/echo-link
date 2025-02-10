
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import DocumentUpload from "./DocumentUpload";
import SecuritySettings from "./SecuritySettings";
import { Button } from "./ui/button";

const IdentityVerification = () => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "unverified">("unverified");

  const handleSubmit = async () => {
    if (!idDocument || !selfie) {
      toast({
        variant: "destructive",
        title: "Documents manquants",
        description: "Veuillez télécharger tous les documents requis.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulation d'envoi des documents
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setVerificationStatus("pending");
      toast({
        title: "Documents soumis avec succès",
        description: "Nous examinerons vos documents dans les plus brefs délais.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Vérification d'identité</h2>
      
      <div className="space-y-8">
        <SecuritySettings
          isVerified={verificationStatus === "verified"}
          verificationStatus={verificationStatus}
          documentSubmissionDate={
            verificationStatus !== "unverified"
              ? new Date().toLocaleDateString("fr-FR")
              : undefined
          }
        />

        {verificationStatus === "unverified" && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <DocumentUpload
                type="id"
                onUpload={(file) => setIdDocument(file)}
              />
              <DocumentUpload
                type="selfie"
                onUpload={(file) => setSelfie(file)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !idDocument || !selfie}
              >
                {isSubmitting ? "Envoi en cours..." : "Soumettre les documents"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;
