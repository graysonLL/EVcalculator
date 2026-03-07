import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeamDetails } from "../services/api";
import type { BetSuggestion, TeamDetails } from "../types";

const TeamPage = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState<TeamDetails | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!teamId) {
        return;
      }
      const response = await getTeamDetails(teamId);
      setTeam(response);
    };

    void load();
  }, [teamId]);

  if (!team) {
    return <p className="text-sm text-slate-400">Loading team...</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-white">{team.fullName}</h1>
        <p className="text-sm text-slate-400">{team.abbreviation}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          Win%: {(team.winPct * 100).toFixed(1)}%
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          PPG: {team.pointsPerGame.toFixed(1)}
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          Opp PPG: {team.oppPointsPerGame.toFixed(1)}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">EV Bets</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {team.bets.map((bet: BetSuggestion) => (
            <article
              key={`${bet.market}-${bet.selection}`}
              className="rounded border border-slate-800 bg-slate-900 p-3 text-sm"
            >
              <p className="font-semibold">{bet.market}</p>
              <p className="text-slate-300">{bet.selection}</p>
              <p className={bet.ev >= 0 ? "text-emerald-300" : "text-rose-300"}>
                EV: {bet.ev.toFixed(2)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPage;
