import type { Request, Response } from "express";
import { PatientMedicalRecordService } from "../services/patientMedicalRecord.service.js";
import { errorHandler } from "../utils/error.util.js";
import medicalRecordMonitoringService from "../services/medicalRecordMonitoring.service.js";
import iamServiceClient, { type IamUser } from "../services/iamService.client.js";
import Patient, { type IPatient } from "../db/models/Patient.model.js";

const patientMedicalRecordService = new PatientMedicalRecordService();

const resolveAccessActor = async (
  req: Request
): Promise<{ actorId: string; actorEmail: string | null; actorName: string | null; actorAvatar: string | null }> => {
  const headerNameRaw =
    req.headers["x-user-name"] ??
    req.headers["x-operator-name"] ??
    req.headers["x-actor-name"];
  const headerName = Array.isArray(headerNameRaw) ? headerNameRaw[0] : headerNameRaw;

  const headerEmailRaw = req.headers["x-user-email"];
  const headerEmail = Array.isArray(headerEmailRaw) ? headerEmailRaw[0] : headerEmailRaw;

  const headerUserIdRaw =
    req.headers["x-user-id"] ?? req.headers["x-operator-id"] ?? req.headers["x-actor-id"];
  const headerUserId = Array.isArray(headerUserIdRaw) ? headerUserIdRaw[0] : headerUserIdRaw;
  const requestUserId = (req as any).userId;
  const resolvedUserId =
    typeof requestUserId === "string" && requestUserId.trim().length > 0
      ? requestUserId.trim()
      : typeof headerUserId === "string" && headerUserId.trim().length > 0
      ? headerUserId.trim()
      : undefined;

  let email: string | null = null;
  let name: string | null = null;
  let avatar: string | null = null;

  // 1. Try to fetch full user details from IAM if we have a User ID
  if (typeof resolvedUserId === "string" && resolvedUserId.length > 0) {
    try {
      const user = await iamServiceClient.getUserById(resolvedUserId);
      if (user) {
        email = user.email;
        name = user.fullName;
        avatar = user.avatar ?? null;
      }
    } catch (error) {
      console.warn(`[PatientMedicalRecordController] Unable to resolve user ${resolvedUserId}`, error);
    }

    if (!email && resolvedUserId.includes("@")) {
      email = resolvedUserId;
    }
  }

  // 2. Fallback to headers if IAM didn't provide data (or we didn't have an ID)
  if (!email && typeof headerEmail === "string" && headerEmail.length > 0) {
    email = headerEmail.trim();
  }

  if (!name && typeof headerName === "string" && headerName.trim().length > 0) {
    name = headerName.trim();
  } else if (!name && email) {
    name = email;
  }

  // 3. Determine Actor ID
  const actorId = resolvedUserId ?? email ?? "system";

  return {
    actorId,
    actorEmail: email,
    actorName: name ?? actorId,
    actorAvatar: avatar,
  };
};

const toPlainRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object") {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
};

const pickValues = (source: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in source) {
      result[field] = source[field];
    }
  }
  return result;
};

const diffChangedFields = (
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
  candidateFields: string[]
): { fields: string[]; previousValues: Record<string, unknown>; currentValues: Record<string, unknown> } => {
  const changed: string[] = [];

  for (const field of candidateFields) {
    const before = previous[field];
    const after = current[field];
    const beforeJson = before === undefined ? undefined : JSON.stringify(before);
    const afterJson = after === undefined ? undefined : JSON.stringify(after);
    if (beforeJson !== afterJson) {
      changed.push(field);
    }
  }

  return {
    fields: changed,
    previousValues: pickValues(previous, changed),
    currentValues: pickValues(current, changed),
  };
};

const sanitizeMedicalRecord = (
  record: Record<string, unknown> | null | undefined
): Record<string, unknown> | null => {
  if (!record) {
    return null;
  }
  const sanitized = { ...record };
  delete sanitized.__v;
  if ("patient" in sanitized) {
    delete sanitized.patient;
  }
  return sanitized;
};

const buildUserSnapshot = (user: IamUser | null | undefined): Record<string, unknown> | null => {
  if (!user) {
    return null;
  }
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    identityNumber: user.identityNumber,
    phoneNumber: user.phoneNumber ?? null,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    address: user.address ?? null,
    age: user.age,
    role: user.role,
    isActive: user.isActive,
  };
};

const buildAccessLogSnapshot = (
  medicalRecord: Record<string, unknown> | null | undefined,
  user: IamUser | null | undefined
): Record<string, unknown> | null => {
  const recordData = sanitizeMedicalRecord(medicalRecord ?? null);
  const userData = buildUserSnapshot(user);

  if (!recordData && !userData) {
    return null;
  }

  return {
    ...(recordData ? { medical_record: recordData } : {}),
    ...(userData ? { user: userData } : {}),
  };
};

const fetchPatientContext = async (
  patientId: string,
  cachedPatient?: IPatient | null
): Promise<{ patient: IPatient | null; user: IamUser | null }> => {
  if (!patientId) {
    return { patient: null, user: null };
  }

  let patient: IPatient | null | undefined = cachedPatient;
  if (!patient) {
    try {
      patient = await Patient.findOne({ _id: patientId }).lean<IPatient | null>();
    } catch (error) {
      console.warn(`[PatientMedicalRecordController] Unable to fetch patient ${patientId}`, error);
      patient = null;
    }
  }

  let user: IamUser | null = null;
  const userId = patient?.user_id;
  if (typeof userId === "string" && userId.length > 0) {
    try {
      user = await iamServiceClient.getUserById(userId);
    } catch (error) {
      console.warn(`[PatientMedicalRecordController] Unable to fetch IAM user ${userId}`, error);
    }
  }

  return {
    patient: patient ?? null,
    user,
  };
};

const toIdString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "toString" in value) {
    try {
      return (value as { toString: () => string }).toString();
    } catch (error) {
      console.warn("[PatientMedicalRecordController] Unable to stringify identifier", error);
    }
  }
  return String(value ?? "");
};

const trackableMedicalRecordFields: string[] = [
  "blood_type",
  "allergies",
  "chronic_conditions",
  "current_medications",
  "medical_history",
  "clinical_notes",
  "recent_test_summary",
  "updated_by",
];

const getPatientRecordDetail = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patient Medical Records']
    #swagger.description = 'Get a patient medical record by record code or ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', description: 'Medical record code or ID', required: true }
    #swagger.parameters['includePatient'] = {
      in: 'query',
      description: 'Include patient profile details',
      type: 'boolean',
      default: true
    }
    #swagger.responses[200] = {
      description: 'Patient medical record retrieved successfully',
      schema: {
        record: {
          _id: 'uuid',
          patient_id: 'patient-uuid',
          record_code: 'MR202510240001',
          blood_type: 'A+',
          allergies: 'Penicillin',
          chronic_conditions: 'Hypertension',
          current_medications: 'Atorvastatin',
          medical_history: 'Appendectomy - 2010',
          clinical_notes: 'Patient showing good recovery',
          created_at: '2025-10-24T11:00:00Z',
          updated_at: '2025-10-24T11:00:00Z',
          patient: {
            _id: 'patient-uuid',
            user_id: 'user-uuid',
            patient_code: 'PT202510240001'
          }
        }
      }
    }
    #swagger.responses[404] = { description: 'Patient medical record not found' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { id } = req.params;
    const { includePatient = "true" } = req.query;
    const userId = (req as any).userId;

    console.log(`\n📖 [GET RECORD DETAIL] User: ${userId}`);
    console.log(`   └─ Record ID/Code: ${id}`);
    console.log(`   └─ Include Patient: ${includePatient}`);

    if (!id) {
      console.log(`   ❌ Missing record ID/code`);
      res.status(400).json({ message: "recordCode or recordId is required" });
      return;
    }

    const record = await patientMedicalRecordService.getPatientRecordDetail(id, includePatient === "true");

    if (!record) {
      console.log(`   ❌ Record not found: ${id}`);
      res.status(404).json({ message: "Patient medical record not found" });
      return;
    }

    console.log(`   ✅ Found record: ${record.record_code} (Patient: ${record.patient_id})`);

    res.status(200).json({ record });
  } catch (error) {
    console.log(`   ⚠️  Error: ${error instanceof Error ? error.message : String(error)}`);
    errorHandler(res, error);
  }
};

const createPatientRecord = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patient Medical Records']
    #swagger.description = 'Create a patient medical record for an existing patient'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        patient_id: 'patient-uuid',
        blood_type: 'A+',
        allergies: 'Penicillin',
        chronic_conditions: 'Hypertension',
        current_medications: 'Atorvastatin',
        medical_history: 'Appendectomy - 2010',
        clinical_notes: 'Patient showing good recovery',
        recent_test_summary: 'CBC normal, HbA1c elevated'
      }
    }
    #swagger.responses[201] = {
      description: 'Medical record created successfully',
      schema: {
        record: {
          _id: 'uuid',
          patient_id: 'patient-uuid',
          record_code: 'MR202510090001',
          blood_type: 'A+',
          created_at: '2025-10-24T11:00:00Z',
          updated_at: '2025-10-24T11:00:00Z'
        }
      }
    }
    #swagger.responses[400] = { description: 'Invalid input or business rule violation' }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const { patient_id, ...payload } = req.body ?? {};
    const userId = (req as any).userId;

    console.log(`\n➕ [CREATE RECORD] User: ${userId}`);
    console.log(`   └─ Patient ID: ${patient_id}`);
    console.log(`   └─ Data: ${JSON.stringify(payload).substring(0, 100)}...`);

    if (!patient_id) {
      console.log(`   ❌ Missing patient_id`);
      res.status(400).json({ message: "patient_id is required" });
      return;
    }

    const createdBy = userId as string | undefined;
    const record = await patientMedicalRecordService.createPatientRecord(
      { patient_id, ...payload },
      createdBy
    );

    console.log(`   ✅ Record created: ${record.record_code} (ID: ${record._id})`);

    const actorContext = await resolveAccessActor(req);
    const recordId = toIdString(record._id);
    const patientIdValue = toIdString(record.patient_id);
    const { user: patientUser } = await fetchPatientContext(record.patient_id);
    const rawRecordValues = toPlainRecord(record);
    const createSnapshot = buildAccessLogSnapshot(rawRecordValues, patientUser);
    const accessLogValues = { ...rawRecordValues };
    if (createSnapshot) {
      accessLogValues.snapshot = createSnapshot;
    }
    await medicalRecordMonitoringService.recordCreated({
      medicalRecordId: recordId,
      patientId: patientIdValue,
      eventMessage: "Medical record created",
      operatorId: actorContext.actorId,
      operatorEmail: actorContext.actorEmail,
      operatorName: actorContext.actorName,
      operatorAvatar: actorContext.actorAvatar,
      oldValues: null,
      newValues: accessLogValues,
    });

    res.status(201).json({
      message: "Patient medical record created successfully",
      record,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    if (error instanceof Error && [
      "patient_id is required",
      "Patient not found",
      "Patient medical record already exists for this patient",
    ].includes(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    errorHandler(res, error);
  }
};

const getAllPatientRecords = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patient Medical Records']
    #swagger.description = 'Get all patient medical records with optional filters and patient details'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 10
    }
    #swagger.parameters['patientId'] = {
      in: 'query',
      description: 'Filter by patient ID',
      type: 'string'
    }
    #swagger.parameters['recordCode'] = {
      in: 'query',
      description: 'Filter by record code',
      type: 'string'
    }
    #swagger.parameters['includePatient'] = {
      in: 'query',
      description: 'Include patient profile details',
      type: 'boolean',
      default: true
    }
    #swagger.parameters['includeDeleted'] = {
      in: 'query',
      description: 'Include soft-deleted records',
      type: 'boolean',
      default: false
    }
    #swagger.responses[200] = {
      description: 'Patient medical records retrieved successfully',
      schema: {
        records: [{
          _id: 'uuid',
          patient_id: 'patient-uuid',
          record_code: 'MR202510090001',
          blood_type: 'A+',
          allergies: 'Penicillin',
          chronic_conditions: 'Hypertension',
          current_medications: 'Atorvastatin',
          medical_history: 'Appendectomy - 2010',
          clinical_notes: 'Patient showing good recovery',
          recent_test_summary: 'CBC normal, HbA1c elevated',
          created_at: '2025-10-24T11:00:00Z',
          updated_at: '2025-10-24T11:00:00Z',
          created_by: 'lab-user-uuid',
          updated_by: 'lab-user-uuid',
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          patient: {
            _id: 'patient-uuid',
            user_id: 'user-uuid',
            patient_code: 'PT202510240001'
          }
        }],
        total: 1,
        page: 1,
        totalPages: 1
      }
    }
    #swagger.responses[401] = { description: 'Authentication required' }
    #swagger.responses[500] = { description: 'Internal server error' }
  */
  try {
    const {
      page = "1",
      limit = "10",
      patientId,
      recordCode,
      includePatient = "true",
      includeDeleted = "false",
    } = req.query;
    const userId = (req as any).userId;

    console.log(`\n📋 [LIST RECORDS] User: ${userId}`);
    console.log(`   └─ Page: ${page}, Limit: ${limit}`);
    if (patientId) console.log(`   └─ Filter by Patient: ${patientId}`);
    if (recordCode) console.log(`   └─ Filter by Record Code: ${recordCode}`);
    console.log(`   └─ Include Patient: ${includePatient}, Include Deleted: ${includeDeleted}`);

    const filters: Record<string, unknown> = {};

    if (patientId) {
      filters.patient_id = patientId;
    }

    if (recordCode) {
      filters.record_code = { $regex: recordCode, $options: "i" };
    }

    if (includeDeleted === "true") {
      filters.is_deleted = { $in: [true, false] };
    }

    const result = await patientMedicalRecordService.getAllPatientRecords(
      filters,
      Number(page),
      Number(limit),
      includePatient === "true"
    );

    console.log(`   ✅ Found ${result.total} total records, returned ${result.records.length} records (Page ${result.page}/${result.totalPages})`);
    res.status(200).json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};

const updatePatientRecord = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patient Medical Records']
    #swagger.description = 'Update a patient medical record by record code or ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', description: 'Medical record code or ID', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        blood_type: 'O+',
        allergies: 'Penicillin',
        chronic_conditions: 'Diabetes',
        current_medications: 'Metformin',
        medical_history: 'Surgery 2020',
        clinical_notes: 'Patient stable',
        recent_test_summary: 'Normal results'
      }
    }
  */
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    console.log(`\n✏️  [UPDATE RECORD] User: ${userId}`);
    console.log(`   └─ Record ID/Code: ${id}`);
    console.log(`   └─ Updates: ${JSON.stringify(req.body).substring(0, 100)}...`);

    if (!id) {
      console.log(`   ❌ Missing record ID/code`);
      res.status(400).json({ message: "recordCode or recordId is required" });
      return;
    }

    const actorContext = await resolveAccessActor(req);
    const updates = req.body ?? {};

    const existingRecord = await patientMedicalRecordService.getPatientRecordDetail(id, false);
    if (!existingRecord) {
      console.log(`   ❌ Record not found: ${id}`);
      res.status(404).json({ message: "Patient medical record not found" });
      return;
    }

    const record = await patientMedicalRecordService.updatePatientRecord(
      id,
      updates,
      actorContext.actorId
    );

    if (!record) {
      console.log(`   ❌ Record not found: ${id}`);
      res.status(404).json({ message: "Patient medical record not found" });
      return;
    }

    console.log(`   ✅ Record updated: ${record.record_code}`);

    const existingPlain = toPlainRecord(existingRecord);
    const updatedPlain = toPlainRecord(record);
    const diff = diffChangedFields(existingPlain, updatedPlain, trackableMedicalRecordFields);
    const recordId = toIdString(record._id);
    const patientIdValue = toIdString(record.patient_id);

    if (diff.fields.length > 0) {
      const messageSuffix = diff.fields.join(", ");
      const eventMessage = messageSuffix.length > 0
        ? `Medical record updated: ${messageSuffix}`
        : "Medical record updated";

      await medicalRecordMonitoringService.recordUpdated({
        medicalRecordId: recordId,
        patientId: patientIdValue,
        eventMessage,
        operatorId: actorContext.actorId,
        operatorEmail: actorContext.actorEmail,
        operatorName: actorContext.actorName,
        operatorAvatar: actorContext.actorAvatar,
        oldValues: existingPlain,
        newValues: updatedPlain,
      });
    }

    res.status(200).json({
      message: "Patient medical record updated",
      record,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    if (error instanceof Error && error.message === "recordId is required") {
      res.status(400).json({ message: error.message });
      return;
    }

    errorHandler(res, error);
  }
};

const deletePatientRecord = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patient Medical Records']
    #swagger.description = 'Soft delete a patient medical record by record code or ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', description: 'Medical record code or ID', required: true }
  */
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    console.log(`\n🗑️  [DELETE RECORD] User: ${userId}`);
    console.log(`   └─ Record ID/Code: ${id}`);

    if (!id) {
      console.log(`   ❌ Missing record ID/code`);
      res.status(400).json({ message: "recordCode or recordId is required" });
      return;
    }

    const actorContext = await resolveAccessActor(req);
    const existingRecord = await patientMedicalRecordService.getPatientRecordDetail(id, false);
    if (!existingRecord) {
      console.log(`   ❌ Record not found: ${id}`);
      res.status(404).json({ message: "Patient medical record not found" });
      return;
    }

    const record = await patientMedicalRecordService.deletePatientRecord(id, actorContext.actorId);

    if (!record) {
      console.log(`   ❌ Record not found: ${id}`);
      res.status(404).json({ message: "Patient medical record not found" });
      return;
    }

    console.log(`   ✅ Record deleted (soft): ${record.record_code}`);

    const existingPlain = toPlainRecord(existingRecord);
    const { user: patientUser } = await fetchPatientContext(record.patient_id);
    const deleteOldSnapshot = buildAccessLogSnapshot(existingPlain, patientUser);
    
    const auditOldValues = deleteOldSnapshot ? { snapshot: deleteOldSnapshot } : null;

    const recordId = toIdString(record._id);
    const patientIdValue = toIdString(record.patient_id);

    await medicalRecordMonitoringService.recordDeleted({
      medicalRecordId: recordId,
      patientId: patientIdValue,
      eventMessage: "Medical record soft deleted",
      operatorId: actorContext.actorId,
      operatorEmail: actorContext.actorEmail,
      operatorName: actorContext.actorName,
      operatorAvatar: actorContext.actorAvatar,
      oldValues: auditOldValues,
      newValues: null,
    });

    res.status(200).json({
      message: "Patient medical record deleted",
      record,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    if (error instanceof Error && error.message === "recordId is required") {
      res.status(400).json({ message: error.message });
      return;
    }

    errorHandler(res, error);
  }
};

export { createPatientRecord, getAllPatientRecords, updatePatientRecord, deletePatientRecord, getPatientRecordDetail };
