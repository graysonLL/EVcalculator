import { runNbaScript } from "../services/nbaClient.js";
import { expectedValue, oddsFromProbability } from "../services/evMath.js";

function normalizeGameSummary(rawGame) {
  const homeTeam =
    rawGame.homeTeam?.teamName || rawGame.homeTeam?.teamTricode || "Home Team";
  const awayTeam =
    rawGame.awayTeam?.teamName || rawGame.awayTeam?.teamTricode || "Away Team";
  return {
    gameId: String(rawGame.gameId),
    homeTeamId: String(rawGame.homeTeam?.teamId ?? ""),
    awayTeamId: String(rawGame.awayTeam?.teamId ?? ""),
    homeTeam,
    awayTeam,
    statusText: rawGame.gameStatusText || rawGame.gameStatus || "Scheduled",
  };
}

function clamp(value, min = 0.01, max = 0.99) {
  return Math.max(min, Math.min(max, value));
}

function winOddsFromSeasonStats(homeTeamStats, awayTeamStats) {
  const homeStrength =
    homeTeamStats.winPct * 100 + homeTeamStats.plusMinus * 2 + 2.5;
  const awayStrength = awayTeamStats.winPct * 100 + awayTeamStats.plusMinus * 2;
  const spread = homeStrength - awayStrength;
  const home = clamp(1 / (1 + Math.exp(-spread / 8)));

  return {
    home: Number(home.toFixed(4)),
    away: Number((1 - home).toFixed(4)),
  };
}

function buildGameBets({
  homeTeam,
  awayTeam,
  winOdds,
  homeTeamStats,
  awayTeamStats,
}) {
  const homeMoneylineOdds = oddsFromProbability(winOdds.home, 0.04);
  const awayMoneylineOdds = oddsFromProbability(winOdds.away, 0.04);
  const projectedGameTotal =
    homeTeamStats.pointsPerGame + awayTeamStats.pointsPerGame;
  const gameTotalLine = Number((projectedGameTotal - 0.5).toFixed(1));
  const homeTotalLine = Number((homeTeamStats.pointsPerGame - 0.5).toFixed(1));
  const awayTotalLine = Number((awayTeamStats.pointsPerGame - 0.5).toFixed(1));

  const overProbability = clamp(
    0.5 + (homeTeamStats.plusMinus + awayTeamStats.plusMinus) / 100,
    0.42,
    0.58,
  );
  const homeTeamTotalProbability = clamp(
    0.5 + homeTeamStats.plusMinus / 60,
    0.42,
    0.6,
  );
  const awayTeamTotalProbability = clamp(
    0.5 + awayTeamStats.plusMinus / 60,
    0.42,
    0.6,
  );

  return [
    {
      market: "Moneyline",
      selection: `${homeTeam} to Win`,
      probability: winOdds.home,
      decimalOdds: homeMoneylineOdds,
      ev: Number(expectedValue(winOdds.home, homeMoneylineOdds).toFixed(2)),
    },
    {
      market: "Moneyline",
      selection: `${awayTeam} to Win`,
      probability: winOdds.away,
      decimalOdds: awayMoneylineOdds,
      ev: Number(expectedValue(winOdds.away, awayMoneylineOdds).toFixed(2)),
    },
    {
      market: "Game Total",
      selection: `Over ${gameTotalLine}`,
      probability: Number(overProbability.toFixed(3)),
      decimalOdds: 1.91,
      ev: Number(expectedValue(overProbability, 1.91).toFixed(2)),
    },
    {
      market: "Game Total",
      selection: `Under ${gameTotalLine}`,
      probability: Number((1 - overProbability).toFixed(3)),
      decimalOdds: 1.91,
      ev: Number(expectedValue(1 - overProbability, 1.91).toFixed(2)),
    },
    {
      market: "Team Total",
      selection: `${homeTeam} Over ${homeTotalLine}`,
      probability: Number(homeTeamTotalProbability.toFixed(3)),
      decimalOdds: 1.9,
      ev: Number(expectedValue(homeTeamTotalProbability, 1.9).toFixed(2)),
    },
    {
      market: "Team Total",
      selection: `${awayTeam} Over ${awayTotalLine}`,
      probability: Number(awayTeamTotalProbability.toFixed(3)),
      decimalOdds: 1.9,
      ev: Number(expectedValue(awayTeamTotalProbability, 1.9).toFixed(2)),
    },
  ];
}

function sortPlayers(players, sortBy) {
  if (sortBy === "ppg" || sortBy === "rpg" || sortBy === "apg") {
    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  }
  return [...players].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getGamesByDate(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  try {
    const payload = await runNbaScript("scoreboard", { date });
    const games = (payload.games || []).map(normalizeGameSummary);
    res.status(200).json({ data: games });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getGameDetails(req, res) {
  const { gameId } = req.params;
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));

  try {
    const scoreboardPayload = await runNbaScript("scoreboard", { date });
    const teamStatsPayload = await runNbaScript("team_stats");

    const game = (scoreboardPayload.games || []).find(
      (item) => String(item.gameId) === String(gameId),
    );
    if (!game) {
      res.status(404).json({ message: "Game not found for selected date." });
      return;
    }

    const homeTeam =
      game.homeTeam?.teamName || game.homeTeam?.teamTricode || "Home Team";
    const awayTeam =
      game.awayTeam?.teamName || game.awayTeam?.teamTricode || "Away Team";
    const homeTeamId = String(game.homeTeam?.teamId || "");
    const awayTeamId = String(game.awayTeam?.teamId || "");

    const teamStatsById = new Map(
      (teamStatsPayload.teams || []).map((team) => [String(team.id), team]),
    );
    const homeTeamStats = teamStatsById.get(homeTeamId);
    const awayTeamStats = teamStatsById.get(awayTeamId);

    if (!homeTeamStats || !awayTeamStats) {
      res
        .status(500)
        .json({ message: "Team season stats unavailable for matchup." });
      return;
    }

    const winOdds = winOddsFromSeasonStats(homeTeamStats, awayTeamStats);
    const bets = buildGameBets({
      homeTeam,
      awayTeam,
      winOdds,
      homeTeamStats,
      awayTeamStats,
    });

    res.status(200).json({
      data: {
        gameId,
        homeTeam,
        awayTeam,
        statusText: game.gameStatusText || game.gameStatus || "Scheduled",
        winOdds,
        teamStats: {
          home: {
            winPct: Number(homeTeamStats.winPct),
            pointsPerGame: Number(homeTeamStats.pointsPerGame),
            oppPointsPerGame: Number(homeTeamStats.oppPointsPerGame),
          },
          away: {
            winPct: Number(awayTeamStats.winPct),
            pointsPerGame: Number(awayTeamStats.pointsPerGame),
            oppPointsPerGame: Number(awayTeamStats.oppPointsPerGame),
          },
        },
        bets,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPlayers(req, res) {
  const page = Number(req.query.page || 1);
  const sortBy = String(req.query.sortBy || "alphabetical");

  try {
    const payload = await runNbaScript("players");
    const players = payload.players || [];

    const sorted = sortPlayers(players, sortBy);
    const start = (page - 1) * 50;
    const paginated = sorted.slice(start, start + 50);

    res.status(200).json({ data: paginated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPlayerDetails(req, res) {
  const { playerId } = req.params;

  try {
    const payload = await runNbaScript("player", { playerId });
    const fullName = payload.fullName || `Player ${playerId}`;
    const stats = payload.seasonAverages || { ppg: 0, rpg: 0, apg: 0 };

    const bets = [
      {
        market: "Player Points",
        selection: `${fullName} Over ${(stats.ppg - 0.5).toFixed(1)}`,
        probability: 0.54,
        decimalOdds: 1.9,
        ev: Number(expectedValue(0.54, 1.9).toFixed(2)),
      },
      {
        market: "Player Rebounds",
        selection: `${fullName} Over ${(stats.rpg - 0.5).toFixed(1)}`,
        probability: 0.52,
        decimalOdds: 1.9,
        ev: Number(expectedValue(0.52, 1.9).toFixed(2)),
      },
      {
        market: "Player Assists",
        selection: `${fullName} Over ${(stats.apg - 0.5).toFixed(1)}`,
        probability: 0.51,
        decimalOdds: 1.88,
        ev: Number(expectedValue(0.51, 1.88).toFixed(2)),
      },
    ];

    res.status(200).json({
      data: {
        id: playerId,
        fullName,
        ppg: Number(stats.ppg),
        rpg: Number(stats.rpg),
        apg: Number(stats.apg),
        bets,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTeams(req, res) {
  try {
    const payload = await runNbaScript("teams");
    const teams = (payload.teams || []).map((team) => ({
      id: String(team.id),
      abbreviation: team.abbreviation,
      fullName: team.fullName,
      winPct: Number(team.winPct),
    }));

    teams.sort((a, b) => a.fullName.localeCompare(b.fullName));

    res.status(200).json({ data: teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTeamDetails(req, res) {
  const { teamId } = req.params;

  try {
    const payload = await runNbaScript("team", { teamId });
    const teamName = payload.fullName || `Team ${teamId}`;
    const abbreviation = payload.abbreviation || "NBA";
    const profile = {
      winPct: Number(payload.winPct || 0),
      pointsPerGame: Number(payload.pointsPerGame || 0),
      oppPointsPerGame: Number(payload.oppPointsPerGame || 0),
      plusMinus: Number(payload.plusMinus || 0),
    };

    const bets = [
      {
        market: "Team Total Points",
        selection: `${teamName} Over ${(profile.pointsPerGame - 1.5).toFixed(1)}`,
        probability: 0.53,
        decimalOdds: 1.9,
        ev: Number(expectedValue(0.53, 1.9).toFixed(2)),
      },
      {
        market: "Team Total Points",
        selection: `${teamName} Under ${(profile.pointsPerGame + 4.5).toFixed(1)}`,
        probability: 0.49,
        decimalOdds: 1.92,
        ev: Number(expectedValue(0.49, 1.92).toFixed(2)),
      },
    ];

    res.status(200).json({
      data: {
        id: teamId,
        fullName: teamName,
        abbreviation,
        winPct: Number(profile.winPct),
        pointsPerGame: Number(profile.pointsPerGame),
        oppPointsPerGame: Number(profile.oppPointsPerGame),
        bets,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
