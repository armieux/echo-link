
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DocumentUpload from "./DocumentUpload";
import SecuritySettings from "./SecuritySettings";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

interface VerificationDocument {
  id: string;
  status: "pending" | "verified" | "rejected";
  id_document_path: string | null;
  selfie_path: string | null;
  submitted_at: string;
  rejection_reason: string | null;
}

const IdentityVerification = () => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "rejected" | "unverified"
  >("unverified");
  const [verificationDoc, setVerificationDoc] = useState<VerificationDocument | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const { data: verificationData, error } = await supabase
        .from("verification_documents")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (verificationData) {
        setVerificationDoc(verificationData);
        setVerificationStatus(verificationData.status);

        // If documents exist, fetch their URLs
        if (verificationData.id_document_path) {
          const { data: idDocUrl } = await supabase.storage
            .from("identity_verification")
            .createSignedUrl(verificationData.id_document_path, 3600);
          
          if (idDocUrl) {
            const response = await fetch(idDocUrl.signedUrl);
            const blob = await response.blob();
            setIdDocument(new File([blob], "id-document", { type: blob.type }));
          }
        }

        if (verificationData.selfie_path) {
          const { data: selfieUrl } = await supabase.storage
            .from("identity_verification")
            .createSignedUrl(verificationData.selfie_path, 3600);
          
          if (selfieUrl) {
            const response = await fetch(selfieUrl.signedUrl);
            const blob = await response.blob();
            setSelfie(new File([blob], "selfie", { type: blob.type }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le statut de vérification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Non authentifié",
        description: "Veuillez vous connecter pour soumettre vos documents.",
      });
      return;
    }

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

      // Create or update verification request
      const { error: requestError } = await supabase
        .from('verification_documents')
        .upsert({
          user_id: user.id,
          id_document_path: idPath,
          selfie_path: selfiePath,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (requestError) throw requestError;
      
      setVerificationStatus("pending");
      toast({
        title: "Documents soumis avec succès",
        description: "Nous examinerons vos documents dans les plus brefs délais.",
      });

      // Refresh verification status
      await fetchVerificationStatus();
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
            verificationDoc?.submitted_at
              ? new Date(verificationDoc.submitted_at).toLocaleDateString("fr-FR")
              : undefined
          }
          rejectionReason={verificationDoc?.rejection_reason || undefined}
          isLoading={isLoading}
        />

        {verificationStatus !== "verified" && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <DocumentUpload
                type="id"
                onUpload={(file) => setIdDocument(file)}
                existingFile={idDocument}
                isLoading={isLoading}
              />
              <DocumentUpload
                type="selfie"
                onUpload={(file) => setSelfie(file)}
                existingFile={selfie}
                isLoading={isLoading}
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
