
import { Button } from "@/components/ui/button";
import DocumentUpload from "@/components/DocumentUpload";

interface DocumentUploadSectionProps {
  idDocument: File | null;
  selfie: File | null;
  setIdDocument: (file: File) => void;
  setSelfie: (file: File) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  onSubmit: () => void;
}

const DocumentUploadSection = ({
  idDocument,
  selfie,
  setIdDocument,
  setSelfie,
  isSubmitting,
  isLoading,
  onSubmit,
}: DocumentUploadSectionProps) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <DocumentUpload
          type="id"
          onUpload={setIdDocument}
          existingFile={idDocument}
          isLoading={isLoading}
        />
        <DocumentUpload
          type="selfie"
          onUpload={setSelfie}
          existingFile={selfie}
          isLoading={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !idDocument || !selfie}
        >
          {isSubmitting ? "Envoi en cours..." : "Soumettre les documents"}
        </Button>
      </div>
    </>
  );
};

export default DocumentUploadSection;
