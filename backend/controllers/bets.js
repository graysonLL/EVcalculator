import Bet from "../models/Bet.js";

// Helper function to calculate implied probability from odds
const calculateImpliedProbability = (odds, oddsCat = "american") => {
  if (oddsCat === "american") {
    if (odds > 0) {
      return 100 / (odds + 100);
    } else {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
  } else if (oddsCat === "decimal") {
    return 1 / odds;
  } else if (oddsCat === "fractional") {
    const parts = odds.split("/");
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return denominator / (numerator + denominator);
  }
  return 0;
};

// Helper function to calculate EV using the betting analysis formula
// This uses the precise formula from the betting guide:
// Negative odds: (abs(odds) + 100) * prob - abs(odds)
// Positive odds: (odds + 100) * prob - 100
const calculateEV = (amount, odds, probability, oddsCat = "american") => {
  let ev = 0;

  if (oddsCat === "american") {
    if (odds < 0) {
      // Negative odds formula
      // Step 1: Drop minus (already done, use abs)
      // Step 2: Add 100
      // Step 3: Multiply by probability
      // Step 4: Subtract original odds value (step 4 from screenshot = EV)
      const absOdds = Math.abs(odds);
      const step2 = absOdds + 100;
      const step3 = step2 * probability;
      const step4 = step3 - absOdds;
      // Scale to the bet amount
      // -0.8 EV on example means -0.8 * (amount / 100) for $100 bet
      ev = step4 * (amount / 100);
    } else {
      // Positive odds formula
      // Step 1: Add 100
      // Step 2: Multiply by probability
      // Step 3: Subtract 100 (step 3 from screenshot = EV per $100 wagered)
      const step1 = odds + 100;
      const step2 = step1 * probability;
      const step3 = step2 - 100;
      // Scale to the bet amount
      // 30 EV on example means 30 * (amount / 100) for $100 bet
      ev = step3 * (amount / 100);
    }
  } else if (oddsCat === "decimal") {
    // For decimal odds: EV = amount * ((odds - 1) * prob - (1 - prob))
    ev = amount * ((odds - 1) * probability - (1 - probability));
  } else if (oddsCat === "fractional") {
    // For fractional odds: convert to decimal first
    const decimalOdds = 1 + odds;
    ev = amount * ((decimalOdds - 1) * probability - (1 - probability));
  }

  return ev;
};

const createBet = async (req, res) => {
  try {
    const {
      betType,
      amount,
      odds,
      oddsCat = "american",
      gameId,
      gameDate,
      team,
      notes,
      acceptedFromAI = false,
    } = req.body;

    // Validation
    if (!betType || !amount || odds === undefined) {
      return res
        .status(400)
        .json({ message: "betType, amount, and odds are required" });
    }

    const impliedProbability = calculateImpliedProbability(odds, oddsCat);
    const expectedValue = calculateEV(
      amount,
      odds,
      impliedProbability,
      oddsCat,
    );

    const bet = new Bet({
      userId: req.userId,
      betType,
      amount,
      odds,
      oddsCat,
      impliedProbability,
      expectedValue,
      gameId,
      gameDate,
      team,
      acceptedFromAI,
      notes,
    });

    await bet.save();

    res.status(201).json({
      message: "Bet created successfully",
      bet,
    });
  } catch (error) {
    console.error("Create bet error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getBets = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(bets);
  } catch (error) {
    console.error("Get bets error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getBetById = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    if (bet.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(bet);
  } catch (error) {
    console.error("Get bet error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const updateBet = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    if (bet.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) bet.status = status;
    if (notes !== undefined) bet.notes = notes;

    await bet.save();

    res.json({
      message: "Bet updated successfully",
      bet,
    });
  } catch (error) {
    console.error("Update bet error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const deleteBet = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    if (bet.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Bet.findByIdAndDelete(req.params.id);

    res.json({ message: "Bet deleted successfully" });
  } catch (error) {
    console.error("Delete bet error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

export { createBet, getBets, getBetById, updateBet, deleteBet };
export default { createBet, getBets, getBetById, updateBet, deleteBet };
