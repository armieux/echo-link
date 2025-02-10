
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { VerificationDocument } from "@/types/verification";
import { User } from "@supabase/supabase-js";

export const useVerification = (user: User | null) => {
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [verificationDoc, setVerificationDoc] = useState<VerificationDocument | null>(null);

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
      const [idPath, selfiePath] = await Promise.all([
        uploadFile(idDocument, "id"),
        uploadFile(selfie, "selfie")
      ]);

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

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  return {
    idDocument,
    setIdDocument,
    selfie,
    setSelfie,
    isSubmitting,
    isLoading,
    verificationStatus,
    verificationDoc,
    handleSubmit,
  };
};
