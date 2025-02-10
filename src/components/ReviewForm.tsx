
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview } from "@/services/reviews";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReviewFormProps {
  volunteerId: string;
  reportId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ volunteerId, reportId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: () => submitReview(volunteerId, reportId, rating, comment),
    onSuccess: () => {
      toast({
        title: "Avis envoyé",
        description: "Merci d'avoir partagé votre expérience !",
      });
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ['volunteer-reviews', volunteerId] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'avis. Veuillez réessayer.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez attribuer une note",
      });
      return;
    }
    submitReviewMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                "text-2xl transition-colors",
                (rating >= value || hoveredRating >= value)
                  ? "text-yellow-400"
                  : "text-gray-300"
              )}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
            >
              <Star className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Commentaire (optionnel)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={rating === 0 || submitReviewMutation.isPending}
      >
        {submitReviewMutation.isPending ? "Envoi en cours..." : "Envoyer l'avis"}
      </Button>
    </form>
  );
};
