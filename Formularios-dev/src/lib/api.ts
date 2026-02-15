// lib/api.ts - Cliente API para comunicación con NestJS Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Importante para enviar/recibir cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'Error en la petición',
      data,
    );
  }

  return data;
}

// Tipos de respuesta
export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
  isTwoFactorEnabled: boolean;
}

export interface LoginResponse {
  user?: User;
  requires2FA?: boolean;
  tempToken?: string;
  message?: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface Enable2FAResponse {
  message: string;
  backupCodes: string[];
}

// API Client
export const api = {
  // Registro
  register: (data: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
  }): Promise<User> =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Login
  login: (username: string, password: string): Promise<LoginResponse> =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Verificar 2FA
  verify2FA: (tempToken: string, code: string): Promise<{ user: User }> =>
    fetchApi('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    }),

  // Logout
  logout: (): Promise<{ message: string }> =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  // Obtener usuario actual
  getMe: (): Promise<User> => fetchApi('/auth/me'),

  // Refresh token
  refresh: (): Promise<{ user: User }> =>
    fetchApi('/auth/refresh', {
      method: 'POST',
    }),

  // Setup 2FA (generar QR)
  setup2FA: (): Promise<Setup2FAResponse> =>
    fetchApi('/auth/2fa/setup', {
      method: 'POST',
    }),

  // Habilitar 2FA
  enable2FA: (code: string): Promise<Enable2FAResponse> =>
    fetchApi('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Deshabilitar 2FA
  disable2FA: (code: string): Promise<{ message: string }> =>
    fetchApi('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};