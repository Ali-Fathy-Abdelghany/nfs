import axiosInstance from './axiosInstance';

export const fetchTherapists = () => axiosInstance.get('/api/therapists');
export const fetchTherapistById = (id) => axiosInstance.get(`/api/therapists/${id}`);
export const searchTherapists = (query) => axiosInstance.get('/api/therapists/search', { params: { q: query } });
export const createTherapist = (data) => axiosInstance.post('/api/therapists', data);
