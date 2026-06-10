import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import queueRoutes from './routes/queueRoutes.js';
import { CONFIG } from './config/constants.js';
import { errorHandler, notFound } from './utils/errors.js';
import { generalLimiter } from './utils/rate-limiter.js';
import logger from './utils/logger.js';

function isLocalDevelopmentOrigin(origin) {
  if (!CONFIG.SERVER.allowPrivateNetworkOrigins) {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    const localHosts = ['localhost', '127.0.0.1', '::1', '[::1]'];
    const vscodeProtocols = ['vscode-webview:', 'vscode-file:', 'vscode-webview-resource:'];
    if (vscodeProtocols.includes(protocol)) {
      return true;
    }

    if (!['http:', 'https:'].includes(protocol)) {
      return false;
    }

    if (localHosts.includes(hostname)) {
      return true;
    }

    const ipv4Parts = hostname.split('.').map((part) => Number(part));
    if (ipv4Parts.length !== 4 || ipv4Parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return false;
    }

    const [first, second] = ipv4Parts;
    return (
      first === 10 ||
      first === 127 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  } catch {
    return false;
  }
}

export function corsOptions() {
  const allowedOrigins = CONFIG.SERVER.clientUrls;

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin is not allowed by CORS: ${origin}`));
    }
  };
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Apply rate limiting
  app.use(generalLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'QueuePulse API' });
  });

  app.use('/', queueRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
