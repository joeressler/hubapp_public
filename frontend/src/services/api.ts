import axios from 'axios';

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

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const voiceApi = axios.create({
  baseURL: '/voice',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const apiService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },

  async register(username: string, password: string, email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/register', { username, password, email });
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
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

  async rateGame(gameId: number, rating: number, fullclear: boolean): Promise<{ message: string }> {
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
      voice: withVoice 
    });
    return response.data;
  },


  async sendAudioToVoiceService(formData: FormData): Promise<{ text: string }> {
    const response = await voiceApi.post<{ text: string }>('/convert-and-transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 