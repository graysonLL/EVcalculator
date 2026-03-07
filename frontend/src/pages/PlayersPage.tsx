import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlayers } from "../services/api";
import type { PlayerListItem } from "../types";

const PlayersPage = () => {
  const [players, setPlayers] = useState<PlayerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"alphabetical" | "ppg" | "rpg" | "apg">(
    "alphabetical",
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPlayers(page, sortBy);
        setPlayers(response);
      } catch {
        setError("Could not load players from NBA API.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, sortBy]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Players</h1>
        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value as "alphabetical" | "ppg" | "rpg" | "apg",
            )
          }
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="ppg">PPG</option>
          <option value="rpg">RPG</option>
          <option value="apg">APG</option>
        </select>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading players...</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {!loading && !error && players.length === 0 && (
        <p className="text-sm text-slate-400">No players found.</p>
      )}

      <div className="grid gap-2">
        {players.map((player) => (
          <Link
            key={player.id}
            to={`/players/${player.id}`}
            className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 hover:border-cyan-500/60"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-white">{player.fullName}</p>
              <p className="text-xs text-slate-400">
                PPG {player.ppg.toFixed(1)} | RPG {player.rpg.toFixed(1)} | APG{" "}
                {player.apg.toFixed(1)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded bg-slate-800 px-3 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <p className="text-sm text-slate-300">Page {page}</p>
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          className="rounded bg-slate-800 px-3 py-2 text-sm"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default PlayersPage;
