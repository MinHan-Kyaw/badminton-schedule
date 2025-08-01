import axios from 'axios';
import { GameSession, Player, ApiResponse } from '../types';

// Replace with your MongoDB Atlas connection string
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Debug: Log the API URL being used
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment Variable:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameApi = {
  // Get current active game session
  getCurrentSession: async (): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.get('/game/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current session:', error);
      throw error;
    }
  },

  // Create new game session
  createSession: async (session: Omit<GameSession, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.post('/game', session);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update game session
  updateSession: async (id: string, session: Partial<GameSession>): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.put(`/game/${id}`, session);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Add player to session
  addPlayer: async (sessionId: string, player: Omit<Player, '_id'>): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.post(`/game/${sessionId}/players`, player);
      return response.data;
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  },

  // Remove player from session
  removePlayer: async (sessionId: string, playerId: string): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.delete(`/game/${sessionId}/players/${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing player:', error);
      throw error;
    }
  },

  // Update player name
  updatePlayer: async (sessionId: string, playerId: string, player: Partial<Player>): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.put(`/game/${sessionId}/players/${playerId}`, player);
      return response.data;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  // Promote standby player to regular player
  promotePlayer: async (sessionId: string, playerId: string): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.post(`/game/${sessionId}/players/${playerId}/promote`);
      return response.data;
    } catch (error) {
      console.error('Error promoting player:', error);
      throw error;
    }
  },

  // Close current session
  closeSession: async (sessionId: string): Promise<ApiResponse<GameSession>> => {
    try {
      const response = await api.put(`/game/${sessionId}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing session:', error);
      throw error;
    }
  },
}; 
