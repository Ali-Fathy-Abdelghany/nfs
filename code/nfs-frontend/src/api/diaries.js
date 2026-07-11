import axiosInstance from './axiosInstance';

export const fetchDiariesByPatient = (patientId) => axiosInstance.get(`/api/diaries/patient/${patientId}`);
export const createDiaryEntry = (data) => axiosInstance.post('/api/diaries', data);
export const updateDiaryEntry = (id, data) => axiosInstance.put(`/api/diaries/${id}`, data);
export const deleteDiaryEntry = (id) => axiosInstance.delete(`/api/diaries/${id}`);

export function mapDiaryToEntry(diary) {
  return {
    id: diary.id,
    title: diary.title,
    content: diary.content,
    mood: diary.mood,
    date: new Date(diary.createdAt).toLocaleDateString('ar-EG'),
    createdAt: diary.createdAt,
  };
}
