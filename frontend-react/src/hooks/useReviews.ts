import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export interface ReviewDto {
  id: number;
  sessionId: number;
  learnerId: number;
  mentorId: number;
  rating: number;
  comment: string;
  createdAt: string;
  username?: string;
}

export interface MentorRatingDto {
  mentorId: number;
  averageRating: number;
  totalReviews: number;
}

export interface SubmitReviewRequest {
  sessionId: number;
  rating: number;
  comment: string;
}

export const useReviews = (mentorId?: number) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['reviews', mentorId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/review/mentors/${mentorId}`);
      return data.data as ReviewDto[];
    },
    enabled: !!mentorId,
  });

  const ratingQuery = useQuery({
    queryKey: ['mentor-rating', mentorId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/review/mentors/${mentorId}/rating`);
      return data.data as MentorRatingDto;
    },
    enabled: !!mentorId,
  });

  const submitReviewMutation = useMutation({
    mutationFn: (review: SubmitReviewRequest) => apiClient.post('/review', review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['mentor-rating'] });
    },
  });

  return {
    reviews: reviewsQuery.data || [],
    rating: ratingQuery.data,
    isLoading: reviewsQuery.isLoading || ratingQuery.isLoading,
    submitReview: submitReviewMutation.mutateAsync,
  };
};
