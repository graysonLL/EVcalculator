function buildFallbackSummary(payload) {
  const bestBet = [...payload.bets].sort((a, b) => b.ev - a.ev)[0];
  if (!bestBet) {
    return "No bets were provided for analysis.";
  }

  return `Best value currently looks like ${bestBet.selection} in ${bestBet.market} with EV ${bestBet.ev.toFixed(2)}. Manage stake size and avoid overexposing correlated picks.`;
}

async function summarizeWithHuggingFace(payload) {
  if (!process.env.HF_API_KEY) {
    return null;
  }

  const prompt = `You are a concise NBA betting EV analyst. Game: ${payload.gameLabel}. Home win prob ${Math.round(
    payload.odds.home * 100,
  )}% and away win prob ${Math.round(payload.odds.away * 100)}%. Bets: ${JSON.stringify(
    payload.bets,
  )}. Write 3 short sentences: best bet, why EV is positive, and risk warning.`;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/flan-t5-base",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (Array.isArray(data) && data[0]?.generated_text) {
    return String(data[0].generated_text).trim();
  }

  if (typeof data?.generated_text === "string") {
    return data.generated_text.trim();
  }

  return null;
}

export async function explainEv(req, res) {
  const payload = req.body;

  if (!payload?.gameLabel || !Array.isArray(payload.bets)) {
    res.status(400).json({ message: "Invalid request payload" });
    return;
  }

  try {
    const aiSummary = await summarizeWithHuggingFace(payload);
    const summary = aiSummary || buildFallbackSummary(payload);

    res.status(200).json({ summary });
  } catch {
    res.status(200).json({ summary: buildFallbackSummary(payload) });
  }
}
