
import { useCallback, useState } from "react";
import { UploadIcon, CameraIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  type: "id" | "selfie";
  onUpload: (file: File) => void;
}

const DocumentUpload = ({ type, onUpload }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Type de fichier non supporté",
          description: "Veuillez télécharger une image.",
        });
      }
    },
    [onUpload]
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onUpload(file);
  };

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
        accept="image/*"
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
