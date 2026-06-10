export function getEnv(name, fallback) {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`${name} is required`);
}

export function getNumberEnv(name, fallback) {
  const rawValue = getEnv(name, fallback);
  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`);
  }

  return value;
}

export function getBooleanEnv(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function getListEnv(name, fallback = '') {
  return getEnv(name, fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
