import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { isAuthenticated, logout } from "../services/api";

const Navbar = () => {
  const [isAuthenticated_, setIsAuthenticated] = useState(isAuthenticated());
  const [profileOpen, setProfileOpen] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isAuthenticated());
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setProfileOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-semibold tracking-wide text-cyan-300"
        >
          EV Hoops
        </Link>

        <nav className="flex items-center gap-3 text-sm flex-1 justify-center">
          <NavLink
            to="/players"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            Players
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            Teams
          </NavLink>
          {isAuthenticated_ && (
            <NavLink
              to="/your-bets"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Your Bets
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated_ ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-semibold hover:opacity-90 transition"
              >
                👤
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-t-lg transition"
                  >
                    Profile Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-b-lg transition border-t border-slate-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 transition"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-md px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
