import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
  const serverUrl = apiUrl.replace('/api/v1', '');

  socket = io(serverUrl, {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    
    // Join user room if authenticated
    const authStore = useAuthStore();
    if (authStore.isAuthenticated && authStore.user?.id) {
      socket.emit('join_user', authStore.user.id);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
