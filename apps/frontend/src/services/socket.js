import { io } from 'socket.io-client';

let socket = null;

const resolveSocketServerUrl = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL || '/api';

  if (rawApiUrl.startsWith('/')) {
    return window.location.origin;
  }

  try {
    const url = new URL(rawApiUrl);
    url.pathname = url.pathname.replace(/\/api(?:\/v\d+)?\/?$/, '') || '/';
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawApiUrl.replace(/\/api(?:\/v\d+)?\/?$/, '');
  }
};

export const initSocket = () => {
  if (socket) return socket;

  const serverUrl = resolveSocketServerUrl();

  socket = io(serverUrl, {
    withCredentials: true,
  });

  socket.on('disconnect', () => {
    // Handle disconnect
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
