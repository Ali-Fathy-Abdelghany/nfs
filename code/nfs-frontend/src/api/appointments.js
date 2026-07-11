import axiosInstance from './axiosInstance';

export const createAppointment = (data) => axiosInstance.post('/api/appointments', data);
export const fetchPatientAppointments = (patientId) => axiosInstance.get(`/api/appointments/patient/${patientId}`);
export const fetchDoctorAvailability = (doctorId) => axiosInstance.get(`/api/appointments/availability/${doctorId}`);
export const rescheduleAppointment = (data) => axiosInstance.put('/api/appointments/reschedule', data);
export const cancelAppointment = (id) => axiosInstance.delete(`/api/appointments/${id}`);
