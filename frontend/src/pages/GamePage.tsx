import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getGameDetails, getGameInsight } from "../services/api";
import type { BetSuggestion, GameDetails } from "../types";

const BetCard = ({ bet }: { bet: BetSuggestion }) => (
  <article className="rounded-md border border-slate-800 bg-slate-900 p-3">
    <p className="text-sm font-semibold text-white">{bet.market}</p>
    <p className="mt-1 text-xs text-slate-400">{bet.selection}</p>
    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
      <p className="rounded bg-slate-800 px-2 py-1">
        Prob: {(bet.probability * 100).toFixed(1)}%
      </p>
      <p className="rounded bg-slate-800 px-2 py-1">
        Odds: {bet.decimalOdds.toFixed(2)}
      </p>
      <p
        className={`rounded px-2 py-1 ${bet.ev >= 0 ? "bg-emerald-700/40" : "bg-rose-700/30"}`}
      >
        EV: {bet.ev.toFixed(2)}
      </p>
    </div>
  </article>
);

const GamePage = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string>("");

  const selectedDate = searchParams.get("date") || undefined;

  useEffect(() => {
    const load = async () => {
      if (!gameId) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getGameDetails(gameId, selectedDate);
        setGame(data);
      } catch {
        setError("Could not load game details.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [gameId, selectedDate]);

  const fetchInsight = async () => {
    if (!game) {
      return;
    }
    const response = await getGameInsight({
      gameLabel: `${game.awayTeam} @ ${game.homeTeam}`,
      odds: game.winOdds,
      bets: game.bets.slice(0, 6),
    });
    setInsight(response.summary);
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading game page...</p>;
  }

  if (error || !game) {
    return (
      <p className="text-sm text-rose-300">{error ?? "Game not found."}</p>
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {game.awayTeam} @ {game.homeTeam}
        </h1>
        <p className="text-sm text-slate-400">{game.statusText}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-sm font-semibold text-cyan-300">
            Win Odds (Estimated)
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded bg-slate-800 px-3 py-2">
              <span>{game.awayTeam}</span>
              <span>{(game.winOdds.away * 100).toFixed(1)}%</span>
            </li>
            <li className="flex items-center justify-between rounded bg-slate-800 px-3 py-2">
              <span>{game.homeTeam}</span>
              <span>{(game.winOdds.home * 100).toFixed(1)}%</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-cyan-300">
              AI EV Summary
            </h2>
            <button
              type="button"
              onClick={fetchInsight}
              className="rounded bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500"
            >
              Generate
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-200">
            {insight || "Generate a quick free AI write-up."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-sm font-semibold text-cyan-300">
            {game.homeTeam} Season
          </h2>
          <p className="mt-2 text-sm">
            Win%: {(game.teamStats.home.winPct * 100).toFixed(1)}%
          </p>
          <p className="text-sm">
            PPG: {game.teamStats.home.pointsPerGame.toFixed(1)}
          </p>
          <p className="text-sm">
            Opp PPG: {game.teamStats.home.oppPointsPerGame.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-sm font-semibold text-cyan-300">
            {game.awayTeam} Season
          </h2>
          <p className="mt-2 text-sm">
            Win%: {(game.teamStats.away.winPct * 100).toFixed(1)}%
          </p>
          <p className="text-sm">
            PPG: {game.teamStats.away.pointsPerGame.toFixed(1)}
          </p>
          <p className="text-sm">
            Opp PPG: {game.teamStats.away.oppPointsPerGame.toFixed(1)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Potential EV Bets
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {game.bets.map((bet: BetSuggestion) => (
            <BetCard key={`${bet.market}-${bet.selection}`} bet={bet} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamePage;
