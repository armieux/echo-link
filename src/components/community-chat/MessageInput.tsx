
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ImagePlus } from 'lucide-react';
import type { MessageInputProps } from "@/types/community-chat";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  handleKeyPress,
  disabled
}: MessageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier non supporté",
        description: "Seules les images sont acceptées",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximum est de 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `message-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('messages')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('messages')
        .getPublicUrl(filePath);

      // Add image URL to message
      setNewMessage(prev => prev + ` ${publicUrl} `);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          onKeyPress={handleKeyPress}
          className="flex-1"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || isUploading}
          className="shrink-0"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
        <Button 
          onClick={sendMessage}
          className="bg-emergency hover:bg-emergency/90 shrink-0"
          disabled={disabled || isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
