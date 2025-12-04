// testOrder.routes.ts
import express from "express";
import {
  getAllTestOrders,
  getTestOrderById,
  createTestOrder,
  updateTestOrder,
  softDeleteTestOrder,
  updateTestOrderStatus,
  searchTestOrders,
  getAllOrdersGroupedByUserId
} from "../controllers/testorder.controller.js";
import AuthenticateUser from "../middlewares/authenticate.middleware.js";

const router = express.Router();

//  Static routes first
router.get("/testOrder/all", getAllTestOrders);
router.get("/testOrder/search", searchTestOrders);
// router.get("/testOrder/result", controller.getListResults);
router.get("/testOrder/group-by-userId", getAllOrdersGroupedByUserId);


//  Dynamic routes after static routes
router.get("/testOrder/:id", getTestOrderById);

// CRUD
router.post("/testOrder/create", AuthenticateUser.authenticateUser, createTestOrder);
router.put("/testOrder/update/:id", AuthenticateUser.authenticateUser, updateTestOrder);
router.delete("/testOrder/delete/:id", AuthenticateUser.authenticateUser, softDeleteTestOrder);
router.put("/testOrder/:id/status", AuthenticateUser.authenticateUser, updateTestOrderStatus);

export default router;
