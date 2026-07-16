import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface Game {
  id: number;
  name: string;
  developer: string;
  score?: number;
  fullclear?: boolean;
  avgScore: number;
  fullclearCount: number;
  ratingCount: number;
}

export interface ChatResponse {
  response: string;
  audio?: string;
}

export interface User {
  id: number;
  username: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

let csrfToken: string | null = null;

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }
  const response = await axios.get<{ csrf_token: string }>('/api/csrf-token', {
    withCredentials: true,
  });
  csrfToken = response.data.csrf_token;
  return csrfToken;
}

function attachCsrfInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase() ?? 'get';
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const token = await ensureCsrfToken();
      config.headers.set('X-CSRFToken', token);
    }
    return config;
  });
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachCsrfInterceptor(api);

export const apiService = {
  async initializeCsrf(): Promise<void> {
    await ensureCsrfToken();
  },

  async checkAuth(): Promise<User | null> {
    try {
      const response = await api.get<User>('/auth/check');
      return response.data;
    } catch {
      return null;
    }
  },

  async login(
    username: string,
    password: string,
    recaptchaToken?: string
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
      recaptcha_token: recaptchaToken,
    });
    return response.data;
  },

  async register(
    username: string,
    password: string,
    email: string,
    recaptchaToken?: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/register', {
      username,
      password,
      email,
      recaptcha_token: recaptchaToken,
    });
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    csrfToken = null;
    return response.data;
  },

  async getGames(): Promise<Game[]> {
    const response = await api.get<Game[]>('/games');
    return response.data;
  },

  async getGame(gameId: number): Promise<Game> {
    const response = await api.get<Game>(`/games/${gameId}`);
    return response.data;
  },

  async rateGame(
    gameId: number,
    rating: number,
    fullclear: boolean
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/games/${gameId}/rate`, {
      gameId,
      rating,
      fullclear,
    });
    return response.data;
  },

  async sendChatMessage(
    message: string,
    context: string = 'general',
    withVoice: boolean = false
  ): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat', {
      message,
      context,
      voice: withVoice,
    });
    return response.data;
  },

  async sendAudioToVoiceService(formData: FormData): Promise<{ text: string }> {
    const token = await ensureCsrfToken();
    const response = await api.post<{ text: string }>(
      '/voice/convert-and-transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': token,
        },
      }
    );
    return response.data;
  },
};
