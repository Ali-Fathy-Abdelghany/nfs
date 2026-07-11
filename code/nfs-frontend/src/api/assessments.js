import axiosInstance from './axiosInstance';

export const fetchAssessments = () => axiosInstance.get('/api/assessments');
export const createAssessment = (data) => axiosInstance.post('/api/assessments', data);
export const submitAssessmentResult = (id, data) => axiosInstance.post(`/api/assessments/${id}/results`, data);
