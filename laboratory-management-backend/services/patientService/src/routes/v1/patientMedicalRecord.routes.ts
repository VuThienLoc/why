import express from "express";
import {
	createPatientRecord,
	deletePatientRecord,
	getAllPatientRecords,
	getPatientRecordDetail,
	updatePatientRecord,
} from "../../controllers/patientMedicalRecord.controller.js";
import authenticateUser from "../../middlewares/authenticate.middleware.js";

const router = express.Router();

// [GET] List all patient medical records with pagination and filters
router.get("/getAll/", authenticateUser.authenticateUser, getAllPatientRecords);

// [GET] View detail of a patient medical record by record code or ID
router.get("/viewDetail/:id", authenticateUser.authenticateUser, getPatientRecordDetail);

// [POST] Create a new patient medical record
router.post("/create/", authenticateUser.authenticateUser, createPatientRecord);

// [PUT] Update patient medical record by record code (or ID)
router.put("/update/:id", authenticateUser.authenticateUser, updatePatientRecord);

// [DELETE] Soft delete patient medical record by record code (or ID)
router.delete("/delete/:id", authenticateUser.authenticateUser, deletePatientRecord);

export default router;
