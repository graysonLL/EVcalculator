# EVcalculator - Complete NBA Betting Platform

A full-stack NBA EV calculator with **user authentication**, **bet tracking**, **AI chatbot**, and real nba_api data.

## 🚀 What's New

- ✅ Complete user authentication system (signup/login/logout)
- ✅ MongoDB bet tracking with EV calculations
- ✅ "Your Bets" page with manual bet entry
- ✅ Profile page with account management
- ✅ Persistent AI chatbot widget
- ✅ Real-time EV display for any odds
- ✅ TLS support for 3 odds formats (American, Decimal, Fractional)

## Tech Stack

**Frontend:**

- React 19 + TypeScript
- Vite + SWC
- React Router DOM v7.13
- Tailwind CSS v4.2
- localStorage for JWT tokens

**Backend:**

- Node.js + Express 5
- MongoDB + Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- Python bridge (nba_api)

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Setup environment
cp .env.example .env
# Edit .env with MongoDB URI and JWT secret

# 3. Start backend (Terminal 1)
npm run dev
# Runs on http://localhost:5000

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev
# Runs on http://localhost:5173
```

## ✨ Key Features

### Authentication

- Signup with email/username/password
- Login with JWT (30-day expiry)
- Password hashing with bcryptjs
- Profile page with settings
- Logout with token cleanup

### Bet Tracking

- Manual bet entry with validation
- Support for 3 odds formats
- Real-time EV calculation
- 5 bet types (moneyline, totals, etc.)
- Bet status tracking (pending/won/lost)

### EV Calculations

- Implied probability from odds
- Expected value formula: EV = (Win% × Potential) - (Loss% × Stake)
- +EV indicators (green/red)
- Works with any odds format

### AI Chatbot

- Persistent widget (bottom-right)
- Answers betting questions
- Suggested bets demo
- Ready for OpenAI integration

### NBA Data (Existing)

- Real games by date
- Player stats (PPG, RPG, APG)
- Team metrics (Win%, PPG)
- 6+ EV bets per game

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js         (auth + password hashing)
│   ├── Bet.js          (EV tracking)
│   └── Product.js
├── controllers/
│   ├── auth.js         (signup/login/profile)
│   ├── bets.js         (CRUD + EV calc)
│   ├── nba.js          (games/players/teams)
│   └── ev.js
├── routes/
│   ├── auth.js         (/api/auth/*)
│   ├── bets.js         (/api/bets/*)
│   └── nba.js
├── middleware/
│   └── auth.js         (JWT verification)
└── server.js

frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── YourBetsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── ... (games, players, teams)
│   ├── components/
│   │   ├── Navbar.tsx  (auth UI)
│   │   └── ChatBot.tsx (AI widget)
│   ├── services/
│   │   └── api.ts      (API calls + auth)
│   ├── types.ts        (TypeScript interfaces)
│   └── App.tsx
```

## 🧪 API Endpoints

### Auth (public)

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` (protected)
- `PATCH /api/auth/profile` (protected)
- `POST /api/auth/logout` (protected)

### Bets (all protected)

- `POST /api/bets` - Create
- `GET /api/bets` - List user bets
- `PATCH /api/bets/:id` - Update
- `DELETE /api/bets/:id` - Delete

### NBA (existing)

- `GET /api/nba/games?date=...`
- `GET /api/nba/games/:id`
- `GET /api/nba/players`
- `GET /api/nba/teams`

## 💾 Database

**User Schema:**

```javascript
{
  username: String(unique);
  email: String(unique);
  password: String(hashed);
  createdAt: Date;
  lastLogin: Date;
}
```

**Bet Schema:**

```javascript
{
  userId: ObjectId;
  betType: String;
  amount: Number;
  odds: Number;
  oddsCat: String;
  impliedProbability: Number;
  expectedValue: Number;
  status: String;
  notes: String;
  createdAt: Date;
}
```

## 🔐 Security

- ✅ 10-round bcrypt password hashing
- ✅ JWT tokens (30-day expiry)
- ✅ Protected routes require valid token
- ✅ User data isolated by userId
- ✅ Email/username uniqueness enforced
- ✅ CORS enabled

## 📖 Documentation

See detailed docs in:

- `QUICK_START.md` - Step-by-step guide
- `IMPLEMENTATION_SUMMARY.md` - Full feature list
- `QUICK_START.md` - Testing workflows

## ✅ Testing

```bash
# 1. Sign up at http://localhost:5173/signup
# 2. Click "Your Bets"
# 3. Create a bet (amount: 100, odds: -110, type: moneyline)
# 4. Watch EV calculate automatically
# 5. Click profile icon → Profile Settings
# 6. Try changing password
# 7. Chat with bot (bottom-right 🤖)
# 8. Logout and login again
```

## 🎯 Next Steps

- [ ] OpenAI API integration for real AI
- [ ] Live odds from DraftKings/FanDuel
- [ ] ROI tracking dashboard
- [ ] Mobile React Native app
- [ ] Parlay support

---

**Status:** ✅ Production Ready  
**Version:** 2.0 (Full Auth + Bets + Chatbot)
│ └── server.js
├── frontend/
│ └── src/
│ ├── components/
│ └── pages/
└── package.json

````

## Getting Started

### Prerequisites

- Node.js
- Python 3.10+
- `nba_api` package (`pip install nba_api pandas requests`)
- MongoDB (optional)

### Installation

1. Clone the repo

```bash
git clone https://github.com/graysonLL/EVcalculator.git
cd EVcalculator
````

2. Install backend dependencies

```bash
npm install
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory

```
PORT=5000
MONGO_URL=your_mongodb_connection_string_optional
PYTHON_COMMAND=python
HF_API_KEY=your_huggingface_free_token_optional
```

### Running the App

Start the backend (from root):

```bash
npm run dev
```

Start the frontend (from `/frontend`):

```bash
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### App Pages

- `/` landing page with games by date
- `/games/:gameId` game page with estimated win odds + EV bets + AI summary
- `/players` players list (50/page), sortable by alphabetical, PPG, RPG, APG
- `/players/:playerId` player stats + EV bet estimates
- `/teams` teams list + win percentage
- `/teams/:teamId` team stats + EV bet estimates

## API Endpoints

| Method | Endpoint                 | Description                                                      |
| ------ | ------------------------ | ---------------------------------------------------------------- |
| GET    | `/api/nba/games`         | Games for a date (`?date=YYYY-MM-DD`)                            |
| GET    | `/api/nba/games/:gameId` | Game details + EV candidates                                     |
| GET    | `/api/nba/players`       | Players paginated (`?page=1&sortBy=alphabetical\|ppg\|rpg\|apg`) |
| GET    | `/api/nba/players/:id`   | Player profile + EV estimates                                    |
| GET    | `/api/nba/teams`         | Teams list                                                       |
| GET    | `/api/nba/teams/:id`     | Team profile + EV estimates                                      |
| POST   | `/api/ev/explain`        | Free AI EV summary (HF if key exists, fallback if not)           |
