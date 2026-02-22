# EVcalculator

A full-stack product management app built with a React (Vite + TypeScript) frontend and an Express + MongoDB backend.

## Tech Stack

**Frontend**

- React 19 + TypeScript (SWC)
- Vite
- React Router DOM

**Backend**

- Node.js + Express 5
- MongoDB + Mongoose
- dotenv

## Project Structure

```
EVcalculator/
├── backend/
│   ├── config/        # Database connection
│   ├── controllers/   # Route logic
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       └── pages/
└── package.json
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB (local or Atlas)

### Installation

1. Clone the repo

```bash
git clone https://github.com/graysonLL/EVcalculator.git
cd EVcalculator
```

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
MONGO_URI=your_mongodb_connection_string
PORT=5000
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

## API Endpoints

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/api/products`     | Get all products |
| POST   | `/api/products`     | Create a product |
| PUT    | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
