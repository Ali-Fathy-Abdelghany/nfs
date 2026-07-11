import axiosInstance from './axiosInstance';

export const fetchPatients = () => axiosInstance.get('/api/patients');
export const fetchPatientById = (id) => axiosInstance.get(`/api/patients/${id}`);
export const fetchPatientMedicalHistory = (id) => axiosInstance.get(`/api/patients/${id}/medical-history`);
export const createPatient = (data) => axiosInstance.post('/api/patients', data);
