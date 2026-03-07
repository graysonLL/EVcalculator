import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBets,
  createBet,
  isAuthenticated,
  updateBet,
  deleteBet,
} from "../services/api";
import type { Bet } from "../types";

export default function YourBetsPage() {
  const navigate = useNavigate();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [betType, setBetType] = useState<string>("moneyline");
  const [amount, setAmount] = useState("");
  const [odds, setOdds] = useState("");
  const [oddsCat, setOddsCat] = useState("american");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Edit modal state
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadBets();
  }, [navigate]);

  const loadBets = async () => {
    try {
      setLoading(true);
      const data = await getBets();
      setBets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bets");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBet = async (betId: string) => {
    if (!window.confirm("Are you sure you want to delete this bet?")) {
      return;
    }

    try {
      await deleteBet(betId);
      setBets(bets.filter((b) => b._id !== betId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bet");
    }
  };

  const handleEditClick = (bet: Bet) => {
    setEditingBet(bet);
    setEditNotes(bet.notes || "");
    setEditStatus(bet.status);
  };

  const handleUpdateBet = async () => {
    if (!editingBet) return;

    setEditLoading(true);
    try {
      const result = await updateBet(editingBet._id, {
        status: editStatus,
        notes: editNotes,
      });

      setBets(bets.map((b) => (b._id === editingBet._id ? result.bet : b)));
      setEditingBet(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bet");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmitBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!amount || !odds) {
      setFormError("Amount and odds are required");
      return;
    }

    setFormLoading(true);

    try {
      const numAmount = parseFloat(amount);
      const numOdds = parseFloat(odds);

      if (numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const result = await createBet({
        betType,
        amount: numAmount,
        odds: numOdds,
        oddsCat,
        notes,
      });

      setBets([result.bet, ...bets]);
      setShowForm(false);
      setAmount("");
      setOdds("");
      setNotes("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create bet");
    } finally {
      setFormLoading(false);
    }
  };

  const calculateEV = (
    amount: number,
    odds: number,
    oddsCat: string,
  ): number => {
    let impliedProb = 0;
    if (oddsCat === "american") {
      impliedProb =
        odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
    } else if (oddsCat === "decimal") {
      impliedProb = 1 / odds;
    }

    let potentialWin = amount;
    if (oddsCat === "american") {
      potentialWin =
        odds > 0 ? amount * (odds / 100) : amount / (Math.abs(odds) / 100);
    } else if (oddsCat === "decimal") {
      potentialWin = amount * (odds - 1);
    }

    const expectedWin = potentialWin * impliedProb;
    const expectedLoss = amount * (1 - impliedProb);
    return expectedWin - expectedLoss;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Your Bets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {showForm ? "Cancel" : "+ New Bet"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Bet
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitBet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Bet Type
                  </label>
                  <select
                    value={betType}
                    onChange={(e) => setBetType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="moneyline">Moneyline</option>
                    <option value="game_total_over">Game Total Over</option>
                    <option value="game_total_under">Game Total Under</option>
                    <option value="team_total_over">Team Total Over</option>
                    <option value="team_total_under">Team Total Under</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Odds
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={odds}
                    onChange={(e) => setOdds(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="-110"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Odds Format
                  </label>
                  <select
                    value={oddsCat}
                    onChange={(e) => setOddsCat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="american">American</option>
                    <option value="decimal">Decimal</option>
                    <option value="fractional">Fractional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Add notes about this bet..."
                  rows={3}
                />
              </div>

              {amount && odds && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Implied Probability
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(
                          (parseFloat(odds) > 0
                            ? 100 / (parseFloat(odds) + 100)
                            : Math.abs(parseFloat(odds)) /
                              (Math.abs(parseFloat(odds)) + 100)) * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Value</p>
                      <p
                        className={`text-lg font-semibold ${calculateEV(parseFloat(amount), parseFloat(odds), oddsCat) >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(
                          calculateEV(
                            parseFloat(amount),
                            parseFloat(odds),
                            oddsCat,
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {formLoading ? "Creating..." : "Create Bet"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-white">Loading bets...</div>
        ) : bets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              No bets yet. Create your first bet!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet) => (
              <div key={bet._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">
                      {bet.betType}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(bet.amount)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bet.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : bet.status === "won"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bet.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Odds</span>
                    <span className="font-semibold text-gray-900">
                      {bet.odds}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Implied Prob</span>
                    <span className="font-semibold text-gray-900">
                      {(bet.impliedProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Value</span>
                    <span
                      className={`font-semibold ${
                        bet.expectedValue >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(bet.expectedValue)}
                    </span>
                  </div>
                </div>

                {bet.notes && (
                  <p className="text-sm text-gray-600 italic mb-3">
                    {bet.notes}
                  </p>
                )}

                <p className="text-xs text-gray-500 mb-4">
                  Created {new Date(bet.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(bet)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBet(bet._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingBet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Bet
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingBet(null)}
                    className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateBet}
                    disabled={editLoading}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
