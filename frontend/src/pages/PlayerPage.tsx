import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayerDetails } from "../services/api";
import type { BetSuggestion, PlayerDetails } from "../types";

const PlayerPage = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState<PlayerDetails | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!playerId) {
        return;
      }
      const data = await getPlayerDetails(playerId);
      setPlayer(data);
    };

    void load();
  }, [playerId]);

  if (!player) {
    return <p className="text-sm text-slate-400">Loading player...</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-white">{player.fullName}</h1>
        <p className="text-sm text-slate-400">Career + season profile</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          PPG: {player.ppg.toFixed(1)}
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          RPG: {player.rpg.toFixed(1)}
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">
          APG: {player.apg.toFixed(1)}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">EV Estimate Bets</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {player.bets.map((bet: BetSuggestion) => (
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

export default PlayerPage;
