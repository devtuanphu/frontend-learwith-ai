import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Exercises API
export const exercisesApi = {
  getTemplates: async (topic?: string) => {
    const response = await api.get('/exercises/templates', { params: { topic } });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
};

// Progress API
export const progressApi = {
  startWarmUp: async () => {
    const response = await api.post('/progress/start-warmup');
    return response.data;
  },
  submitAnswer: async (data: {
    userExerciseId: string;
    questionId: string;
    selectedOptionIds: string[];
    textAnswer?: string;
    timeSpent?: number;
  }) => {
    const response = await api.post('/progress/submit-answer', data);
    return response.data;
  },
  completeExercise: async (userExerciseId: string) => {
    const response = await api.post(`/progress/complete/${userExerciseId}`);
    return response.data;
  },
  getResult: async (userExerciseId: string) => {
    const response = await api.get(`/progress/result/${userExerciseId}`);
    return response.data;
  },
  getOverview: async () => {
    const response = await api.get('/progress/overview');
    return response.data;
  },
  getErrors: async () => {
    const response = await api.get('/progress/errors');
    return response.data;
  },
};

// Learning API
export const learningApi = {
  startPractice: async () => {
    const response = await api.post('/learning/start-practice');
    return response.data;
  },
  startAdvancedPractice: async () => {
    const response = await api.post('/learning/start-advanced');
    return response.data;
  },
  startApplication: async () => {
    const response = await api.post('/learning/start-application');
    return response.data;
  },
  chat: async (sessionId: string, message: string) => {
    const response = await api.post(`/learning/chat/${sessionId}`, { message });
    return response.data;
  },
  getMessages: async (sessionId: string) => {
    const response = await api.get(`/learning/session/${sessionId}/messages`);
    return response.data;
  },
  completeSession: async (sessionId: string) => {
    const response = await api.post(`/learning/session/${sessionId}/complete`);
    return response.data;
  },
  getGameFeedback: async (gameResults: Array<{
    exerciseIndex: number;
    exerciseType: string;
    questionIndex: number;
    questionContent: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    timeSpent: number;
    earnedPoints: number;
    errorType?: string;
    errorDescription?: string;
  }>) => {
    const response = await api.post('/learning/game-feedback', { gameResults });
    return response.data;
  },
};

// Categories API (Menu System)
export interface Category {
  id: string;
  parentId: string | null;
  level: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface Topic {
  id: string;
  categoryId: string;
  name: string;
  isGameSupported: boolean;
  sortOrder: number;
  isActive: boolean;
}

export const categoriesApi = {
  getMenuTree: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  getChildren: async (categoryId: string): Promise<Category[]> => {
    const response = await api.get(`/categories/${categoryId}/children`);
    return response.data;
  },
  getTopics: async (categoryId: string): Promise<Topic[]> => {
    const response = await api.get(`/categories/${categoryId}/topics`);
    return response.data;
  },
};

// Leaderboard API
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  timeMs: number;
  accuracy: number;
}

export const leaderboardApi = {
  getLeaderboard: async (topicId: string): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/leaderboard/${topicId}`);
    return response.data;
  },
  getMyRank: async (topicId: string): Promise<{ rank: number | null; bestScore: number; bestTime: number }> => {
    const response = await api.get(`/leaderboard/${topicId}/my-rank`);
    return response.data;
  },
};

export default api;

