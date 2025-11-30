import { Router } from "express";
import { getAllTestItems, getTestItemById } from "../controllers/testItem.controller.js";

const router = Router();

router.get("/testItem/all", getAllTestItems);

router.get("/testItem/:id", getTestItemById);

export default router;
