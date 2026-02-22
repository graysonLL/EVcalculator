import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/product.js";

dotenv.config({ debug: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing application/json

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});
