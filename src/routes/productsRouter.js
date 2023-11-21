import express, { Router } from "express";
import { getAll, addProduct, getById, updateProduct, deleteProduct } from "../controllers/products.controller.js"

const router = Router();

router.use(express.json());

router.get("/", getAll);
router.get("/:pid", getById);
router.post("/", addProduct);
router.put("/:pid", updateProduct);
router.delete("/:pid", deleteProduct);

export default router;