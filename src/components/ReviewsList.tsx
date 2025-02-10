
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { fetchVolunteerReviews } from "@/services/reviews";
import type { Review } from "@/services/reviews";

interface ReviewsListProps {
  volunteerId: string;
}

export const ReviewsList = ({ volunteerId }: ReviewsListProps) => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['volunteer-reviews', volunteerId, page],
    queryFn: () => fetchVolunteerReviews(volunteerId, page),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const reviews = data?.data || [];
  const totalReviews = data?.count || 0;
  const hasMore = totalReviews > page * 5;

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun avis pour le moment
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.profiles?.full_name || 'Utilisateur'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Voir plus d'avis
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
