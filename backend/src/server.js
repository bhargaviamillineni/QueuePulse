import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { corsOptions, createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { CONFIG } from './config/constants.js';
import { registerSocketHandlers, setSocketServer } from './sockets/index.js';

const { port } = CONFIG.SERVER;
const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    ...corsOptions(),
    methods: ['GET', 'POST']
  }
});

setSocketServer(io);
registerSocketHandlers(io);

connectDatabase(process.env.MONGODB_URI)
  .then(() => {
    server.listen(port, () => {
      console.log(`QueuePulse API listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
