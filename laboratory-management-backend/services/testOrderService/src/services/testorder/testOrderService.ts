import { TestOrderRepository } from "../../repositories/testOrderRepository.js";
import reagentServiceClient from "../warehouse/reagentServiceClient.js";
import instrumentServiceClient from "../warehouse/instrumentServiceClient.js";
import { CreateOrderInput, ReagentUsage, UpdateOrderInput } from "../../db/models/TestOrder.model.js";
import { ITestOrder } from "../../db/models/TestOrder.model.js";
import TestOrder from "../../db/models/TestOrder.model.js";
import { TestItem } from "../../db/models/TestItem.model.js";
import mongoose from "mongoose";
import testOrderMonitoringService from "../monitoring/testOrderMonitoring.service.js";
import iamServiceClient, { type IamUser } from "../iam/iamServiceClient.js";
import patientServiceClient, { type Patient } from "../patient/patientServiceClient.js";
import { unknown } from "zod";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const computeDifferences = (
  oldData: Record<string, unknown> | null | undefined,
  newData: Record<string, unknown> | null | undefined
) => {
  const oldDiff: Record<string, unknown> = {};
  const newDiff: Record<string, unknown> = {};

  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  for (const key of allKeys) {
    if (["updated_at", "updated_by", "__v"].includes(key)) {
      continue;
    }

    const oldVal = oldData?.[key];
    const newVal = newData?.[key];

    if (isPlainObject(oldVal) && isPlainObject(newVal)) {
      const nested = computeDifferences(oldVal, newVal);
      if (
        Object.keys(nested.oldDiff).length > 0 ||
        Object.keys(nested.newDiff).length > 0
      ) {
        oldDiff[key] = nested.oldDiff;
        newDiff[key] = nested.newDiff;
      }
      continue;
    }

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      oldDiff[key] = oldVal;
      newDiff[key] = newVal;
    }
  }
  return { oldDiff, newDiff };
};

const toStringId = (value: unknown): string | null => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "toString" in value) {
    try {
      return (value as { toString: () => string }).toString();
    } catch {
      return null;
    }
  }
  return null;
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
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    age: user.age,
    role: user.role,
    isActive: user.isActive,
    avatar: user.avatar ?? null,
  };
};

const buildPatientSnapshot = (patient: Patient | null | undefined): Record<string, unknown> | null => {
  if (!patient) {
    return null;
  }
  return {
    id: patient._id,
    userId: patient.user_id ?? null,
    code: patient.patient_code ?? null,
    isActive: patient.is_active ?? null,
    isDeleted: patient.is_deleted ?? null,
    lastVisitDate: patient.last_visit_date ?? null,
    lastTestType: patient.last_test_type ?? null,
    emergencyContact: patient.emergency_contact ?? null,
    createdAt: patient.created_at ?? null,
    updatedAt: patient.updated_at ?? null,
    deletedAt: patient.deleted_at ?? null,
  };
};

const buildOrderSnapshotPayload = (
  order: Record<string, unknown> | null | undefined,
  patient: Patient | null | undefined
): Record<string, unknown> | null => {
  const snapshot: Record<string, unknown> = {};

  if (order) {
    snapshot.order = {
      id: toStringId(order._id),
      patientId: order.patient_id ?? null,
      barcode: order.barcode ?? null,
      testType: order.test_type ?? null,
      status: order.status ?? null,
      instrumentId: order.instrument_id ?? null,
      instrumentName: order.instrument_name ?? null,
      dueDate: order.due_date ?? null,
      createdAt: order.created_at ?? null,
      updatedAt: order.updated_at ?? null,
      notes: order.notes ?? null,
    };
  }

  const patientSnapshot = buildPatientSnapshot(patient ?? null);
  if (patientSnapshot) {
    snapshot.patient = patientSnapshot;
  }

  const userSnapshot = buildUserSnapshot(patient?.user ?? null);
  if (userSnapshot) {
    snapshot.user = userSnapshot;
  }

  return Object.keys(snapshot).length > 0 ? snapshot : null;
};

const buildSnapshotForOrder = async (
  order: Record<string, unknown> | null | undefined
): Promise<Record<string, unknown> | null> => {
  if (!order) {
    return null;
  }
  const patientId =
    typeof order.patient_id === "string" && order.patient_id.length > 0
      ? order.patient_id
      : null;
  let patient: Patient | null = null;
  if (patientId) {
    patient = await patientServiceClient.getPatientById(patientId);
  }
  return buildOrderSnapshotPayload(order, patient);
};

export const TestOrderService = {

  getDifferences(
    oldData: any,
    newData: any,
    snapshot?: Record<string, unknown> | null
  ) {
    const { oldDiff, newDiff } = computeDifferences(oldData, newData);

    if (snapshot) {
      newDiff.snapshot = snapshot;
    }

    return { oldDiff, newDiff };
  },

  async enrichOrderForLog(order: any) {
    if (!order) return null;
    let enriched = JSON.parse(JSON.stringify(order));

    try {
      // 1. Instrument
      if (enriched.instrument_id) {
        // Always try to fetch/refresh instrument name to ensure accuracy
        const instr = await instrumentServiceClient.getInstrumentById(enriched.instrument_id);
        if (instr) {
          // Reorder: put instrument_name after instrument_id for better readability
          const entries = Object.entries(enriched);
          const idx = entries.findIndex(([k]) => k === 'instrument_id');
          if (idx !== -1) {
            entries.splice(idx + 1, 0, ['instrument_name', instr.instrument_name]);
            enriched = Object.fromEntries(entries);
          } else {
            enriched.instrument_name = instr.instrument_name;
          }
        }
      }

      // 2. Reagents
      if (enriched.reagent_usages && Array.isArray(enriched.reagent_usages) && enriched.reagent_usages.length > 0) {
        const rIds = enriched.reagent_usages.map((u: any) => u.reagent_id);
        const rMap = await reagentServiceClient.getReagentsByIds(rIds);
        enriched.reagent_usages = enriched.reagent_usages.map((u: any) => ({
          ...u,
          reagent_name: rMap.get(u.reagent_id)?.reagent_name || u.reagent_name
        }));
      }

      // 3. Test Items
      if (enriched.test_item_ids && Array.isArray(enriched.test_item_ids) && enriched.test_item_ids.length > 0) {
        const testItems = await TestItem.find({ _id: { $in: enriched.test_item_ids } }).select('name');
        const nameMap = new Map(testItems.map(t => [t._id.toString(), t.name]));
        const names = enriched.test_item_ids.map((id: any) => nameMap.get(id.toString()));

        // Reorder: put test_item_names after test_item_ids for better readability
        const entries = Object.entries(enriched);
        const idx = entries.findIndex(([k]) => k === 'test_item_ids');
        if (idx !== -1) {
          entries.splice(idx + 1, 0, ['test_item_names', names]);
          enriched = Object.fromEntries(entries);
        } else {
          enriched.test_item_names = names;
        }
      }
    } catch (error) {
      // ignore enrichment errors to avoid blocking order creation
    }

    return enriched;
  },

  // Lấy tất cả Test Orders
  async getAllOrders(filter = {}, skip = 0, limit = 10, sort: any = { created_at: -1 }) {
    const data = await TestOrderRepository.findAll(filter, skip, limit, sort);
    return Array.isArray(data) ? data : [];
  },


  async countOrders(filter = {}) {
    return TestOrderRepository.count(filter);
  },

  // Lấy Test Order theo ID
  async getOrderById(id: string) {
    return await TestOrderRepository.findById(id);
  },


  async getOrdersGroupedByOnePatient(
    user_id: string,
    patient_id: string,
    created_at?: Date
  ): Promise<any[]> {

    const match: any = { is_deleted: false, patient_id };
    if (created_at) {
      match.created_at = { $gte: created_at };
    }

    return TestOrder.aggregate([
      { $match: match },
      { $sort: { created_at: -1 } },
      {
        $group: {
          _id: "$user_id",
          patient_name: { $first: "$patient_name" },
          orders: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          patient_id: "$_id",
          patient_name: 1,
          totalOrders: { $size: "$orders" },
          orders: 1 // trả về tất cả orders, không slice
        }
      }
    ]);
  },




  async createOrder(data: CreateOrderInput, operatorId?: string): Promise<ITestOrder> {
    // Validate: cần có patient_id hoặc patient_name
    if (!data.patient_id && !data.patient_name?.trim()) {
      throw new Error('Cần có patient_id hoặc patient_name để tạo đơn xét nghiệm');
    }

    // Tạo patient_id tạm thời nếu chỉ có patient_name
    const patientId = data.patient_id?.trim() || `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Dùng reagent_usages từ request, ép quantity_used về number, default 1 nếu null
    const reagentUsages: ReagentUsage[] = (data.reagent_usages ?? []).map(r => ({
      reagent_id: r.reagent_id,
      quantity_used: r.quantity_used ?? null,
    }));

    let instrumentId = data.instrument_id;
    let instrumentName: string | undefined;

    if (!instrumentId) {
      const readyInstrument = await instrumentServiceClient.getNextReadyInstrument();
      if (!readyInstrument) {
        throw new Error("Không còn thiết bị ở trạng thái Ready để tạo lệnh xét nghiệm");
      }
      instrumentId = readyInstrument._id;
      instrumentName = readyInstrument.instrument_name;
    } else {
      const instrument = await instrumentServiceClient.getInstrumentById(instrumentId);
      if (!instrument) {
        throw new Error("Thiết bị đã chọn không tồn tại");
      }
      if (instrument.status !== "Ready") {
        throw new Error("Thiết bị đang bận xử lý, vui lòng chọn thiết bị khác");
      }
      instrumentName = instrument.instrument_name;
    }

    if (!instrumentId) {
      throw new Error("Không thể xác định thiết bị để tạo test order");
    }

    // Chỉ thêm các field optional nếu có giá trị
    const orderInput: Partial<ITestOrder> = {
      patient_id: patientId,
      reagent_usages: reagentUsages,
      patient_name: data.patient_name?.trim() || '',
      barcode: data.barcode,
      test_type: data.test_type,
      test_item_ids: data.test_item_ids?.map(id => new mongoose.Types.ObjectId(id)),
      status: data.status ?? 'Pending',
      created_by: data.created_by,
      instrument_id: instrumentId,
      ...(instrumentName ? { instrument_name: instrumentName } : {}),
      ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
      ...(data.updated_by ? { updated_by: data.updated_by } : {}),
      is_deleted: data.is_deleted ?? false,
      ...(data.deleted_at ? { deleted_at: new Date(data.deleted_at) } : {}),
      ...(data.deleted_by ? { deleted_by: data.deleted_by } : {}),
      notes: data.notes ?? 'have no comment',
    };
    //  Tạo order
    const createdOrder = await TestOrderRepository.create(orderInput as ITestOrder);
    try {
      await instrumentServiceClient.updateInstrumentStatus(instrumentId, "Processing", data.created_by);
    } catch (err) {
      await TestOrder.findByIdAndDelete(createdOrder._id);
      throw new Error("Không thể cập nhật trạng thái thiết bị. Vui lòng thử lại.");
    }
    const reagentNamesMap = new Map<string, string>();

    //  Cập nhật tồn kho tương ứng cho từng reagent
    for (const usage of reagentUsages) {
      const reagent = await reagentServiceClient.getReagentById(usage.reagent_id);
      if (!reagent) continue;

      reagentNamesMap.set(usage.reagent_id, reagent.reagent_name);

      // quantity_current mới = quantity_current  - quantity_used
      const newQuantityCurrent = (reagent.quantity_current ?? 0) - (usage.quantity_used ?? 0);
      await reagentServiceClient.updateReagent(usage.reagent_id, {
        quantity_current: newQuantityCurrent,
      });
    }

    // Monitoring
    try {
      let user = null;
      const userIdToFetch = operatorId;

      if (userIdToFetch) {
        try {
          user = await iamServiceClient.getUserById(userIdToFetch);
        } catch (e) {
          // ignore user lookup errors
        }
      }

      const logPayload = await this.enrichOrderForLog(createdOrder.toObject());
      const snapshot = await buildSnapshotForOrder(logPayload ?? createdOrder.toObject());
      const monitoringNewValues = snapshot ? { snapshot } : logPayload ?? null;

      await testOrderMonitoringService.recordTestOrderCreated({
        testOrderId: createdOrder._id as unknown as string,
        eventMessage: "Test order created",
        newValues: monitoringNewValues,
        operatorId: userIdToFetch || data.created_by,
        operatorEmail: user?.email ?? null,
        operatorName: user?.fullName || (data.created_by !== 'system' ? data.created_by : null),
        operatorRole: user?.role ?? null,
        operatorAvatar: user?.avatar ?? null
      });
    } catch (error) {
      // swallow monitoring failures
    }

    return createdOrder;
  },


  async updateOrder(id: string, data: UpdateOrderInput, updated_by: any, operatorId?: string): Promise<ITestOrder | null> {
    //  Lấy order hiện tại từ DB
    const existingOrder = await TestOrderRepository.findById(id);
    if (!existingOrder) throw new Error(`Order ${id} not found`);

    //  Nếu có cập nhật reagent_usages thì hoàn trả lượng cũ vào kho trước
    if (data.reagent_usages && data.reagent_usages.length > 0) {
      for (const oldUsage of existingOrder.reagent_usages ?? []) {
        const reagent = await reagentServiceClient.getReagentById(oldUsage.reagent_id);
        if (!reagent) continue;

        const restoredQuantity = (reagent.quantity_current ?? 0) + (oldUsage.quantity_used ?? 0);
        await reagentServiceClient.updateReagent(oldUsage.reagent_id, {
          quantity_current: restoredQuantity,
        });
      }
    }

    //  Chuẩn bị dữ liệu update cho order
    const reagentUsages: ReagentUsage[] = (data.reagent_usages ?? []).map(r => ({
      reagent_id: r.reagent_id,
      quantity_used: r.quantity_used ?? null,
    }));

    const orderUpdate: Partial<ITestOrder> = {
      ...(data.patient_id ? { patient_id: data.patient_id } : {}),
      ...(reagentUsages.length ? { reagent_usages: reagentUsages } : {}),
      ...(data.patient_name ? { patient_name: data.patient_name } : {}),
      ...(data.barcode ? { barcode: data.barcode } : {}),
      ...(data.test_type ? { test_type: data.test_type } : {}),
      ...(data.test_item_ids && Array.isArray(data.test_item_ids)
        ? { test_item_ids: data.test_item_ids.map(id => new mongoose.Types.ObjectId(id)) }
        : {}),

      ...(data.status ? { status: data.status } : {}),
      ...(data.instrument_id ? { instrument_id: data.instrument_id } : {}),
      ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
      updated_by: updated_by,
      notes: data.notes ?? existingOrder.notes ?? 'have no comment',
    };

    //  Cập nhật order
    const updatedOrder = await TestOrderRepository.update(id, orderUpdate);

    const reagentNamesMap = new Map<string, string>();
    let newInstrumentName: string | undefined;

    if (data.instrument_id) {
      const instr = await instrumentServiceClient.getInstrumentById(data.instrument_id);
      if (instr) newInstrumentName = instr.instrument_name;
    }

    //  Nếu có reagent_usages mới thì trừ tồn kho theo lượng mới
    if (reagentUsages.length > 0) {
      for (const newUsage of reagentUsages) {
        const reagent = await reagentServiceClient.getReagentById(newUsage.reagent_id);
        if (!reagent) continue;

        reagentNamesMap.set(newUsage.reagent_id, reagent.reagent_name);

        const newQuantityCurrent =
          (reagent.quantity_current ?? 0) - (newUsage.quantity_used ?? 0);

        await reagentServiceClient.updateReagent(newUsage.reagent_id, {
          quantity_current: newQuantityCurrent,
        });
      }
    }

    // Monitoring
    try {
      let user = null;
      const userIdToFetch = operatorId;

      if (userIdToFetch) {
        try {
          user = await iamServiceClient.getUserById(userIdToFetch);
        } catch (e) {
          // ignore user lookup errors
        }
      }

      const oldValues = await this.enrichOrderForLog(existingOrder.toObject());
      const newValues = await this.enrichOrderForLog(updatedOrder?.toObject());
      const snapshot = await buildSnapshotForOrder(newValues ?? updatedOrder?.toObject());

      const { oldDiff, newDiff } = this.getDifferences(oldValues, newValues, snapshot);

      await testOrderMonitoringService.recordTestOrderUpdated({
        testOrderId: id,
        eventMessage: "Test order updated",
        oldValues: oldDiff,
        newValues: newDiff,
        operatorId: userIdToFetch || updated_by,
        operatorEmail: user?.email ?? null,
        operatorName: user?.fullName || (updated_by !== 'system' ? updated_by : undefined),
        operatorRole: user?.role ?? null,
        operatorAvatar: user?.avatar ?? null
      });
    } catch (error) {
      // swallow monitoring failures
    }

    return updatedOrder;
  },


  async updateStatus(
    id: string,
    status: string,
    updated_by: string,
    operatorId?: string
  ): Promise<ITestOrder> {
    const order = await TestOrderRepository.findById(id);
    if (!order) throw new Error('Không tìm thấy lệnh xét nghiệm');
    const previousStatus = order.status;
    const updatedOrder = await TestOrderRepository.update(id, {
      ...order.toObject(),
      status,
      updated_by: updated_by,
      updated_at: new Date(),
    });

    if (order.instrument_id && (status === "Processing" || status === "Completed")) {
      const nextInstrumentStatus = status === "Completed" ? "Ready" : "Processing";
      try {
        await instrumentServiceClient.updateInstrumentStatus(order.instrument_id, nextInstrumentStatus, updated_by);
      } catch (err) {
        await TestOrderRepository.update(id, {
          status: previousStatus,
          updated_by,
          updated_at: new Date(),
        });
        throw new Error("Không thể cập nhật trạng thái thiết bị. Vui lòng thử lại.");
      }
    }

    // Monitoring
    try {
      let user = null;
      const userIdToFetch = operatorId;

      if (userIdToFetch) {
        try {
          user = await iamServiceClient.getUserById(userIdToFetch);
        } catch (e) {
          // ignore user lookup errors
        }
      }

      const oldValues = await this.enrichOrderForLog(order.toObject());
      const newValues = await this.enrichOrderForLog(updatedOrder?.toObject());
      const snapshot = await buildSnapshotForOrder(newValues ?? updatedOrder?.toObject());

      const { oldDiff, newDiff } = this.getDifferences(oldValues, newValues, snapshot);

      await testOrderMonitoringService.recordTestOrderUpdated({
        testOrderId: id,
        eventMessage: `Test order status updated to ${status}`,
        oldValues: oldDiff,
        newValues: newDiff,
        operatorId: userIdToFetch || updated_by,
        operatorEmail: user?.email ?? null,
        operatorName: user?.fullName || (updated_by !== 'system' ? updated_by : null),
        operatorRole: user?.role ?? null,
        operatorAvatar: user?.avatar ?? null
      });
    } catch (error) {
      // swallow monitoring failures
    }

    return updatedOrder;
  },


  async softDelete(_id: string, deleted_by: string, operatorId?: string): Promise<ITestOrder | null> {
    const order = await TestOrderRepository.findById(_id);
    if (!order) throw new Error("Order không tìm thấy!");
    // Chỉ hồi lại tồn kho nếu order chưa thực hiện
    if (order.status !== "Completed") {
      for (const usage of order.reagent_usages) {
        const reagent = await reagentServiceClient.getReagentById(usage.reagent_id);
        if (!reagent) continue;

        const restoredQuantity = reagent.quantity_current + (usage.quantity_used ?? 0);
        await reagentServiceClient.updateReagent(usage.reagent_id, {
          quantity_current: restoredQuantity,
        });
      }
    } else {
      // Nếu status là Completed thì không hồi lại reagent
      // skip reagent restoration for completed orders
    }

    if (order.instrument_id) {
      try {
        await instrumentServiceClient.updateInstrumentStatus(order.instrument_id, "Ready", deleted_by);
      } catch (err) {
        console.error(`[TestOrderService] Không thể cập nhật trạng thái thiết bị ${order.instrument_id}:`, err);
      }
    }

    const softDeleteTestOrder = await TestOrderRepository.softDelete(_id, deleted_by);

    // Monitoring
    try {
      let user = null;
      const userIdToFetch = operatorId || (deleted_by !== 'system' ? deleted_by : null);

      if (userIdToFetch) {
        try {
          user = await iamServiceClient.getUserById(userIdToFetch);
        } catch (e) {
          // ignore user lookup errors
        }
      }

      const oldValues = await this.enrichOrderForLog(order.toObject());
      const snapshot = await buildSnapshotForOrder(oldValues ?? order.toObject());
      const deleteOldValues = snapshot ? { snapshot } : oldValues ?? null;

      await testOrderMonitoringService.recordTestOrderDeleted({
        testOrderId: _id,
        eventMessage: "Test order soft deleted",
        oldValues: deleteOldValues,
        newValues: null,
        operatorId: userIdToFetch || deleted_by,
        operatorEmail: user?.email ?? null,
        operatorName: user?.fullName || (deleted_by !== 'system' ? deleted_by : null),
        operatorRole: user?.role ?? null,
        operatorAvatar: user?.avatar ?? null
      });
    } catch (error) {
      // swallow monitoring failures
    }

    return softDeleteTestOrder;
  },

  async searchOrders(keyword: string, page = 1, limit = 10) {
    const query: any = {
      is_deleted: false,
      $or: [
        { patient_name: { $regex: keyword, $options: "i" } },
        { barcode: { $regex: keyword, $options: "i" } },
        { test_type: { $regex: keyword, $options: "i" } },
      ],
    };

    const skip = (page - 1) * limit;

    // Gọi repo, sort theo due_date tăng dần
    const orders = await TestOrderRepository.find(query, skip, limit, { due_date: 1 });
    const total = await TestOrderRepository.count(query);

    return { orders, total };
  }



}


