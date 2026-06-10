import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, `../../${CONFIG.LOGGING.dir}`);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'queuepulse-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, CONFIG.LOGGING.errorFile),
      level: 'error'
    }),
    new winston.transports.File({ filename: path.join(logsDir, CONFIG.LOGGING.combinedFile) })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
      )
    })
  );
}

export default logger;
