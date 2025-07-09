/**
 * Custom Hook for Tournament Management
 * Replaces mock data with real API calls to the backend
 */

import { useState, useEffect, useCallback } from 'react';
import { TournamentService, Tournament } from '../services/tournamentService';

export interface UseTournamentsReturn {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTournament: (id: string) => Promise<Tournament | null>;
  createTournament: (data: any) => Promise<Tournament | null>;
  joinTournament: (tournamentId: string, userData: any) => Promise<boolean>;
}

export const useTournaments = (status?: string, limit: number = 10): UseTournamentsReturn => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await TournamentService.getTournaments(status, limit);
      setTournaments(data);
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
      
      // Fallback to empty array on error
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  const getTournament = useCallback(async (id: string): Promise<Tournament | null> => {
    try {
      const tournament = await TournamentService.getTournament(id);
      return tournament;
    } catch (err) {
      console.error(`Error fetching tournament ${id}:`, err);
      return null;
    }
  }, []);

  const createTournament = useCallback(async (data: any): Promise<Tournament | null> => {
    try {
      const tournament = await TournamentService.createTournament(data);
      
      // Refresh tournaments list after creation
      await fetchTournaments();
      
      return tournament;
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
      return null;
    }
  }, [fetchTournaments]);

  const joinTournament = useCallback(async (tournamentId: string, userData: any): Promise<boolean> => {
    try {
      await TournamentService.joinTournament(tournamentId, userData);
      
      // Refresh tournaments list after joining
      await fetchTournaments();
      
      return true;
    } catch (err) {
      console.error(`Error joining tournament ${tournamentId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to join tournament');
      return false;
    }
  }, [fetchTournaments]);

  // Initial fetch
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
    getTournament,
    createTournament,
    joinTournament,
  };
};

// Specialized hooks for different tournament types
export const useUpcomingTournaments = (limit: number = 10) => {
  return useTournaments('upcoming', limit);
};

export const useActiveTournaments = (limit: number = 10) => {
  return useTournaments('active', limit);
};

export const useCompletedTournaments = (limit: number = 10) => {
  return useTournaments('completed', limit);
};

// Hook for a single tournament
export const useTournament = (tournamentId: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await TournamentService.getTournament(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error(`Error fetching tournament ${tournamentId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
      setTournament(null);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return {
    tournament,
    loading,
    error,
    refetch: fetchTournament,
  };
};

export default useTournaments;

