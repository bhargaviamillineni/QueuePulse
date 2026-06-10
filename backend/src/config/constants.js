import { getBooleanEnv, getEnv, getListEnv, getNumberEnv } from './env.js';

export const CONFIG = {
  SERVER: {
    port: getNumberEnv('PORT'),
    clientUrls: getListEnv('CLIENT_URL'),
    allowPrivateNetworkOrigins: getBooleanEnv('CORS_ALLOW_PRIVATE_NETWORK', process.env.NODE_ENV !== 'production')
  },

  // Rate Limiting (requests per time window)
  RATE_LIMITS: {
    general: {
      windowMs: getNumberEnv('RATE_LIMIT_GENERAL_WINDOW_MS', 15 * 60 * 1000),
      max: getNumberEnv('RATE_LIMIT_GENERAL')
    },
    auth: {
      windowMs: getNumberEnv('RATE_LIMIT_AUTH_WINDOW_MS', 15 * 60 * 1000),
      max: getNumberEnv('RATE_LIMIT_AUTH')
    },
    registration: {
      windowMs: getNumberEnv('RATE_LIMIT_REGISTRATION_WINDOW_MS', 60 * 1000),
      max: getNumberEnv('RATE_LIMIT_REGISTRATION')
    },
    strict: {
      windowMs: getNumberEnv('RATE_LIMIT_STRICT_WINDOW_MS', 15 * 60 * 1000),
      max: getNumberEnv('RATE_LIMIT_STRICT')
    }
  },

  // Queue Health Thresholds
  QUEUE_HEALTH: {
    critical: {
      patients: getNumberEnv('QUEUE_HEALTH_CRITICAL_PATIENTS'),
      minutes: getNumberEnv('QUEUE_HEALTH_CRITICAL_MINUTES')
    },
    busy: {
      patients: getNumberEnv('QUEUE_HEALTH_BUSY_PATIENTS'),
      minutes: getNumberEnv('QUEUE_HEALTH_BUSY_MINUTES')
    },
    steady: {
      patients: getNumberEnv('QUEUE_HEALTH_STEADY_PATIENTS'),
      minutes: getNumberEnv('QUEUE_HEALTH_STEADY_MINUTES')
    }
  },

  // Efficiency Score Calculations
  EFFICIENCY: {
    maxWaitPenalty: getNumberEnv('EFFICIENCY_MAX_WAIT_PENALTY'),
    maxQueuePenalty: getNumberEnv('EFFICIENCY_MAX_QUEUE_PENALTY'),
    speedBonus: getNumberEnv('EFFICIENCY_SPEED_BONUS'),
    speedThreshold: getNumberEnv('EFFICIENCY_SPEED_THRESHOLD')
  },

  // Logging
  LOGGING: {
    dir: getEnv('LOG_DIR'),
    errorFile: getEnv('LOG_ERROR_FILE'),
    combinedFile: getEnv('LOG_COMBINED_FILE')
  },

  // Authentication
  AUTH: {
    bcryptRounds: getNumberEnv('BCRYPT_ROUNDS'),
    defaultExpiryMinutes: getNumberEnv('DEFAULT_CONSULTATION_MINUTES')
  },

  // Validation Bounds
  VALIDATION: {
    age: {
      min: getNumberEnv('AGE_MIN'),
      max: getNumberEnv('AGE_MAX')
    },
    consultation: {
      min: getNumberEnv('CONSULTATION_MIN'),
      max: getNumberEnv('CONSULTATION_MAX')
    },
    name: {
      min: getNumberEnv('NAME_MIN'),
      max: getNumberEnv('NAME_MAX')
    },
    reason: {
      max: getNumberEnv('REASON_MAX')
    },
    phone: {
      max: getNumberEnv('PHONE_MAX')
    },
    password: {
      min: getNumberEnv('PASSWORD_MIN'),
      max: getNumberEnv('PASSWORD_MAX')
    }
  },

  // Consultation History
  CONSULTATION: {
    historySize: getNumberEnv('CONSULTATION_HISTORY_SIZE')
  }
};
