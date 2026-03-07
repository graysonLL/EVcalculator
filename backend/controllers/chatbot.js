import { execSync } from "child_process";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to run Python scripts
const runPython = (pythonCode) => {
  const projectRoot = path.resolve(process.cwd());
  const venvPython = path.join(
    projectRoot,
    ".venv",
    process.platform === "win32" ? "Scripts" : "bin",
    "python",
  );

  try {
    const result = execSync(`"${venvPython}" -c "${pythonCode}"`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.trim();
  } catch (error) {
    console.error("Python error:", error.message);
    return null;
  }
};

// Fetch today's NBA games with detailed stats for context
const fetchTodayGames = () => {
  const pythonCode = `
import json
from nba_api.stats.endpoints import scoreboardv3, leaguestandings
from datetime import datetime

try:
    today = datetime.now().strftime('%Y-%m-%d')
    scoreboard = scoreboardv3.ScoreboardV3(game_date=today).get_dict()
    games = scoreboard.get('scoreboard', {}).get('games', [])
    
    games_info = []
    for game in games:
        home = game.get('homeTeam', {})
        away = game.get('awayTeam', {})
        
        game_obj = {
            'away_team': away.get('teamName', 'Unknown'),
            'home_team': home.get('teamName', 'Unknown'),
            'away_score': away.get('score', 0),
            'home_score': home.get('score', 0),
            'away_wins': away.get('wins', 0),
            'away_losses': away.get('losses', 0),
            'home_wins': home.get('wins', 0),
            'home_losses': home.get('losses', 0),
            'status': game.get('gameStatus', 1)
        }
        games_info.append(game_obj)
    
    print(json.dumps(games_info))
except Exception as e:
    print(json.dumps([]))
`;

  const result = runPython(pythonCode);
  try {
    const games = JSON.parse(result || "[]");
    console.log("Fetched NBA games:", games);
    return games;
  } catch (e) {
    console.error("Error parsing NBA games:", e);
    return [];
  }
};

export const analyzeBetting = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res
        .status(400)
        .json({ message: "Query is required", response: "" });
    }

    console.log("Analyzing bet query:", query);

    // Fetch NBA games for context
    const todayGames = fetchTodayGames();
    console.log("Today's games:", todayGames);

    // Format games for Gemini context
    let gamesContext = "";
    if (todayGames && todayGames.length > 0) {
      gamesContext =
        "Today's NBA Games:\n" +
        todayGames
          .map(
            (g) =>
              `${g.away_team} (${g.away_wins}-${g.away_losses}) @ ${g.home_team} (${g.home_wins}-${g.home_losses})`,
          )
          .join("\n");
    } else {
      gamesContext = "No games found for today.";
    }

    // Build a comprehensive system prompt
    const systemPrompt = `You are an expert NBA betting analyst specializing in Expected Value (EV) calculations and profitable betting opportunities. 

${gamesContext}

Your expertise includes:
- Statistical analysis and probability
- NBA team stats, player performance trends, win-loss records
- Odds analysis and EV calculations
- Identifying +EV (profitable) vs -EV (losing) bets
- Moneyline, spread, and over/under betting

When analyzing bets:
1. Use data-driven insights from real NBA stats when available
2. Calculate or estimate EV when applicable
3. Recommend +EV bets (positive expected value)
4. Explain odds and probability clearly
5. Keep responses concise but informative
6. Reference specific team records and stats when relevant

Always explain your reasoning for any bet recommendation.`;

    console.log("System prompt created, calling Gemini...");

    // Call Gemini using the free tier model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const message = await model.generateContent(
      `${systemPrompt}\n\nUser question: ${query}`,
    );

    console.log("Gemini response received:", message);

    const analysis =
      message.response?.text?.() ||
      message.response?.text ||
      "Unable to analyze. Please try again.";

    console.log("Analysis:", analysis);

    res.json({ response: analysis });
  } catch (error) {
    console.error("Gemini error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Provide helpful error message
    let errorMsg = "I encountered an issue analyzing that. ";
    if (
      error.message?.includes("API_KEY") ||
      error.message?.includes("apiKey")
    ) {
      errorMsg += "Google API key is invalid or missing.";
    } else if (error.message?.includes("429")) {
      errorMsg += "Rate limited - please try again in a moment.";
    } else if (error.message?.includes("APIKEY")) {
      errorMsg += "Google API key not configured.";
    } else if (error.message?.includes("ERR_MODULE_NOT_FOUND")) {
      errorMsg +=
        "Missing Google AI dependency. Run: npm install @google/generative-ai";
    } else {
      errorMsg += error.message || "Unknown error occurred.";
    }

    console.error("Responding with error:", errorMsg);

    res.status(500).json({
      message: "Analysis failed",
      response: errorMsg,
    });
  }
};

export const suggestBets = async (req, res) => {
  try {
    const { gameId, homeTeam, awayTeam } = req.body;

    // Return +EV bet suggestions
    const suggestions = [
      {
        id: "1",
        betType: "moneyline",
        odds: -110,
        description: `${homeTeam} Moneyline`,
        ev: 1.5,
      },
      {
        id: "2",
        betType: "game_total_over",
        odds: -110,
        description: "Game Total Over 215.5",
        ev: 2.1,
      },
      {
        id: "3",
        betType: "game_total_under",
        odds: -110,
        description: "Game Total Under 215.5",
        ev: -0.5,
      },
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error("Suggest bets error:", error);
    res.status(500).json({ message: "Failed to suggest bets" });
  }
};
