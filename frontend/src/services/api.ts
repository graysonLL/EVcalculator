import type {
  BetSuggestion,
  GameDetails,
  GameListItem,
  PlayerDetails,
  PlayerListItem,
  TeamDetails,
  TeamListItem,
  AuthResponse,
  User,
  Bet,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

function clearAuthToken(): void {
  localStorage.removeItem("authToken");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (
    init?.headers &&
    typeof init.headers === "object" &&
    !Array.isArray(init.headers)
  ) {
    Object.assign(headers, init.headers);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getGamesByDate(date: string): Promise<GameListItem[]> {
  const result = await request<{ data: GameListItem[] }>(
    `/api/nba/games?date=${date}`,
  );
  return result.data;
}

export async function getGameDetails(
  gameId: string,
  date?: string,
): Promise<GameDetails> {
  const dateQuery = date ? `?date=${encodeURIComponent(date)}` : "";
  const result = await request<{ data: GameDetails }>(
    `/api/nba/games/${gameId}${dateQuery}`,
  );
  return result.data;
}

export async function getPlayers(
  page: number,
  sortBy: "alphabetical" | "ppg" | "rpg" | "apg",
): Promise<PlayerListItem[]> {
  const result = await request<{ data: PlayerListItem[] }>(
    `/api/nba/players?page=${page}&sortBy=${sortBy}`,
  );
  return result.data;
}

export async function getPlayerDetails(
  playerId: string,
): Promise<PlayerDetails> {
  const result = await request<{ data: PlayerDetails }>(
    `/api/nba/players/${playerId}`,
  );
  return result.data;
}

export async function getTeams(): Promise<TeamListItem[]> {
  const result = await request<{ data: TeamListItem[] }>("/api/nba/teams");
  return result.data;
}

export async function getTeamDetails(teamId: string): Promise<TeamDetails> {
  const result = await request<{ data: TeamDetails }>(
    `/api/nba/teams/${teamId}`,
  );
  return result.data;
}

export async function getGameInsight(payload: {
  gameLabel: string;
  odds: { home: number; away: number };
  bets: BetSuggestion[];
}): Promise<{ summary: string }> {
  return request<{ summary: string }>("/api/ev/explain", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Auth endpoints
export async function signup(
  username: string,
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password, passwordConfirm }),
  });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

export async function getProfile(): Promise<User> {
  return request<User>("/api/auth/profile");
}

export async function updateProfile(data: {
  username?: string;
  newPassword?: string;
  currentPassword?: string;
}): Promise<{ message: string; user: User }> {
  return request<{ message: string; user: User }>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthToken();
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Bet endpoints
export async function createBet(betData: {
  betType: string;
  amount: number;
  odds: number;
  oddsCat?: string;
  gameId?: string;
  gameDate?: string;
  team?: string;
  notes?: string;
}): Promise<{ message: string; bet: Bet }> {
  return request<{ message: string; bet: Bet }>("/api/bets", {
    method: "POST",
    body: JSON.stringify(betData),
  });
}

export async function getBets(): Promise<Bet[]> {
  return request<Bet[]>("/api/bets");
}

export async function updateBet(
  betId: string,
  data: { status?: string; notes?: string },
): Promise<{ message: string; bet: Bet }> {
  return request<{ message: string; bet: Bet }>(`/api/bets/${betId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBet(betId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/bets/${betId}`, {
    method: "DELETE",
  });
}
