/**
 * Tournament Service - Real API Integration
 * Handles all tournament-related API calls to the backend
 */

import { apiCall, API_ENDPOINTS } from '../config/api';

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  description: string;
  buy_in: number;
  max_players: number;
  current_players: number;
  start_time: string;
  prize_pool: number;
  status: string;
  tournament_type: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentRequest {
  name: string;
  description: string;
  buy_in: number;
  max_players: number;
  start_time: string;
  prize_pool?: number;
  tournament_type?: string;
}

export interface JoinTournamentRequest {
  user_id: string;
  wallet_address: string;
}

// Tournament Service Class
export class TournamentService {
  
  /**
   * Get all tournaments with optional status filter
   */
  static async getTournaments(status?: string, limit: number = 10): Promise<Tournament[]> {
    try {
      const endpoint = `${API_ENDPOINTS.TOURNAMENTS.LIST}?${new URLSearchParams({
        ...(status && { status }),
        limit: limit.toString()
      })}`;
      
      const tournaments = await apiCall(endpoint, {
        method: 'GET'
      });
      
      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  }

  /**
   * Get tournament by ID
   */
  static async getTournament(tournamentId: string): Promise<Tournament> {
    try {
      const tournament = await apiCall(API_ENDPOINTS.TOURNAMENTS.GET(tournamentId), {
        method: 'GET'
      });
      
      return tournament;
    } catch (error) {
      console.error(`Error fetching tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Create new tournament
   */
  static async createTournament(tournamentData: CreateTournamentRequest): Promise<Tournament> {
    try {
      const tournament = await apiCall(API_ENDPOINTS.TOURNAMENTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(tournamentData)
      });
      
      return tournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  /**
   * Join tournament
   */
  static async joinTournament(tournamentId: string, joinData: JoinTournamentRequest): Promise<any> {
    try {
      const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.JOIN(tournamentId), {
        method: 'POST',
        body: JSON.stringify(joinData)
      });
      
      return result;
    } catch (error) {
      console.error(`Error joining tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Start tournament
   */
  static async startTournament(tournamentId: string): Promise<any> {
    try {
      const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.START(tournamentId), {
        method: 'POST'
      });
      
      return result;
    } catch (error) {
      console.error(`Error starting tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Get tournament leaderboard
   */
  static async getTournamentLeaderboard(tournamentId: string): Promise<any[]> {
    try {
      const leaderboard = await apiCall(API_ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId), {
        method: 'GET'
      });
      
      return leaderboard;
    } catch (error) {
      console.error(`Error fetching leaderboard for tournament ${tournamentId}:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming tournaments (convenience method)
   */
  static async getUpcomingTournaments(limit: number = 10): Promise<Tournament[]> {
    return this.getTournaments('upcoming', limit);
  }

  /**
   * Get active tournaments (convenience method)
   */
  static async getActiveTournaments(limit: number = 10): Promise<Tournament[]> {
    return this.getTournaments('active', limit);
  }

  /**
   * Get completed tournaments (convenience method)
   */
  static async getCompletedTournaments(limit: number = 10): Promise<Tournament[]> {
    return this.getTournaments('completed', limit);
  }
}

export default TournamentService;

