import { Router } from "express";
import { startChat, continueChat } from "../controllers/chat.controller.js";

const router = Router();

router.post('/', startChat);
router.post('/:threadId', continueChat);

export default router;
