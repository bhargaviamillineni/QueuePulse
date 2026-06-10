import axios from 'axios';

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.VITE_API_PORT) {
    const protocol = import.meta.env.VITE_API_PROTOCOL || window.location.protocol;
    return `${protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT}`;
  }

  return window.location.origin;
}

export const API_URL = resolveApiUrl();

/**
 * API client with automatic token handling
 * @type {import('axios').AxiosInstance}
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000
});

/**
 * Add Authorization token to requests
 * @param {string} token - JWT token
 */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
}

/**
 * Get stored token from localStorage
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Initialize API with stored token on app load
 */
export function initializeAuth() {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
}

/**
 * Clear all auth data
 */
export function clearAuth() {
  setAuthToken(null);
}

/**
 * Extract error message from API response
 * @param {any} error - Error object
 * @returns {string}
 */
export function errorMessage(error) {
  return error?.response?.data?.message || error.message || 'Something went wrong';
}
