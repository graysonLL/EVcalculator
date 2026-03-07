export function expectedValue(probability, decimalOdds, stake = 100) {
  const winPayout = (decimalOdds - 1) * stake;
  const loseAmount = stake;
  return probability * winPayout - (1 - probability) * loseAmount;
}

function clamp(value, min = 0.01, max = 0.99) {
  return Math.max(min, Math.min(max, value));
}

export function oddsFromProbability(probability, vig = 0.03) {
  const adjusted = clamp(probability + vig / 2);
  return Number((1 / adjusted).toFixed(2));
}

export function hashNumber(seed) {
  const text = String(seed);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function playerProfileFromSeed(seed) {
  const hash = hashNumber(seed);
  return {
    ppg: Number((8 + (hash % 240) / 10).toFixed(1)),
    rpg: Number((2 + (hash % 120) / 20).toFixed(1)),
    apg: Number((1 + (hash % 140) / 20).toFixed(1)),
  };
}

export function teamProfileFromSeed(seed) {
  const hash = hashNumber(seed);
  return {
    winPct: Number((0.3 + (hash % 350) / 1000).toFixed(3)),
    pointsPerGame: Number((104 + (hash % 220) / 10).toFixed(1)),
    oppPointsPerGame: Number((101 + (hash % 200) / 10).toFixed(1)),
  };
}
