import type { Request, Response } from "express";
import { PatientService, type CreatePatientPayload } from "../services/patient.service.js";
import { errorHandler } from "../utils/error.util.js";
import iamServiceClient, { type IamUser } from "../services/iamService.client.js";
import patientMonitoringService from "../services/patientMonitoring.service.js";

const patientService = new PatientService();

const fetchIamUser = async (userId: string | null | undefined): Promise<IamUser | null> => {
  if (!userId || typeof userId !== "string") {
    return null;
  }
  try {
    return await iamServiceClient.getUserById(userId);
  } catch (error) {
    console.warn(`[PatientController] Unable to resolve IAM user ${userId}`, error);
  }
  return null;
};

const fetchUserEmail = async (userId: string | null | undefined): Promise<string | null> => {
  const user = await fetchIamUser(userId);
  return user?.email ?? null;
};

const fetchUserName = async (userId: string | null | undefined): Promise<string | null> => {
  const user = await fetchIamUser(userId);
  if (!user) {
    return null;
  }
  if (typeof user.fullName === "string" && user.fullName.trim().length > 0) {
    return user.fullName.trim();
  }
  if (typeof user.email === "string" && user.email.trim().length > 0) {
    return user.email.trim();
  }
  return null;
};

const resolvePerformedBy = async (req: Request, fallback?: string): Promise<string> => {
  const headerEmailSources = ["x-user-email", "x-operator-email", "x-actor-email"] as const;
  for (const headerKey of headerEmailSources) {
    const rawValue = req.headers[headerKey];
    const headerEmail = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof headerEmail === "string" && headerEmail.trim().length > 0) {
      const normalized = headerEmail.trim();
      (req as any).userEmail = normalized;
      return normalized;
    }
  }

  const cachedEmail = (req as any).userEmail;
  if (typeof cachedEmail === "string" && cachedEmail.trim().length > 0) {
    return cachedEmail.trim();
  }

  const headerUserIdSources = ["x-user-id", "x-operator-id", "x-actor-id"] as const;
  for (const headerKey of headerUserIdSources) {
    const rawValue = req.headers[headerKey];
    const headerUserId = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof headerUserId === "string" && headerUserId.trim().length > 0) {
      const email = await fetchUserEmail(headerUserId.trim());
      if (email) {
        (req as any).userEmail = email;
        return email;
      }
      continue;
    }
  }

  const userId = (req as any).userId;
  if (typeof userId === "string" && userId.trim().length > 0) {
    const email = await fetchUserEmail(userId.trim());
    if (email) {
      (req as any).userEmail = email;
      return email;
    }
  }

  if (fallback) {
    if (fallback.includes("@")) {
      return fallback;
    }
    if (fallback === "system") {
      return fallback;
    }
    const fallbackEmail = await fetchUserEmail(fallback);
    if (fallbackEmail) {
      return fallbackEmail;
    }
    return fallback;
  }

  return "system";
};

const resolveOperatorId = (req: Request, fallback?: string): string | undefined => {
  const headerUserIdRaw = req.headers["x-user-id"] ?? req.headers["x-operator-id"] ?? req.headers["x-actor-id"];
  const headerUserId = Array.isArray(headerUserIdRaw) ? headerUserIdRaw[0] : headerUserIdRaw;
  const requestUserId = (req as any).userId;

  if (typeof requestUserId === "string" && requestUserId.trim().length > 0) {
    return requestUserId.trim();
  }

  if (typeof headerUserId === "string" && headerUserId.trim().length > 0) {
    return headerUserId.trim();
  }

  if (typeof fallback === "string" && fallback.trim().length > 0) {
    return fallback.trim();
  }

  return undefined;
};

const resolveOperatorName = async (
  req: Request,
  operatorId: string | undefined,
  fallbackName?: string
): Promise<string | null> => {
  const headerNameSources = ["x-user-name", "x-operator-name", "x-actor-name"] as const;
  for (const headerKey of headerNameSources) {
    const rawValue = req.headers[headerKey];
    const headerName = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof headerName === "string" && headerName.trim().length > 0) {
      return headerName.trim();
    }
  }

  const cachedName = (req as any).userFullName;
  if (typeof cachedName === "string" && cachedName.trim().length > 0) {
    return cachedName.trim();
  }

  if (operatorId) {
  const iamUser = await fetchIamUser(operatorId);
    if (iamUser?.fullName) {
      (req as any).userFullName = iamUser.fullName;
      return iamUser.fullName;
    }
  }

  if (fallbackName) {
    return fallbackName;
  }

  return null;
};

const fetchUserAvatar = async (userId: string | null | undefined): Promise<string | null> => {
  if (!userId || typeof userId !== "string") {
    return null;
  }
  try {
    const user = await iamServiceClient.getUserById(userId);
    if (user?.avatar) {
      return user.avatar;
    }
  } catch (error) {
    console.warn(`[PatientController] Unable to resolve avatar for user ${userId}`, error);
  }
  return null;
};

const resolveOperatorAvatar = async (
  req: Request,
  operatorId: string | undefined
): Promise<string | null> => {
  if (operatorId) {
    const resolved = await fetchUserAvatar(operatorId);
    if (resolved) {
      return resolved;
    }
  }
  return null;
};

const extractChangedFields = (payload: Record<string, unknown> | null | undefined): string[] => {
  if (!payload) {
    return [];
  }
  return Object.keys(payload).filter((key) => key !== "__v");
};

const pickFields = (
  source: Record<string, unknown> | null | undefined,
  fields: string[]
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (!source) {
    return result;
  }
  for (const field of fields) {
    if (field in source) {
      result[field] = source[field];
    }
  }
  return result;
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

const buildPatientSnapshot = (
  user: IamUser | null | undefined,
  patientRecord?: Record<string, unknown> | null
): Record<string, unknown> | null => {
  const snapshot: Record<string, unknown> = {};

  if (patientRecord) {
    const pickValue = (key: string): unknown => (key in patientRecord ? patientRecord[key] : undefined);

    snapshot.patient = {
      id: (pickValue("_id") as string | undefined) ?? null,
      userId: (pickValue("user_id") as string | undefined) ?? null,
      code: (pickValue("patient_code") as string | undefined) ?? null,
      isActive: (pickValue("is_active") as boolean | undefined) ?? null,
      isDeleted: (pickValue("is_deleted") as boolean | undefined) ?? null,
      createdAt: pickValue("created_at") ?? null,
      updatedAt: pickValue("updated_at") ?? null,
      deletedAt: pickValue("deleted_at") ?? null,
      lastVisitDate: pickValue("last_visit_date") ?? null,
      lastTestType: pickValue("last_test_type") ?? null,
      emergencyContact: pickValue("emergency_contact") ?? null,
    };
  }

  const userData = buildUserSnapshot(user);
  if (userData) {
    snapshot.user = userData;
  }

  return Object.keys(snapshot).length > 0 ? snapshot : null;
};

const getDifferences = (oldData: any, newData: any) => {
  const oldDiff: any = {};
  const newDiff: any = {};

  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

  for (const key of allKeys) {
    // Bỏ qua các trường metadata thường xuyên thay đổi hoặc không quan trọng
    if (['updated_at', 'updated_by', '__v'].includes(key)) continue;

    const oldVal = oldData?.[key];
    const newVal = newData?.[key];

    // So sánh deep bằng JSON.stringify
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      oldDiff[key] = oldVal;
      newDiff[key] = newVal;
    }
  }
  return { oldDiff, newDiff };
};

const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Get all patients with pagination, search and filters'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
    #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10 }
    #swagger.parameters['search'] = { in: 'query', type: 'string' }
    #swagger.parameters['isActive'] = { in: 'query', type: 'boolean' }
    #swagger.parameters['populateUser'] = { in: 'query', type: 'boolean', default: true }
  */
  try {
    const { page = "1", limit = "10", search, isActive, populateUser = "true" } = req.query;
    const userId = (req as any).userId; 
    if (search) console.log(`   └─ Search: ${search}`);
    if (isActive) console.log(`   └─ Filter Active: ${isActive}`);
    console.log(`   └─ Include User: ${populateUser}`);
    
    const filters: Record<string, unknown> = {};
    if (typeof search === "string" && search.trim().length > 0) {
      const trimmedSearch = search.trim();
      const regex = { $regex: trimmedSearch, $options: "i" };
      const orFilters: Record<string, unknown>[] = [
        { patient_code: regex },
        { user_id: regex },
      ];

      try {
        const matchedUsers = await iamServiceClient.searchUsersByFullName(trimmedSearch);
        const matchedUserIds = matchedUsers.map((user) => user._id).filter(Boolean);
        if (matchedUserIds.length > 0) {
          orFilters.push({ user_id: { $in: matchedUserIds } });
        }
      } catch (userSearchError) {
        console.warn('[PatientController] Unable to search users by full name:', userSearchError);
      }

      filters.$or = orFilters;
    }
    if (typeof isActive === "string") {
      filters.is_active = isActive.toLowerCase() === "true";
    }
    const shouldPopulateUser = typeof populateUser === "string" ? populateUser.toLowerCase() === "true" : true;
    const result = await patientService.getAllPatients(
      filters,
      Number(page),
      Number(limit),
      shouldPopulateUser
    );
    res.status(200).json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};

const getPatientById = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Get a single patient by ID'
    #swagger.security = [{"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', type: 'string', required: true }
    #swagger.parameters['populateUser'] = { in: 'query', type: 'boolean', default: true }
  */
  try {
    const { id } = req.params;
    const { populateUser = "true" } = req.query;
    const userId = (req as any).userId;
    if (!id) {
      console.log(`   ❌ Missing patient ID`);
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }

  const includeUser = typeof populateUser === "string" ? populateUser.toLowerCase() === "true" : true;
  const patient = await patientService.getPatientById(id, includeUser);

    if (!patient) {
      console.log(`   ❌ Patient not found: ${id}`);
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    console.log(`   ✅ Found patient: ${patient.patient_code} (User: ${patient.user_id})`);
    res.status(200).json({
      patient,
      ...(includeUser ? { user: (patient as any).user ?? null } : {}),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};

const createPatient = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Create a new patient profile for an existing IAM user'
    #swagger.security = [{"internalApiKey": []}, {"apiKeyAuth": []}]
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          example: {
            user_id: '661fd5f2eecf99292a1a1c1b',
            emergency_contact: {
              name: 'John Doe',
              phone: '+84-912345678'
            }
          }
        }
      }
  */
  try {
    // Nếu body là string (PowerShell hoặc client gửi sai), parse lại
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
        console.log("   [DEBUG] Parsed body from string:", body);
      } catch (err) {
        console.log("   [ERROR] Cannot parse body string:", err);
      }
    }
    // Nếu body có thuộc tính example (gửi từ Swagger UI), lấy từ example
    if (body && typeof body === 'object' && body.example) {
      body = body.example;
    }
    let { user_id, emergency_contact } = (body ?? {}) as any;
    const userId = (req as any).userId;
    // Fallback: accept user_id from query string or JWT when body missing
    if (!user_id) {
      user_id = (typeof req.query.user_id === 'string' ? req.query.user_id : undefined) || userId;
      if (user_id) {
        console.log(`   [DEBUG] Using fallback user_id: ${user_id}`);
      }
    }
    if (!user_id) {
      console.log(`   ❌ Missing user_id`);
      res.status(400).json({ message: "user_id is required" });
      return;
    }
    const existingPatient = await patientService.getPatientByUserId(user_id);
    if (existingPatient) {
      console.log(`   ℹ️  Patient already exists: ${existingPatient.patient_code}`);
      res.status(200).json({ message: "Patient already exists", patient: existingPatient });
      return;
    }

  const fallbackActor = typeof user_id === "string" && user_id.length > 0 ? user_id : undefined;
  const operatorIdForMonitoring = resolveOperatorId(req, fallbackActor);
  const actorEmail = await resolvePerformedBy(req, operatorIdForMonitoring ?? fallbackActor ?? "system");
  const operatorAvatar = await resolveOperatorAvatar(req, operatorIdForMonitoring);

    const patient = await patientService.createPatient({
      user_id,
      emergency_contact: emergency_contact ?? { name: "", phone: "" },
      is_active: true,
      created_by: actorEmail,
    });
    console.log(`   ✅ Patient created: ${patient.patient_code} (ID: ${patient._id})`);

    const iamUserSnapshot = typeof user_id === "string" ? await iamServiceClient.getUserById(user_id) : null;
    const patientRecord = patient as unknown as Record<string, unknown>;
    const createSnapshot = buildPatientSnapshot(iamUserSnapshot, patientRecord);
    const newValues: Record<string, unknown> | null = createSnapshot ? { snapshot: createSnapshot } : null;

    await patientMonitoringService.recordPatientCreated({
      patientId: `${patient._id}`,
      eventMessage: "Patient record created",
      oldValues: null,
      newValues,
      operatorEmail: actorEmail,
      operatorId: operatorIdForMonitoring ?? null,
      operatorName: await resolveOperatorName(
        req,
        operatorIdForMonitoring ?? undefined,
        iamUserSnapshot?.fullName ?? undefined
      ),
      operatorAvatar,
    });

    res.status(201).json({ message: "Patient created", patient });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};



const updatePatient = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Update patient details'
    #swagger.security = [{"internalApiKey": []}, {"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', type: 'string', required: false }
    #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: '',
            emergency_contact: {
              name: '',
              phone: ''
            },
            last_test_type: '',
            is_active: true
        }
      }
  */
  try {
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const idFromParams = req.params?.id;
    const idFromBody = typeof payload.id === "string" ? payload.id : undefined;
    const id = idFromParams || idFromBody;
    const userId = (req as any).userId;
    if (!id) {
      console.log(`   ❌ Missing patient ID`);
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }

    const existingPatient = await patientService.getPatientById(id);
    if (!existingPatient) {
      console.log(`   ❌ Patient not found: ${id}`);
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const iamUserSnapshot = existingPatient.user_id
      ? await iamServiceClient.getUserById(existingPatient.user_id)
      : null;

    const updateData: Partial<CreatePatientPayload> = {};
    if (idFromBody) {
      delete (payload as Record<string, unknown>).id;
    }
    if (typeof payload.emergency_contact === "object" && payload.emergency_contact !== null) {
      updateData.emergency_contact = payload.emergency_contact as CreatePatientPayload["emergency_contact"];
    }
    if (typeof payload.last_visit_date !== "undefined") {
      const dateValue = new Date(payload.last_visit_date as string | number | Date);
      if (!Number.isNaN(dateValue.getTime())) {
        updateData.last_visit_date = dateValue;
      }
    }
    if (typeof payload.last_test_type === "string") {
      updateData.last_test_type = payload.last_test_type;
    }
    if (typeof payload.is_active !== "undefined") {
      if (typeof payload.is_active === "string") {
        updateData.is_active = payload.is_active.toLowerCase() === "true";
      } else if (typeof payload.is_active === "boolean") {
        updateData.is_active = payload.is_active;
      }
    }
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update" });
      return;
    }
    const updatedPatient = await patientService.updatePatient(id, updateData);
    if (!updatedPatient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const fallbackOperatorId = typeof existingPatient.user_id === "string" ? existingPatient.user_id : undefined;
    const fallbackActor = (() => {
      const createdBy = existingPatient.created_by;
      if (typeof createdBy === "string" && createdBy.length > 0 && createdBy !== "system") {
        return createdBy;
      }
      return fallbackOperatorId;
    })();

    const operatorIdForMonitoring = resolveOperatorId(req, fallbackOperatorId);

    const actorEmail = await resolvePerformedBy(
      req,
      operatorIdForMonitoring ?? fallbackActor ?? "system"
    );
    const operatorAvatar = await resolveOperatorAvatar(req, operatorIdForMonitoring);

    const existingRecord = existingPatient as unknown as Record<string, unknown>;
    const updatedRecord = updatedPatient as unknown as Record<string, unknown>;

    const { oldDiff, newDiff } = getDifferences(existingRecord, updatedRecord);

    if (Object.keys(oldDiff).length > 0 || Object.keys(newDiff).length > 0) {
      await patientMonitoringService.recordPatientUpdated({
        patientId: `${updatedPatient._id}`,
        eventMessage: `Patient record updated (${Object.keys(newDiff).join(", ")})`,
        oldValues: oldDiff,
        newValues: newDiff,
        operatorEmail: actorEmail,
        operatorId: operatorIdForMonitoring ?? fallbackOperatorId ?? null,
        operatorName: await resolveOperatorName(
          req,
          operatorIdForMonitoring ?? fallbackOperatorId,
          iamUserSnapshot?.fullName ?? undefined
        ),
        operatorAvatar,
      });
    }

    console.log(`   ✅ Patient updated: ${updatedPatient.patient_code}`);
    res.status(200).json({ message: "Patient updated", patient: updatedPatient });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};



const deletePatient = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Delete a patient (soft delete by default)'
    #swagger.security = [{"internalApiKey": []}, {"apiKeyAuth": []}]
    #swagger.parameters['id'] = { in: 'path', type: 'string', required: true }
    #swagger.parameters['hard'] = { in: 'query', type: 'boolean', default: false }
  */
  try {
  const { id } = req.params;
  const { hard = "false" } = req.query;
    if (!id) {
      console.log(`   ❌ Missing patient ID`);
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }
    const shouldHardDelete = typeof hard === "string" ? hard.toLowerCase() === "true" : false;
    const existingPatient = await patientService.getPatientById(id);

    if (!existingPatient) {
      console.log(`   ❌ Patient not found: ${id}`);
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const iamUserSnapshot = existingPatient.user_id
      ? await iamServiceClient.getUserById(existingPatient.user_id)
      : null;

    const fallbackOperatorId = typeof existingPatient.user_id === "string" ? existingPatient.user_id : undefined;
    const fallbackActor = (() => {
      const createdBy = existingPatient.created_by;
      if (typeof createdBy === "string" && createdBy.length > 0 && createdBy !== "system") {
        return createdBy;
      }
      return fallbackOperatorId;
    })();

    const operatorIdForMonitoring = resolveOperatorId(req, fallbackOperatorId);
    const actorEmail = await resolvePerformedBy(req, operatorIdForMonitoring ?? fallbackActor ?? "system");
    const operatorAvatar = await resolveOperatorAvatar(req, operatorIdForMonitoring);

    const existingRecord = existingPatient as unknown as Record<string, unknown>;
  const existingSnapshot = buildPatientSnapshot(iamUserSnapshot, existingRecord);

    if (shouldHardDelete) {
      const deleted = await patientService.hardDeletePatient(id);
      if (!deleted) {
        res.status(404).json({ message: "Patient not found" });
        return;
      }

      const hardDeleteOldValues = existingSnapshot ? { snapshot: existingSnapshot } : null;

      await patientMonitoringService.recordPatientDeleted({
        patientId: `${existingPatient._id}`,
        eventMessage: "Patient record hard deleted",
        oldValues: hardDeleteOldValues,
        newValues: null,
        operatorEmail: actorEmail,
        operatorId: operatorIdForMonitoring ?? fallbackOperatorId ?? null,
        operatorName: await resolveOperatorName(
          req,
          operatorIdForMonitoring ?? fallbackOperatorId,
          iamUserSnapshot?.fullName ?? undefined
        ),
        operatorAvatar,
      });

      console.log(`   ✅ Patient permanently deleted (hard delete): ${id}`);
      res.status(200).json({ message: "Patient permanently deleted" });
      return;
    }
    const patient = await patientService.softDeletePatient(id);
    if (!patient) {
      console.log(`   ❌ Patient not found: ${id}`);
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    const updatedRecord = patient as unknown as Record<string, unknown>;
    const softDeleteOldValues = existingSnapshot ? { snapshot: existingSnapshot } : null;

    await patientMonitoringService.recordPatientDeleted({
      patientId: `${patient._id}`,
      eventMessage: "Patient record soft deleted",
      oldValues: softDeleteOldValues,
      newValues: null,
      operatorEmail: actorEmail,
      operatorId: operatorIdForMonitoring ?? fallbackOperatorId ?? null,
      operatorName: await resolveOperatorName(
        req,
        operatorIdForMonitoring ?? fallbackOperatorId,
        iamUserSnapshot?.fullName ?? undefined
      ),
      operatorAvatar,
    });

    console.log(`   ✅ Patient soft deleted: ${patient.patient_code}`);
    res.status(200).json({ message: "Patient deleted", patient });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};

const softDeletePatientByUserId = async (req: Request, res: Response): Promise<void> => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Patients']
    #swagger.description = 'Soft delete patient by user ID (Internal API only)'
    #swagger.security = [{"internalApiKey": []}]
    #swagger.parameters['userId'] = { in: 'path', type: 'string', required: true }
  */
  try {
    const { userId } = req.params;
    if (!userId) {
      console.log(`   ❌ Missing user ID`);
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const existingPatient = await patientService.getPatientByUserId(userId);

    if (!existingPatient) {
      console.log(`   ❌ Patient not found for user: ${userId}`);
      res.status(404).json({ message: "Patient not found for user" });
      return;
    }

    const iamUserSnapshot = existingPatient.user_id
      ? await iamServiceClient.getUserById(existingPatient.user_id)
      : null;

    const patient = await patientService.softDeletePatientByUserId(userId);
    if (!patient) {
      console.log(`   ❌ Patient not found for user: ${userId}`);
      res.status(404).json({ message: "Patient not found for user" });
      return;
    }

    const existingRecord = existingPatient as unknown as Record<string, unknown>;
    const updatedRecord = patient as unknown as Record<string, unknown>;
    const softDeleteFields = ["is_deleted", "is_active", "deleted_at"];
  const existingSnapshot = buildPatientSnapshot(iamUserSnapshot, existingRecord);
  const newSnapshot = buildPatientSnapshot(iamUserSnapshot, updatedRecord);
    const softDeleteOldValues = pickFields(existingRecord, softDeleteFields);
    if (existingSnapshot) {
      softDeleteOldValues.snapshot = existingSnapshot;
    }
    const softDeleteNewValues = pickFields(updatedRecord, softDeleteFields);
    if (newSnapshot) {
      softDeleteNewValues.snapshot = newSnapshot;
    }
    const fallbackOperatorId = typeof existingPatient.user_id === "string" ? existingPatient.user_id : undefined;
    const fallbackActor = (() => {
      const createdBy = existingPatient.created_by;
      if (typeof createdBy === "string" && createdBy.length > 0 && createdBy !== "system") {
        return createdBy;
      }
      return fallbackOperatorId;
    })();

    const operatorIdForMonitoring = resolveOperatorId(req, fallbackOperatorId);
    const actorEmail = await resolvePerformedBy(req, operatorIdForMonitoring ?? fallbackActor ?? "system");
    const operatorAvatar = await resolveOperatorAvatar(req, operatorIdForMonitoring);

    await patientMonitoringService.recordPatientDeleted({
      patientId: `${patient._id}`,
      eventMessage: "Patient record soft deleted by user ID",
      oldValues: softDeleteOldValues,
      newValues: null,
      operatorEmail: actorEmail,
      operatorId: operatorIdForMonitoring ?? fallbackOperatorId ?? null,
      operatorName: await resolveOperatorName(
        req,
        operatorIdForMonitoring ?? fallbackOperatorId,
        iamUserSnapshot?.fullName ?? undefined
      ),
      operatorAvatar,
    });

    console.log(`   ✅ Patient soft deleted: ${patient.patient_code} (User: ${userId})`);
    res.status(200).json({ message: "Patient deleted for user", patient });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  Error: ${errorMsg}`);
    errorHandler(res, error);
  }
};

export { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient, softDeletePatientByUserId };
