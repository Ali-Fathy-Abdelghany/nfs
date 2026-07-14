import axiosInstance from './axiosInstance';

export const fetchTherapistReviews = (therapistId, limit) =>
  axiosInstance.get(`/api/therapists/${therapistId}/reviews`, {
    params: limit ? { limit } : undefined,
  });

export const fetchTherapistReviewSummary = (therapistId) =>
  axiosInstance.get(`/api/therapists/${therapistId}/reviews/summary`);

export function normalizeReview(review) {
  if (!review) return review;
  return {
    ...review,
    id: review.id ?? review.Id,
    stars: Number(review.stars ?? review.Stars ?? 0) || 0,
    comment: review.comment ?? review.Comment ?? '',
    authorDisplay: review.authorDisplay ?? review.AuthorDisplay ?? 'مراجع',
    createdAt: review.createdAt ?? review.CreatedAt,
  };
}

export const createTherapistReview = (therapistId, data) =>
  axiosInstance.post(`/api/therapists/${therapistId}/reviews`, data);

export const deleteTherapistReview = (therapistId, reviewId) =>
  axiosInstance.delete(`/api/therapists/${therapistId}/reviews/${reviewId}`);

export function formatReviewMeta(createdAt) {
  if (!createdAt) return 'تقييم';
  const date = new Date(createdAt);
  const diffMs = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days < 1) return 'اليوم';
  if (days < 7) return `منذ ${days} يوم`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسبوع`;
  if (days < 365) return `منذ ${Math.floor(days / 30)} شهر`;
  return date.toLocaleDateString('ar-EG');
}
