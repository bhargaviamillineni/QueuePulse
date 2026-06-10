import { calculateAnalytics } from '../services/analyticsService.js';
import { buildQueueState } from '../services/queueService.js';

let ioInstance;

export function setSocketServer(io) {
  ioInstance = io;
}

export function registerSocketHandlers(io) {
  io.on('connection', async (socket) => {
    socket.join('queue');

    socket.on('queue:subscribe', ({ tokenNumber } = {}) => {
      socket.join('queue');
      const parsedToken = Number(tokenNumber);
      if (Number.isSafeInteger(parsedToken) && parsedToken > 0) {
        socket.join(`token:${parsedToken}`);
      }
    });

    socket.emit('queue:updated', await buildQueueState());
    socket.emit('analytics:updated', await calculateAnalytics());
  });
}

export async function broadcastQueueUpdate() {
  if (!ioInstance) return;
  const [queueState, analytics] = await Promise.all([buildQueueState(), calculateAnalytics()]);
  ioInstance.to('queue').emit('queue:updated', queueState);
  ioInstance.to('queue').emit('analytics:updated', analytics);
}

export function emitAuditCreated(log) {
  if (!ioInstance) return;
  ioInstance.to('queue').emit('audit:created', log);
}
