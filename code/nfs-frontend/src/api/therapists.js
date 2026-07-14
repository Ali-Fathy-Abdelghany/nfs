import axiosInstance from './axiosInstance';
import { doctorAvatarUrl } from '../utils/doctorAvatar';

export const fetchTherapists = () => axiosInstance.get('/api/therapists');
export const fetchPendingTherapists = () => axiosInstance.get('/api/therapists/pending');
export const fetchTherapistById = (id) => axiosInstance.get(`/api/therapists/${id}`);
export const fetchTherapistByUserId = (userId) => axiosInstance.get(`/api/therapists/by-user/${userId}`);
export const searchTherapists = (query) => axiosInstance.get('/api/therapists/search', { params: { q: query } });
export const createTherapist = (data) => axiosInstance.post('/api/therapists', data);
export const updateTherapist = (id, data) => axiosInstance.put(`/api/therapists/${id}`, data);
export const approveTherapist = (id) => axiosInstance.post(`/api/therapists/${id}/approve`);
export const rejectTherapist = (id, reason) =>
  axiosInstance.post(`/api/therapists/${id}/reject`, { reason: reason || null });

export function mapTherapistToProfile(t, fallbackImage) {
  const specialties = t.qualifications
    ? t.qualifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
    : t.specialization
      ? [t.specialization]
      : [];

  const rawRating = t.rating ?? t.Rating;
  const ratingNum = Number(rawRating);
  const hasRating = Number.isFinite(ratingNum) && ratingNum > 0;

  return {
    therapistId: t.therapistId,
    userId: t.userId,
    name: `د. ${t.firstName} ${t.lastName}`,
    firstName: t.firstName,
    lastName: t.lastName,
    specialty: t.specialization || '',
    availability: 'متاح للحجز',
    sessions: t.experienceYears ? `+${t.experienceYears * 40}` : '+40',
    rating: hasRating ? ratingNum.toFixed(1) : '—',
    ratingValue: hasRating ? Math.min(5, ratingNum) : 0,
    reviewCount: t.reviewCount ?? t.ReviewCount ?? 0,
    experience: t.experienceYears ? `${t.experienceYears} سنة` : '—',
    experienceYears: t.experienceYears || 0,
    hourlyRate: t.hourlyRate || 250,
    bio: t.bio || '',
    specialties,
    qualifications: t.qualifications || '',
    email: t.email,
    phone: t.phone,
    image: doctorAvatarUrl(t.therapistId, t.profileImageUrl || fallbackImage),
    isVerified: !!t.isVerified,
    status: t.status || (t.isVerified ? 'Approved' : 'Pending'),
    rejectionReason: t.rejectionReason || null,
  };
}
