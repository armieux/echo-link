
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DocumentUpload from "./DocumentUpload";
import SecuritySettings from "./SecuritySettings";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const IdentityVerification = () => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "unverified">("unverified");
  const { user } = useAuth();

  const uploadFile = async (file: File, type: "id" | "selfie"): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from('identity_verification')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    return fileName;
  };

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
      // Upload files to Supabase Storage
      const [idPath, selfiePath] = await Promise.all([
        uploadFile(idDocument, "id"),
        uploadFile(selfie, "selfie")
      ]);

      // Create verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert([
          {
            id_document_path: idPath,
            selfie_path: selfiePath,
          }
        ]);

      if (requestError) throw requestError;
      
      setVerificationStatus("pending");
      toast({
        title: "Documents soumis avec succès",
        description: "Nous examinerons vos documents dans les plus brefs délais.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Erreur lors de l'envoi",
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
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
