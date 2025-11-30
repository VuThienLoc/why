// routes/testResult.routes.ts
import express from "express";
import {
  getTestOrdersWithResultsSummary,
  getTestResultByPatientId,
  deleteTestResult,
  updateTestResult,
  searchTestResultsPaginated,
  getTestResultByUserId
} from "../controllers/testResult.controller.js";

const router = express.Router();


router.get("/all", getTestOrdersWithResultsSummary);

router.get("/search", searchTestResultsPaginated);

router.get("/getResultsByPatientId/:id", getTestResultByPatientId);

router.get("/getResultsByUserId/:id", getTestResultByUserId);

router.put("/update/:id", updateTestResult);

router.delete("/delete/:id", deleteTestResult);


export default router;
