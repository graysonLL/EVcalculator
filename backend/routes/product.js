import express from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProducts,
} from "../controllers/product.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", editProduct);
router.delete("/:id", deleteProduct);

export default router;
