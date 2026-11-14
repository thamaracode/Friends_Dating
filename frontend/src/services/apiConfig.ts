/**
 * Dynamic API and WebSocket configuration for Soulverse.
 * Automatically resolves the correct host so that local network devices
 * (e.g. mobile phones on the same Wi-Fi) connect seamlessly to the backend server.
 */

export const getHost = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return '127.0.0.1';
};

export const getProtocol = (): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'https:';
  }
  return 'http:';
};

export const getWsProtocol = (): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'wss:';
  }
  return 'ws:';
};

// API Bases - Relative paths route cleanly through Vite proxy on both desktop and mobile
export const API_BASE = '/api';
export const API_BASE_V1 = '/api/v1';

// Direct backend URL
export const BACKEND_URL = `${getProtocol()}//${getHost()}:3001`;

// WebSocket Base - Connects directly to backend port 3001 on the host machine
export const WS_BASE = `${getWsProtocol()}//${getHost()}:3001`;
