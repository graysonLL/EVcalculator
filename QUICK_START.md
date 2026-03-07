# Quick Start Guide

## 🚀 Start the Application

### Terminal 1: Backend

```bash
cd "c:\Users\liamj\OneDrive\Desktop\personal projects\EVcalculator"
npm run dev
# Output: Server started at http://localhost:5000
```

### Terminal 2: Frontend

```bash
cd "c:\Users\liamj\OneDrive\Desktop\personal projects\EVcalculator\frontend"
npm run dev
# Output: http://localhost:5173
```

Open http://localhost:5173 in browser

---

## 🧪 Test Workflow

### 1. Sign Up

- Click "Sign Up" button (top right)
- Fill in form:
  - Username: `testuser`
  - Email: `test@example.com`
  - Password: `password123`
  - Confirm: `password123`
- Click "Sign Up"
- ✅ You're logged in!

### 2. View Your Bets

- Navbar now shows "Your Bets" link (center)
- Also shows profile icon (👤) instead of Sign In/Sign Up
- Click "Your Bets"

### 3. Create a Bet

- Click "+ New Bet" button
- Fill form:
  - Bet Type: "Moneyline"
  - Amount: "100"
  - Odds: "-110"
  - Format: "American"
  - Notes: "Test bet"
- Watch EV calculate in real-time
- Click "Create Bet"
- ✅ Bet appears in list!

### 4. Test Profile

- Click profile icon (👤) → "Profile Settings"
- View account info (username, email, member since)
- Try changing username
- Try changing password
- Click "Logout"

### 5. Test Chat Bot

- Click 🤖 button (bottom right)
- Type questions like:
  - "hello"
  - "what is EV?"
  - "suggest bets"
  - "help"
- See suggested bets demo

---

## 🔧 Important Files to Know

**Backend Auth:**

- `backend/models/User.js` - User schema with password hashing
- `backend/models/Bet.js` - Bet tracking schema
- `backend/controllers/auth.js` - Signup/login/profile logic
- `backend/controllers/bets.js` - Bet CRUD with EV calculations
- `backend/middleware/auth.js` - JWT verification

**Frontend Auth:**

- `frontend/src/pages/LoginPage.tsx` - Login form
- `frontend/src/pages/SignupPage.tsx` - Signup form
- `frontend/src/pages/YourBetsPage.tsx` - Bets list + form
- `frontend/src/pages/ProfilePage.tsx` - Profile settings
- `frontend/src/services/api.ts` - API calls with token management
- `frontend/src/components/ChatBot.tsx` - Chat widget
- `frontend/src/components/Navbar.tsx` - Updated with auth UI

---

## 📌 Key Features to Test

✅ **Authentication**

- Sign up creates new account
- Login returns JWT token
- Token stored in localStorage
- Protected routes redirect to login
- Logout clears token

✅ **Bet Tracking**

- Manual bet entry with real-time EV
- American odds support (-110, +150)
- Decimal odds support (1.91, 2.50)
- Bet list persists in MongoDB
- Can edit/delete bets

✅ **Profile**

- Username change validation
- Password change with verification
- Password hashing in database

✅ **UI**

- Navb shows "Your Bets" only when logged in
- Profile dropdown with logout
- Proper redirects to login for non-auth users
- Responsive gradient design

✅ **Chatbot**

- Opens/closes with button
- Responds to questions
- Shows suggested bets
- Loading animation works

---

## 🆘 Troubleshooting

**Backend won't start?**

- Check `.env` file has `MONGO_URL`
- Ensure MongoDB is accessible
- Check port 5000 isn't in use: `netstat -ano | findstr :5000`

**Frontend build fails?**

- Delete `frontend/dist` folder
- Run `npm install` in frontend dir
- Try `npm run build` again

**MongoDB connection fails?**

- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test with MongoDB Compass

**Type errors in browser console?**

- Ensure `frontend/src/types.ts` has all interfaces
- Check `frontend/src/services/api.ts` exports functions

**Can't login after signup?**

- Check browser localStorage (DevTools → Application)
- Verify user in MongoDB: `db.users.find()`
- Check password hash: `bcryptjs.compare(password, hash)`

---

## 📊 Backend API Reference

All protected routes require header:

```
Authorization: Bearer JWT_TOKEN_HERE
```

### Auth Endpoints

**POST /api/auth/signup**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

Returns: `{ token, user }`

**POST /api/auth/login**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Returns: `{ token, user }`

**GET /api/auth/profile** (protected)
Returns: `{ _id, username, email, createdAt, lastLogin }`

**PATCH /api/auth/profile** (protected)

```json
{
  "username": "newusername",
  "newPassword": "newpass123",
  "currentPassword": "oldpass123"
}
```

Returns: `{ message, user }`

**POST /api/auth/logout** (protected)
Returns: `{ message }`

### Bet Endpoints (all protected)

**POST /api/bets**

```json
{
  "betType": "moneyline",
  "amount": 100,
  "odds": -110,
  "oddsCat": "american",
  "notes": "Optional notes"
}
```

Returns: `{ message, bet }`

**GET /api/bets**
Returns: Array of bets for user

**PATCH /api/bets/:id**

```json
{
  "status": "won",
  "notes": "Won!"
}
```

**DELETE /api/bets/:id**
Returns: `{ message }`

---

## 💾 Database

**Connect to MongoDB Atlas:**

1. Go to MongoDB Atlas dashboard
2. Click "Databases" → "Connect"
3. Choose "MongoDB Compass" or "VS Code"
4. Copy connection string
5. Replace username:password in `.env`

**View Your Data:**

```bash
# Users collection
db.users.find()

# Bets collection (all users)
db.bets.find()

# Create indexes (MongoDB Atlas does this automatically)
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
```

---

## 🎯 Next Development Steps

1. **Real AI Integration**
   - Add OpenAI API key to `.env`
   - Update ChatBot component to call backend
   - Create `/api/chat` endpoint

2. **Live Odds**
   - Integrate DraftKings/FanDuel API
   - Show real current odds
   - Auto-calculate EV vs market

3. **Analytics**
   - Bet performance tracking
   - ROI calculator
   - Win rate by bet type

4. **Mobile App**
   - React Native version
   - Push notifications for games

---

✅ **Everything is ready to use!**
