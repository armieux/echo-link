
import { useCallback, useState } from "react";
import { UploadIcon, CameraIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

interface DocumentUploadProps {
  type: "id" | "selfie";
  onUpload: (file: File) => void;
  existingFile?: File | null;
  isLoading?: boolean;
}

const DocumentUpload = ({ 
  type, 
  onUpload, 
  existingFile,
  isLoading = false 
}: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Type de fichier non supporté",
        description: "Veuillez télécharger une image au format JPEG ou PNG.",
      });
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "La taille du fichier ne doit pas dépasser 5MB.",
      });
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        handleFile(file);
      }
    },
    [onUpload]
  );

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file);
  };

  // Set preview for existing file
  useState(() => {
    if (existingFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(existingFile);
    }
  });

  if (isLoading) {
    return (
      <div className="border-2 border-dashed rounded-lg p-6">
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-[200px] mx-auto" />
          <Skeleton className="h-4 w-[160px] mx-auto" />
          <Skeleton className="h-9 w-[140px] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/jpeg,image/png"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      
      <div className="text-center">
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="mx-auto max-h-40 rounded-lg mb-4"
          />
        ) : (
          <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
            {type === "id" ? <UploadIcon className="w-full h-full" /> : <CameraIcon className="w-full h-full" />}
          </div>
        )}
        
        <h3 className="text-lg font-medium mb-1">
          {type === "id" ? "Pièce d'identité" : "Selfie"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {type === "id"
            ? "Déposez votre pièce d'identité ou cliquez pour la télécharger"
            : "Prenez un selfie ou téléchargez une photo"}
        </p>
        <Button variant="outline" type="button">
          {preview ? "Changer le fichier" : "Sélectionner un fichier"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
