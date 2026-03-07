import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import GamePage from "./pages/GamePage";
import PlayersPage from "./pages/PlayersPage";
import PlayerPage from "./pages/PlayerPage";
import TeamsPage from "./pages/TeamsPage";
import TeamPage from "./pages/TeamPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import YourBetsPage from "./pages/YourBetsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/your-bets" element={<YourBetsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/games/:gameId" element={<GamePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:playerId" element={<PlayerPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamPage />} />
        </Routes>
      </main>
      <ChatBot />
    </div>
  );
}

export default App;
