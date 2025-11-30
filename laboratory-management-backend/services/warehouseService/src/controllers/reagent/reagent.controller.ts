// src/controllers/reagent.controller.ts
import type { Request, Response } from "express";
import { ReagentService } from "../../services/reagent/reagent.service.js";
import iamServiceClient from "../../services/iamService/client/index.js";
import reagentMonitoringService from "../../services/reagent/reagentMonitoring.service.js";
import type { IReagent } from "../../db/models/Reagent.model.js";

const service = new ReagentService();

const fetchUserEmail = async (userId: string | null | undefined): Promise<string | null> => {
  if (!userId || typeof userId !== "string") {
    return null;
  }
  try {
    const user = await iamServiceClient.getUserById(userId);
    if (user?.email) {
      return user.email;
    }
  } catch (error) {
    console.warn(`[ReagentController] Unable to resolve email for user ${userId}`, error);
  }
  return null;
};

const fetchUserName = async (userId: string | null | undefined): Promise<string | null> => {
  if (!userId || typeof userId !== "string") {
    return null;
  }
  try {
    const user = await iamServiceClient.getUserById(userId);
    if (user?.fullName && user.fullName.trim().length > 0) {
      return user.fullName.trim();
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email.trim();
    }
  } catch (error) {
    console.warn(`[ReagentController] Unable to resolve name for user ${userId}`, error);
  }
  return null;
};

const resolveOperatorId = (req: Request, fallback?: string): string | undefined => {
  const requestUserId = (req as any).userId;
  if (typeof requestUserId === "string" && requestUserId.trim().length > 0) {
    return requestUserId.trim();
  }

  const headerSources = ["x-user-id", "x-operator-id", "x-actor-id"] as const;
  for (const headerKey of headerSources) {
    const rawValue = req.headers[headerKey];
    const headerValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof headerValue === "string" && headerValue.trim().length > 0) {
      return headerValue.trim();
    }
  }

  if (typeof fallback === "string" && fallback.trim().length > 0) {
    return fallback.trim();
  }

  return undefined;
};

const resolveOperatorName = async (
  req: Request,
  operatorId: string | undefined,
  fallbackName?: string | null
): Promise<string | null> => {
  const headerNameSources = ["x-user-name", "x-operator-name", "x-actor-name"] as const;
  for (const headerKey of headerNameSources) {
    const rawValue = req.headers[headerKey];
    const headerValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof headerValue === "string" && headerValue.trim().length > 0) {
      const normalized = headerValue.trim();
      (req as any).userFullName = normalized;
      return normalized;
    }
  }

  const cachedName = (req as any).userFullName;
  if (typeof cachedName === "string" && cachedName.trim().length > 0) {
    return cachedName.trim();
  }

  if (operatorId) {
    const resolved = await fetchUserName(operatorId);
    if (resolved) {
      (req as any).userFullName = resolved;
      return resolved;
    }
  }

  if (typeof fallbackName === "string" && fallbackName.trim().length > 0) {
    return fallbackName.trim();
  }

  return null;
};

const resolvePerformedBy = async (req: Request, fallback?: string): Promise<string> => {
  const headerEmailRaw = req.headers["x-user-email"];
  const headerEmail = Array.isArray(headerEmailRaw) ? headerEmailRaw[0] : headerEmailRaw;
  if (typeof headerEmail === "string" && headerEmail.length > 0) {
    (req as any).userEmail = headerEmail;
    return headerEmail;
  }

  const cachedEmail = (req as any).userEmail;
  if (typeof cachedEmail === "string" && cachedEmail.length > 0) {
    return cachedEmail;
  }

  const headerUserIdRaw = req.headers["x-user-id"];
  const headerUserId = Array.isArray(headerUserIdRaw) ? headerUserIdRaw[0] : headerUserIdRaw;
  const userId = (req as any).userId ?? (typeof headerUserId === "string" ? headerUserId : undefined);
  if (typeof userId === "string" && userId.length > 0) {
    const email = await fetchUserEmail(userId);
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

const pickReagentFields = (
  source: Partial<IReagent> | null | undefined,
  fields: string[]
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (!source) {
    return result;
  }
  for (const field of fields) {
    if (field in source) {
      result[field] = (source as Record<string, unknown>)[field];
    }
  }
  return result;
};

const buildReagentSnapshot = (reagent: IReagent | null | undefined): Record<string, unknown> | null => {
  if (!reagent) {
    return null;
  }
  return {
    id: reagent._id,
    code: reagent.reagent_code,
    name: reagent.reagent_name,
    type: reagent.reagent_type,
    status: reagent.status,
    quantityCurrent: reagent.quantity_current,
    unitOfMeasure: reagent.unit_of_measure,
    storageLocation: reagent.storage_location ?? null,
    expirationDate: reagent.expiration_date,
    receivedDate: reagent.received_date,
    isDeleted: reagent.is_deleted,
    createdAt: reagent.created_at,
    updatedAt: reagent.updated_at,
    createdBy: reagent.created_by ?? null,
    updatedBy: reagent.updated_by ?? null,
    deletedAt: reagent.deleted_at ?? null,
    deletedBy: reagent.deleted_by ?? null,
  };
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
    console.warn(`[ReagentController] Unable to resolve avatar for user ${userId}`, error);
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

export class ReagentController {
  async getAllReagents(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { data, totalItems } = await service.getAll(page, limit);
      res.json({
        success: true,
        data,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }



  async getReagentById(req: Request<{ id: string }>, res: Response) {
    try {
      const reagent = await service.getById(req.params.id);
      if (!reagent) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: reagent });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createReagent(req: Request, res: Response) {
    try {
      const operatorId = resolveOperatorId(req);
      const operatorEmail = await resolvePerformedBy(req, operatorId ?? "system");
      const operatorName = await resolveOperatorName(
        req,
        operatorId,
        operatorEmail === "system" ? undefined : operatorEmail
      );
      const operatorAvatar = await resolveOperatorAvatar(req, operatorId);

      const createInput = {
        ...(req.body as Partial<IReagent>),
        created_by: operatorEmail,
      };

      if (!createInput.updated_by) {
        createInput.updated_by = operatorEmail;
      }

      const reagent = await service.create(createInput);

      const snapshot = buildReagentSnapshot(reagent);
      const newValues: Record<string, unknown> | null = snapshot ? { snapshot } : null;

      await reagentMonitoringService.recordCreated({
        reagentId: `${reagent._id}`,
        reagentCode: reagent.reagent_code,
        eventMessage: "Reagent created",
        operatorId: operatorId ?? operatorEmail ?? "system",
        operatorEmail,
        operatorName,
        operatorAvatar,
        oldValues: null,
        newValues,
      });

      res.status(201).json({ success: true, data: reagent });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateReagent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = { ...(req.body as Partial<IReagent>) };
      delete (data as Partial<IReagent>).updated_by;

      const existingReagent = await service.getById(id);
      if (!existingReagent) {
        res.status(404).json({ success: false, message: "Reagent không tìm thấy" });
        return;
      }

      const operatorId = resolveOperatorId(
        req,
        existingReagent.updated_by ?? existingReagent.created_by ?? undefined
      );
      const operatorEmail = await resolvePerformedBy(
        req,
        operatorId ?? existingReagent.updated_by ?? existingReagent.created_by ?? "system"
      );
      const operatorName = await resolveOperatorName(
        req,
        operatorId,
        operatorEmail === "system" ? undefined : operatorEmail
      );
      const operatorAvatar = await resolveOperatorAvatar(req, operatorId);

      const updatedReagent = await service.update(id, data, operatorEmail);
      if (!updatedReagent) {
        res.status(404).json({ success: false, message: "Reagent không tìm thấy" });
        return;
      }

      const candidateFields = Array.from(
        new Set([
          ...Object.keys(data),
          "status",
          "quantity_current",
          "updated_at",
        ])
      );
      const changedFields = candidateFields.filter((field) => {
        const before = ((existingReagent as unknown) as Record<string, unknown>)[field];
        const after = ((updatedReagent as unknown) as Record<string, unknown>)[field];
        const beforeJson = before === undefined ? undefined : JSON.stringify(before);
        const afterJson = after === undefined ? undefined : JSON.stringify(after);
        return beforeJson !== afterJson;
      });

      if (changedFields.length > 0) {
        const oldValues = { ...(existingReagent as unknown as Record<string, unknown>) };
        const newValues = { ...(updatedReagent as unknown as Record<string, unknown>) };

        const messageSuffix = changedFields.join(", ");
        const eventMessage = messageSuffix.length > 0
          ? `Reagent updated (${messageSuffix})`
          : "Reagent updated";

        await reagentMonitoringService.recordUpdated({
          reagentId: `${updatedReagent._id}`,
          reagentCode: updatedReagent.reagent_code,
          eventMessage,
          operatorId: operatorId ?? operatorEmail ?? "system",
          operatorEmail,
          operatorName,
          operatorAvatar,
          oldValues,
          newValues,
        });
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật reagent thành công",
        data: updatedReagent,
      });
    } catch (error) {
      console.error("[ReagentController] Lỗi khi cập nhật reagent:", error);
      res.status(500).json({ success: false, message: "Lỗi server khi cập nhật reagent" });
    }
  }

  async deleteReagent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existingReagent = await service.getById(id);
      if (!existingReagent) {
        res.status(404).json({ success: false, message: "Reagent not found" });
        return;
      }

      const requestBody = req.body as Partial<IReagent>;
      const requestDeletedBy = typeof requestBody?.deleted_by === "string" ? requestBody.deleted_by : undefined;
      const operatorId = resolveOperatorId(
        req,
        requestDeletedBy ?? existingReagent.deleted_by ?? existingReagent.updated_by ?? existingReagent.created_by ?? undefined
      );
      const operatorEmail = await resolvePerformedBy(
        req,
        operatorId ?? requestDeletedBy ?? existingReagent.deleted_by ?? existingReagent.updated_by ?? existingReagent.created_by ?? "system"
      );
      const operatorName = await resolveOperatorName(
        req,
        operatorId,
        operatorEmail === "system" ? undefined : operatorEmail
      );
      const operatorAvatar = await resolveOperatorAvatar(req, operatorId);

      const deletedReagent = await service.delete(id, operatorEmail);
      if (!deletedReagent) {
        res.status(404).json({ success: false, message: "Reagent not found" });
        return;
      }

      const oldSnapshot = buildReagentSnapshot(existingReagent);
      const oldValues = oldSnapshot ? { snapshot: oldSnapshot } : null;

      await reagentMonitoringService.recordDeleted({
        reagentId: `${deletedReagent._id}`,
        reagentCode: deletedReagent.reagent_code,
        eventMessage: "Reagent deleted",
        operatorId: operatorId ?? operatorEmail ?? "system",
        operatorEmail,
        operatorName,
        operatorAvatar,
        oldValues,
        newValues: null,
      });

      res.status(200).json({
        success: true,
        message: "Đã xóa (soft delete) reagent thành công",
        data: deletedReagent,
      });
    } catch (error) {
      console.error("[ReagentController] Lỗi khi soft delete reagent:", error);
      res.status(500).json({ success: false, message: "Lỗi server khi xóa reagent" });
    }
  }

  async searchReagents(req: Request, res: Response) {
    try {
      const keyword = (req.query.keyword as string || "").trim();
      console.log("keyword", keyword);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      if (!keyword) {
        return res.status(400).json({ success: false, message: "Keyword is required" });
      }
      const { data, totalItems } = await service.search(keyword, page, limit);
      console.log("data", data);
      res.json({
        success: true,
        data,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
        },
      });
    } catch (err: any) {
      console.error("[ReagentController] searchReagents error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

}
