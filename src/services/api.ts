// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
    throw new Error(error.error || 'Sunucu hatası');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    return apiCall<{
      success: boolean;
      user: {
        id: number;
        sapId: string;
        username: string;
        name: string;
        role: string;
        purchaseAuthority: boolean;
        financeAuthority: boolean;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  getUsers: async () => {
    return apiCall<Array<{
      id: number;
      sapId: string;
      username: string;
      name: string;
      role: string;
      purchaseAuthority: boolean;
      financeAuthority: boolean;
      status: string;
      createdAt: string;
    }>>('/auth/users');
  },

  createUser: async (userData: {
    sapId: string;
    username: string;
    password: string;
    name: string;
    role: string;
    purchaseAuthority: boolean;
    financeAuthority: boolean;
  }) => {
    return apiCall<{ success: boolean; userId: number }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (
    id: number,
    userData: {
      name: string;
      role: string;
      purchaseAuthority: boolean;
      financeAuthority: boolean;
      status: string;
    }
  ) => {
    return apiCall<{ success: boolean }>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Requests API
export const requestsAPI = {
  getAll: async (userId?: number, userRole?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (userRole) params.append('userRole', userRole);

    return apiCall<Array<any>>(`/requests?${params.toString()}`);
  },

  create: async (requestData: any) => {
    return apiCall<{ success: boolean; requestId: number }>('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  update: async (id: number, requestData: any) => {
    return apiCall<{ success: boolean }>(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  getNextDocNumber: async () => {
    return apiCall<{ nextDocNumber: string }>('/requests/next-doc-number');
  },

  loadSampleData: async () => {
    return apiCall<{ success: boolean; message: string; totalProcessed: number; inserted: number }>('/requests/load-sample-data', {
      method: 'POST',
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiCall<{ status: string; message: string }>('/health');
};
