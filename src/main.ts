import express, { json } from "express";
import http from "http";
import { Server as WebSocketServer } from "socket.io";
import dotenv from "dotenv";
import { connectDb } from "./config/database";
import { MessageRepository } from "./message/message_repo";
import { userRepo } from "./user/user_repo";
import { RegisterRoutes } from "./swagger/routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger.json";
import cors from "cors";
import { logger } from "./config/logger";
import winston from 'winston'

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());

RegisterRoutes(app);
const server = http.createServer(app);
const webSocket = new WebSocketServer(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("WebSocket Live Chat Server is running.");
});
connectDb();

const activeUsers = new Map<string, { socketId: string; username: string }>();

// WebSocket connection handling
webSocket.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // listen for user connection and store active users
  socket.on("user:connected", (data: { userId: string; username: string }) => {
    if (!data) {
      console.error("Invalid user connection data");
      return;
    }
    activeUsers.set(data.userId, {
      socketId: socket.id,
      username: data.username,
    });
    // save user socketid and online status is changed
    userRepo.updateUser(data.userId, socket.id, true);
    logger.info(`User got updated to db: ${data.userId} with socket ID: ${socket.id}`);

    
    // Notify all other users that a user is online
    socket.broadcast.emit("user:is-online", {
      userId: data.userId,
      username: data.username,
    });
  });

  // listen for user disconnection and remove from active users
  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
    for (const [userId, data] of activeUsers.entries()) {
      if (data.socketId === socket.id) {
        activeUsers.delete(userId);
        logger.info(`active user got disconnected: ${userId}`);
        // Notify all users that a user is offline
        socket.broadcast.emit("user:is-offline", {
          userId: userId,
          username: data.username,
        });
        break;
      }
    }
  });

  socket.on(
    "send:message",
    (data: { senderId: string; receiverId: string; message: string }) => {
      try {
        // Save message to database
        new MessageRepository().createMessage(
          data.senderId,
          data.receiverId,
          data.message,
        );
        logger.info(`user ${data.receiverId} recieved their message`);

        // Emit message to receiver if online
        const activeData = activeUsers.get(data.receiverId);

        if (activeData?.socketId) {
          logger.info(`the user socketId is available ${activeData.socketId}`)
          webSocket.to(activeData.socketId).emit("receive:message", {
            senderId: data.senderId,
            message: data.message,
          });
          logger.info(
            `Message sent from ${data.senderId} to ${data.receiverId}`,
          );
        }

        // Acknowledge the sender
        const activeSender = activeUsers.get(data.senderId);
        if (activeSender?.socketId) {
          webSocket.to(activeSender.socketId).emit("message:sent", {
            receiverId: data.receiverId,
            message: data.message,
          });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to send message." });
        console.error("Error sending message:", error);
      }
    },
  );

  socket.on("user:typing", (data) => {
    const receiverData = activeUsers.get(data.recieverId);
    if (receiverData?.socketId) {
      webSocket.to(receiverData.socketId).emit("useris:typing", {
        senderId: data.senderId,
      });
    }
  });

  socket.on("user:stop-typing", (data) => {
    const receiverData = activeUsers.get(data.recieverId);
    if (receiverData?.socketId) {
      webSocket.to(receiverData.socketId).emit("userstopped:typing", {
        senderId: data.senderId,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, sockId] of activeUsers.entries()) {
      if (sockId.socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });

  socket.on(
    "load:messages",
    async (data: { userId: string; otherUserId: string }) => {
      try {
        // Fetch messages between the two users from the database
        const messages = await new MessageRepository().getMessagesBetweenUsers(
          data.userId,
          data.otherUserId,
        );

        // Send the messages back to the requesting client
        socket.emit("messages:loaded", {
          messages: messages,
          userId: data.userId,
          otherUserId: data.otherUserId,
        });

        console.log(
          `Loaded ${messages.length} messages for user ${data.userId}`,
        );
      } catch (error) {
        socket.emit("error", { message: "Failed to load messages." });
        console.error("Error loading messages:", error);
      }
    },
  );
});
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  //
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
});
