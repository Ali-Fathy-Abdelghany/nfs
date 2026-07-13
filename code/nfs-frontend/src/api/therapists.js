import axiosInstance from './axiosInstance';

export const fetchTherapists = () => axiosInstance.get('/api/therapists');
export const fetchPendingTherapists = () => axiosInstance.get('/api/therapists/pending');
export const fetchTherapistById = (id) => axiosInstance.get(`/api/therapists/${id}`);
export const fetchTherapistByUserId = (userId) => axiosInstance.get(`/api/therapists/by-user/${userId}`);
export const searchTherapists = (query) => axiosInstance.get('/api/therapists/search', { params: { q: query } });
export const createTherapist = (data) => axiosInstance.post('/api/therapists', data);
export const updateTherapist = (id, data) => axiosInstance.put(`/api/therapists/${id}`, data);
export const approveTherapist = (id) => axiosInstance.post(`/api/therapists/${id}/approve`);

export function mapTherapistToProfile(t, fallbackImage) {
  const specialties = t.qualifications
    ? t.qualifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
    : t.specialization
      ? [t.specialization]
      : [];

  return {
    therapistId: t.therapistId,
    userId: t.userId,
    name: `د. ${t.firstName} ${t.lastName}`,
    firstName: t.firstName,
    lastName: t.lastName,
    specialty: t.specialization || '',
    availability: 'متاح للحجز',
    sessions: t.experienceYears ? `+${t.experienceYears * 40}` : '+40',
    rating: t.rating != null ? Number(t.rating).toFixed(1) : '4.5',
    experience: t.experienceYears ? `${t.experienceYears} سنة` : '—',
    experienceYears: t.experienceYears || 0,
    hourlyRate: t.hourlyRate || 250,
    bio: t.bio || '',
    specialties,
    qualifications: t.qualifications || '',
    email: t.email,
    phone: t.phone,
    image: t.profileImageUrl || fallbackImage,
  };
}
