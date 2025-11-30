import express from "express";
import patientRoutes from "./v1/patient.routes.js";
import patientMedicalRecordRoutes from "./v1/patientMedicalRecord.routes.js";

const router = express.Router();

router.use("/patients", patientRoutes);
router.use("/patient-medical-records", patientMedicalRecordRoutes);

export default router;
