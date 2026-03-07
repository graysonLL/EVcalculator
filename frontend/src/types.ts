export interface BetSuggestion {
  market: string;
  selection: string;
  probability: number;
  decimalOdds: number;
  ev: number;
}

export interface GameListItem {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  statusText: string;
}

export interface GameDetails {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  statusText: string;
  winOdds: { home: number; away: number };
  teamStats: {
    home: { winPct: number; pointsPerGame: number; oppPointsPerGame: number };
    away: { winPct: number; pointsPerGame: number; oppPointsPerGame: number };
  };
  bets: BetSuggestion[];
}

export interface PlayerListItem {
  id: string;
  fullName: string;
  ppg: number;
  rpg: number;
  apg: number;
}

export interface PlayerDetails extends PlayerListItem {
  bets: BetSuggestion[];
}

export interface TeamListItem {
  id: string;
  abbreviation: string;
  fullName: string;
  winPct: number;
}

export interface TeamDetails extends TeamListItem {
  pointsPerGame: number;
  oppPointsPerGame: number;
  bets: BetSuggestion[];
}

// Auth & User types
export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Bet types
export type BetType =
  | "moneyline"
  | "game_total_over"
  | "game_total_under"
  | "team_total_over"
  | "team_total_under";
export type OddsCat = "american" | "decimal" | "fractional";
export type BetStatus = "pending" | "won" | "lost";

export interface Bet {
  _id: string;
  userId: string;
  betType: BetType;
  amount: number;
  odds: number;
  oddsCat: OddsCat;
  impliedProbability: number;
  expectedValue: number;
  gameId?: string;
  gameDate?: string;
  team?: string;
  status: BetStatus;
  acceptedFromAI: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
