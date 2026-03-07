import express from "express";
import {
  getGameDetails,
  getGamesByDate,
  getPlayerDetails,
  getPlayers,
  getTeamDetails,
  getTeams,
} from "../controllers/nba.js";

const router = express.Router();

router.get("/games", getGamesByDate);
router.get("/games/:gameId", getGameDetails);
router.get("/players", getPlayers);
router.get("/players/:playerId", getPlayerDetails);
router.get("/teams", getTeams);
router.get("/teams/:teamId", getTeamDetails);

export default router;
