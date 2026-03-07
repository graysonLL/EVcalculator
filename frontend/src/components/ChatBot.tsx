import { useState } from "react";
import type { ChatMessage } from "../types";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your EV betting assistant. I analyze NBA games and stats to find +EV opportunities. Ask me about specific matchups or teams!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call backend AI endpoint for real NBA data analysis
      const response = await fetch(
        "http://localhost:5000/api/chatbot/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: input }),
        },
      );

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || generateFallbackResponse(input),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to local response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateFallbackResponse(input),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();

    if (
      lower.includes("suggest") ||
      lower.includes("recommend") ||
      lower.includes("best")
    ) {
      return "I can help! Try asking me about specific teams like 'Lakers vs Celtics' or 'what about Jokic tonight?' and I'll analyze the matchup and suggest +EV bets.";
    }

    if (lower.includes("ev") || lower.includes("expected value")) {
      return "Expected Value (EV) tells you if a bet is profitable long-term:\n\n+EV means odds favor you\n-EV means odds favor the book\n\nFormula: EV = (Win% × Potential) - (Loss% × Stake)\n\nI find +EV opportunities in NBA matchups using real stats!";
    }

    if (lower.includes("vs") || lower.includes("vs.")) {
      return "Great! I can analyze that matchup. What specific aspect interests you? Win probability, over/under, player props, or just give me your best +EV bet idea and I'll calculate it for you.";
    }

    if (lower.includes("how") || lower.includes("explain")) {
      return "I can help with:\n\n• Analyzing specific NBA matchups\n• Finding +EV bets\n• Explaining odds and probabilities\n• Suggesting wagers based on team stats\n• Calculating EV on your proposed bets\n\nWhat would you like?";
    }

    return "Tell me about a specific NBA game or matchup (like 'Lakers vs Celtics') and I'll analyze the teams' stats and suggest some +EV betting opportunities!";
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-96 flex flex-col mb-4 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">EV Betting Assistant</h3>
              <p className="text-xs opacity-90">NBA stats & analysis</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 whitespace-pre-wrap text-sm ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 rounded-bl-none">
                  <span className="inline-block animate-bounce">●</span>
                  <span
                    className="inline-block animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    ●
                  </span>
                  <span
                    className="inline-block animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  >
                    ●
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-300 p-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a matchup..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition ${
          isOpen
            ? "bg-gray-600 text-white"
            : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
        }`}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "💬" : "🤖"}
      </button>
    </div>
  );
}
