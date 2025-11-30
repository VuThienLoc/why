import express from "express";
import { createRoom, getRooms, joinChat, leaveChat, deleteRoom, updateRoom, getRoomsByCreator, getRoomsByParticipant } from "../controllers/room.controller.js";
import { createValidator } from "../../../shared/src/middleware/validate.middleware.js";
import { createRoomSchema, updateRoomSchema } from "../validators/room.validator.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
/*
  #swagger.tags = ['Room Service']
*/

const router = express.Router();

router.post("/create", createValidator(createRoomSchema), createRoom);
router.get("/all", authorizeRoles("MANAGER", "ADMIN"), getRooms);
router.get("/my", getRoomsByCreator);
router.get("/participant", getRoomsByParticipant);
router.post("/join/:roomId", joinChat);
router.post("/leave/:roomId", leaveChat);
router.put("/update/:roomId", createValidator(updateRoomSchema), updateRoom);
router.delete("/delete/:roomId", deleteRoom);

export default router;