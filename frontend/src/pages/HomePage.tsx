import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getGamesByDate } from "../services/api";
import type { GameListItem } from "../types";

const HomePage = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getGamesByDate(date);
        setGames(result);
      } catch {
        setError("Could not load games for that date.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [date]);

  const emptyMessage = useMemo(() => {
    if (loading || error) {
      return null;
    }
    return games.length === 0 ? "No games found for this date." : null;
  }, [games.length, loading, error]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Games by Day</h1>
          <p className="text-sm text-slate-400">
            Click a game to see odds and EV bet suggestions.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs text-slate-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:ring sm:w-auto"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading games...</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {emptyMessage && <p className="text-sm text-slate-400">{emptyMessage}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {games.map((game) => (
          <Link
            key={game.gameId}
            to={`/games/${game.gameId}?date=${date}`}
            className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-500/60"
          >
            <p className="text-xs text-slate-400">{game.statusText}</p>
            <p className="mt-2 text-base font-semibold">
              {game.awayTeam} <span className="text-slate-500">@</span>{" "}
              {game.homeTeam}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
