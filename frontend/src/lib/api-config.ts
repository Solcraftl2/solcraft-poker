// API Configuration for SolCraft Poker
// Configurazione per collegare il frontend Next.js con il backend FastAPI

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Base
  health: `${API_BASE_URL}/health`,
  
  // Tournaments
  tournaments: `${API_BASE_URL}/api/tournaments`,
  tournamentById: (id: string) => `${API_BASE_URL}/api/tournaments/${id}`,
  
  // Players
  players: `${API_BASE_URL}/api/players`,
  playerProfile: (id: string) => `${API_BASE_URL}/api/players/${id}`,
  
  // Fees
  fees: `${API_BASE_URL}/api/fees`,
  
  // Guarantees
  guarantees: `${API_BASE_URL}/api/guarantees`,
} as const;

// API Client configuration
export const apiClient = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function for API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...apiClient.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Specific API functions
export const api = {
  // Health check
  healthCheck: () => apiCall<{status: string, database: string, api: string}>(API_ENDPOINTS.health),
  
  // Tournaments
  getTournaments: () => apiCall<any[]>(API_ENDPOINTS.tournaments),
  getTournament: (id: string) => apiCall<any>(API_ENDPOINTS.tournamentById(id)),
  createTournament: (data: any) => apiCall<any>(API_ENDPOINTS.tournaments, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Players
  getPlayers: () => apiCall<any[]>(API_ENDPOINTS.players),
  getPlayerProfile: (id: string) => apiCall<any>(API_ENDPOINTS.playerProfile(id)),
  
  // Fees
  getFees: () => apiCall<any[]>(API_ENDPOINTS.fees),
  
  // Guarantees
  getGuarantees: () => apiCall<any[]>(API_ENDPOINTS.guarantees),
};

export default api;

