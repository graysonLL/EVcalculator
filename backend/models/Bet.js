import mongoose from "mongoose";

const betSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    betType: {
      type: String,
      enum: [
        "moneyline",
        "game_total_over",
        "game_total_under",
        "team_total_over",
        "team_total_under",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    odds: {
      type: Number,
      required: true,
    },
    oddsCat: {
      type: String,
      enum: ["american", "decimal", "fractional"],
      default: "american",
    },
    impliedProbability: {
      type: Number,
      min: 0,
      max: 1,
    },
    expectedValue: {
      type: Number,
    },
    gameId: {
      type: String,
    },
    gameDate: {
      type: Date,
    },
    team: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    },
    acceptedFromAI: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Bet = mongoose.model("Bet", betSchema);

export default Bet;
