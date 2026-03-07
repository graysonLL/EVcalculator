import express from "express";
import { explainEv } from "../controllers/ev.js";

const router = express.Router();

router.post("/explain", explainEv);

export default router;
