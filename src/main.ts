import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
import dotenv from 'dotenv';
import { connectDb } from './config/database';
import { MessageRepository } from './message/message_repo';

dotenv.config();

const app = express();
const server = http.createServer(app);
const webSocket = new WebSocketServer(server, {
  cors: {
    origin: '*',
  },
});
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('WebSocket Live Chat Server is running.');
});
connectDb();

const activeUsers = new Map<string, string>();

// WebSocket connection handling
webSocket.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

    socket.on('user:connected', (userId: string) => {
    activeUsers.set(userId, socket.id);
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('send:message', (data: {senderId: string; receiverId: string; message: string}) => {  
        try {
            // Save message to database
            new MessageRepository().createMessage(
                data.senderId,
                data.receiverId,
                data.message,
            );

            // Emit message to receiver if online
            const receiverSocketId = activeUsers.get(data.receiverId);
            if (receiverSocketId) {
            webSocket.to(receiverSocketId).emit('receive:message', {
                senderId: data.senderId,
                message: data.message,
            });
            console.log(`Message sent from ${data.senderId} to ${data.receiverId}`);
            }

            // Acknowledge the sender
            const senderSocketId = activeUsers.get(data.senderId);
            if (senderSocketId) {
            webSocket.to(senderSocketId).emit('message:sent', {
                receiverId: data.receiverId,
                message: data.message,
            });
            }
        } catch (error) {
            socket.emit('error', {message: 'Failed to send message.'});
            console.error('Error sending message:', error);
        }
    });

    socket.on('typing', (recieverId) => {
        const receiverSocketId = activeUsers.get(recieverId);
        if (receiverSocketId) {
            webSocket.to(receiverSocketId).emit('typing', {
                senderId: socket.id,
            });
        }
    })

    socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    };
  }
)
});
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
  