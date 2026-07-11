import axiosInstance from './axiosInstance';

export const fetchChatRooms = () => axiosInstance.get('/api/chat/rooms');
export const createChatRoom = (data) => axiosInstance.post('/api/chat/rooms', data);
export const joinChatRoom = (roomId) => axiosInstance.post(`/api/chat/rooms/${roomId}/join`);
export const leaveChatRoom = (roomId) => axiosInstance.post(`/api/chat/rooms/${roomId}/leave`);
export const fetchChatHistory = (roomId) => axiosInstance.get(`/api/chat/history/${roomId}`);
export const fetchPrivateChat = (otherUserId) => axiosInstance.get(`/api/chat/private/${otherUserId}`);

export function mapRoomFromApi(room) {
  return {
    id: room.id,
    name: room.name,
    membersCount: room.membersCount ?? 0,
    avatar: room.avatar || '🌱',
    description: room.description || '',
    joined: room.joined ?? false,
  };
}
