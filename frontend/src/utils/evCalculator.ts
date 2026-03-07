/**
 * EV Calculator following the formulas from betting analysis
 *
 * Negative Odds Formula (-110):
 * 1. Drop minus sign: -110 → 110
 * 2. Add 100: 110 + 100 = 210
 * 3. Multiply by probability: 210 × prob
 * 4. Subtract odds value: result - 110
 * 5. Divide by odds: result / 110
 *
 * Positive Odds Formula (+150):
 * 1. Add 100: 150 + 100 = 250
 * 2. Multiply by probability: 250 × prob
 * 3. Subtract 100: result - 100
 * 4. Divide by 100: result / 100
 */

interface EVCalculationResult {
  ev: number;
  evPercentage: number;
  impliedProbability: number;
  potentialWin: number;
}

export function calculateImpliedProbability(
  odds: number,
  oddsFormat: "american" | "decimal" | "fractional" = "american",
): number {
  if (oddsFormat === "american") {
    if (odds > 0) {
      return 100 / (odds + 100);
    } else {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
  } else if (oddsFormat === "decimal") {
    return 1 / odds;
  } else if (oddsFormat === "fractional") {
    // Format: "1/2" means 2/(1+2) = 0.667
    const isString = typeof odds === "string";
    if (isString) {
      const parts = (odds as any).split("/");
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      return denominator / (numerator + denominator);
    }
  }
  return 0;
}

export function calculateEV(
  betAmount: number,
  odds: number,
  winProbability: number,
  oddsFormat: "american" | "decimal" | "fractional" = "american",
): EVCalculationResult {
  let ev = 0;
  let potentialWin = 0;
  const impliedProb = calculateImpliedProbability(odds, oddsFormat);

  if (oddsFormat === "american") {
    if (odds < 0) {
      // Negative odds formula
      const absOdds = Math.abs(odds);
      const step1 = absOdds + 100; // 110 + 100 = 210
      const step2 = step1 * winProbability; // 210 × 0.52 = 109.2
      const step3 = step2 - absOdds; // 109.2 - 110 = -0.8
      const step4 = step3 / absOdds; // -0.8 / 110 = -0.0073
      ev = step4 * betAmount; // EV amount in dollars

      // Potential win if correct
      potentialWin = (betAmount * odds) / Math.abs(odds);
    } else {
      // Positive odds formula
      const step1 = odds + 100; // 150 + 100 = 250
      const step2 = step1 * winProbability; // 250 × 0.52 = 130
      const step3 = step2 - 100; // 130 - 100 = 30
      const step4 = step3 / 100; // 30 / 100 = 0.30
      ev = step4 * betAmount; // EV amount in dollars

      // Potential win if correct
      potentialWin = (betAmount * odds) / 100;
    }
  } else if (oddsFormat === "decimal") {
    // For decimal odds: EV = (odds - 1) * probability - 1 * (1 - probability)
    ev = betAmount * ((odds - 1) * winProbability - 1 * (1 - winProbability));
    potentialWin = betAmount * (odds - 1);
  } else if (oddsFormat === "fractional") {
    // For fractional odds
    potentialWin = betAmount * (odds as any);
    ev =
      betAmount *
      (((odds as any) * winProbability - (1 - winProbability)) as number);
  }

  const evPercentage = (ev / betAmount) * 100;

  return {
    ev,
    evPercentage,
    impliedProbability: impliedProb,
    potentialWin,
  };
}

/**
 * Calculate EV using simplified method (what the current code uses)
 * This is kept for backwards compatibility
 */
export function calculateSimplifiedEV(
  amount: number,
  odds: number,
  oddsCat: string,
): number {
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
}

/**
 * ROI (Return on Investment) percentage
 * Useful for comparing bets of different sizes
 */
export function calculateROI(ev: number, betAmount: number): number {
  return (ev / betAmount) * 100;
}

/**
 * Breakeven probability for a given set of odds
 * The probability at which EV = 0
 */
export function calculateBreakevenProbability(
  odds: number,
  oddsFormat: "american" | "decimal" = "american",
): number {
  if (oddsFormat === "american") {
    if (odds > 0) {
      return 100 / (odds + 100);
    } else {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
  } else if (oddsFormat === "decimal") {
    return 1 / odds;
  }
  return 0;
}
