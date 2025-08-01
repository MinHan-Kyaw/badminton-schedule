export interface GameSession {
  _id?: string;
  courts: number;
  maxPlayers: number;
  maxStandbyPlayers: number;
  date: string;
  time: string;
  location: string;
  googleMapsLink?: string;
  isActive: boolean;
  players: Player[];
  standbyPlayers: Player[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Player {
  _id?: string;
  name: string;
  joinedAt: Date;
}

export interface GameSettings {
  courts: number;
  maxPlayers: number;
  maxStandbyPlayers: number;
  date: string;
  time: string;
  location: string;
  googleMapsLink?: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 
