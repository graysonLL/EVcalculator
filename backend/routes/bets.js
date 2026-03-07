import express from "express";
import betsController from "../controllers/bets.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/", betsController.createBet);
router.get("/", betsController.getBets);
router.get("/:id", betsController.getBetById);
router.patch("/:id", betsController.updateBet);
router.delete("/:id", betsController.deleteBet);

export default router;
