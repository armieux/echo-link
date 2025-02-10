
import { useAuth } from "@/contexts/AuthContext";
import SecuritySettings from "./SecuritySettings";
import { useVerification } from "@/hooks/useVerification";
import DocumentUploadSection from "./verification/DocumentUploadSection";

const IdentityVerification = () => {
  const { user } = useAuth();
  const {
    idDocument,
    setIdDocument,
    selfie,
    setSelfie,
    isSubmitting,
    isLoading,
    verificationStatus,
    verificationDoc,
    handleSubmit,
  } = useVerification(user);

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
          <DocumentUploadSection
            idDocument={idDocument}
            selfie={selfie}
            setIdDocument={setIdDocument}
            setSelfie={setSelfie}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;
