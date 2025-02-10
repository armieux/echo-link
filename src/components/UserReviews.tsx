
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserReviews,
  updateReview,
  deleteReview,
} from "@/services/reviews";
import { useAuth } from "@/contexts/AuthContext";

export const UserReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: () => fetchUserReviews(user?.id || ''),
    enabled: !!user?.id,
  });

  const updateReviewMutation = useMutation({
    mutationFn: (params: { reviewId: string; rating?: number; comment?: string }) =>
      updateReview(params.reviewId, {
        rating: params.rating,
        comment: params.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast({
        title: "Avis mis à jour",
        description: "Votre avis a été modifié avec succès",
      });
      setEditingReview(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast({
        title: "Avis supprimé",
        description: "Votre avis a été supprimé avec succès",
      });
    },
  });

  if (isLoading) {
    return <div>Chargement de vos avis...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Mes avis</h2>
      
      {(!reviews || reviews.length === 0) ? (
        <p className="text-gray-500">Vous n'avez pas encore donné d'avis</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {review.profiles?.full_name || 'Volontaire'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {review.volunteer_requests?.report?.title || 'Mission'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingReview(review.id);
                      setEditedComment(review.comment || '');
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Voulez-vous vraiment supprimer cet avis ?')) {
                        deleteReviewMutation.mutate(review.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {editingReview === review.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateReviewMutation.mutate({
                          reviewId: review.id,
                          comment: editedComment,
                        });
                      }}
                    >
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReview(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                review.comment && <p className="text-gray-600">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
