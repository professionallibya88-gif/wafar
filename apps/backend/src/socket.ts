import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import logger from './config/logger';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3050',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join_user', (userId: string) => {
      socket.join(`user_${userId}`);
      logger.info(`Socket ${socket.id} joined user_${userId}`);
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admins');
      logger.info(`Socket ${socket.id} joined admins`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
