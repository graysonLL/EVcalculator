import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams } from "../services/api";
import type { TeamListItem } from "../types";

const TeamsPage = () => {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTeams();
        setTeams(response);
      } catch {
        setError("Could not load teams from NBA API.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Teams</h1>
      {loading && <p className="text-sm text-slate-400">Loading teams...</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {!loading && !error && teams.length === 0 && (
        <p className="text-sm text-slate-400">No teams found.</p>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {teams.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="rounded-md border border-slate-800 bg-slate-900 px-4 py-3 hover:border-cyan-500/60"
          >
            <p className="font-medium text-white">{team.fullName}</p>
            <p className="text-xs text-slate-400">
              Win%: {(team.winPct * 100).toFixed(1)}%
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TeamsPage;
