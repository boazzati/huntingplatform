import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Hunt {
  id?: string;
  subChannel: string;
  markets: string[];
  focusBrands: string[];
  accounts: Account[];
  huntResult: {
    summary: string;
    totalAccounts: number;
  };
  createdAt?: string;
}

export interface Account {
  name: string;
  markets: string[];
  segment: string;
  score: number;
  currentStep: number;
  rationale: string;
  ideas: Array<{ title: string; description: string }>;
  stage: string;
  steps: Array<{ step: number; name: string; note: string }>;
}

export interface Playbook {
  id?: string;
  subChannel: string;
  version: number;
  contentMd: string;
  createdAt?: string;
  updatedAt?: string;
}

// Hunts API
export const huntsAPI = {
  create: async (params: {
    subChannel: string;
    markets: string[];
    focusBrands: string[];
    maxAccounts?: number;
  }): Promise<Hunt> => {
    const response = await apiClient.post('/api/hunts', params);
    return response.data;
  },

  list: async (subChannel?: string, limit = 20, offset = 0) => {
    const response = await apiClient.get('/api/hunts', {
      params: { subChannel, limit, offset },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Hunt> => {
    const response = await apiClient.get(`/api/hunts/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/hunts/${id}`);
  },
};

// Playbooks API
export const playbooksAPI = {
  generate: async (subChannel: string): Promise<Playbook> => {
    const response = await apiClient.post(`/api/playbooks/${subChannel}`);
    return response.data;
  },

  getBySubChannel: async (subChannel: string): Promise<Playbook> => {
    const response = await apiClient.get(`/api/playbooks/${subChannel}`);
    return response.data;
  },

  list: async () => {
    const response = await apiClient.get('/api/playbooks');
    return response.data;
  },
};

export default apiClient;
