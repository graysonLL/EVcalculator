import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/product.js";
import nbaRoutes from "./routes/nba.js";
import evRoutes from "./routes/ev.js";
import authRoutes from "./routes/auth.js";
import betsRoutes from "./routes/bets.js";
import chatbotRoutes from "./routes/chatbot.js";

dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing application/json
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/nba", nbaRoutes);
app.use("/api/ev", evRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bets", betsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  if (process.env.MONGO_URL) {
    connectDB();
  }
  console.log(`Server started at http://localhost:${PORT}`);
});
