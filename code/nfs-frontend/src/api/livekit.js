import axiosInstance from './axiosInstance';

export async function fetchLiveKitToken(appointmentId) {
  const response = await axiosInstance.post(
    `/api/livekit/appointments/${appointmentId}/token`
  );
  return response.data;
}
