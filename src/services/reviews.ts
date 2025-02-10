
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  reviewer_id: string;
  volunteer_id: string;
  report_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export const submitReview = async (
  volunteerId: string,
  reportId: string,
  rating: number,
  comment?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated to submit a review');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      volunteer_id: volunteerId,
      report_id: reportId,
      reviewer_id: user.id,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchVolunteerReviews = async (volunteerId: string, page = 1) => {
  const limit = 5;
  const start = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, profiles!reviewer_id(full_name)', { count: 'exact' })
    .eq('volunteer_id', volunteerId)
    .order('created_at', { ascending: false })
    .range(start, start + limit - 1);

  if (error) throw error;
  return { data, count };
};

export const fetchUserReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles!volunteer_id(full_name),
      volunteer_requests(
        report:reports(title)
      )
    `)
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateReview = async (
  reviewId: string,
  updates: { rating?: number; comment?: string }
) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteReview = async (reviewId: string) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
};

