import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
import dotenv from 'dotenv';

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


server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
  