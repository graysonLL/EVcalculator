import express from "express";
import { analyzeBetting, suggestBets } from "../controllers/chatbot.js";

const router = express.Router();

router.post("/analyze", analyzeBetting);
router.post("/suggest", suggestBets);

export default router;
