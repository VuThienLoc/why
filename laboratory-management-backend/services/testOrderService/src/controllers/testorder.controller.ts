import { Request, Response } from "express";
import { TestOrderService } from "../services/testorder/testOrderService.js";
import instrumentServiceClient from "../services/warehouse/instrumentServiceClient.js";
import reagentServiceClient, { Reagent } from "../services/warehouse/reagentServiceClient.js";
import { TestItem } from "../db/models/TestItem.model.js";
import { TestResultService } from "../services/testorder/testResultService.js";
import { Types } from "mongoose";
import patientServiceClient from "../services/patient/patientServiceClient.js";

export const getAllTestOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Lấy tất cả orders chưa bị xóa, sắp xếp theo due_date tăng dần
    const [orders, total, pendingCount, processingCount, completedCount] = await Promise.all([
      TestOrderService.getAllOrders(
        { is_deleted: false },
        skip,
        limit,
        { due_date: 1 }
      ),
      TestOrderService.countOrders({ is_deleted: false }),

      // Đếm theo từng trạng thái
      TestOrderService.countOrdersByStatus("Pending"),
      TestOrderService.countOrdersByStatus("Processing"),
      TestOrderService.countOrdersByStatus("Completed"),
    ]);


    // Chuẩn hóa dữ liệu trả về
    const enrichedOrders = orders.map((order) => ({
      _id: order._id,
      patient_id: order.patient_id,
      patient_name: order.patient_name,
      test_type: order.test_type,
      test_item_ids: order.test_item_ids,
      barcode: order.barcode,
      status: order.status,
      created_at: order.created_at,
      created_by: order.created_by,
      due_date: order.due_date,
      updated_at: order.updated_at,
      updated_by: order.updated_by,
      notes: order.notes,
    }));

    res.json({
      data: enrichedOrders,
      pagination: {
        pendingCount,
        processingCount,
        completedCount,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[TestOrderController] Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getTestOrderById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const order = await TestOrderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Test order not found" });

    // Lấy thông tin instrument
    const instrument = order.instrument_id
      ? await instrumentServiceClient.getInstrumentById(order.instrument_id)
      : null;

    // Lấy danh sách reagent, convert Map -> Array nếu client vẫn trả Map
    const reagentIds = order.reagent_usages?.map(u => u.reagent_id) || [];
    const reagentsMap = reagentIds.length
      ? await reagentServiceClient.getReagentsByIds(reagentIds)
      : new Map<string, Reagent>();

    const reagentsArray = Array.from(reagentsMap.values());

    // Map reagent với số lượng đã dùng từ order.reagent_usages
    const enrichedReagents = reagentsArray.map((r) => {
      const usage = order.reagent_usages?.find((u) => u.reagent_id === r._id)?.quantity_used || 0;
      return {
        reagent_id: r._id,
        reagent_name: r.reagent_name,
        reagent_type: r.reagent_type,
        status: r.status,
        quantity_used: usage,
      };
    });


    const testItems = order.test_item_ids?.length
      ? await TestItem.find({ _id: { $in: order.test_item_ids } })
      : [];

    const enrichedTestItems = testItems.map(item => ({
      name: item.name,
    }));

    const enrichedOrder = {
      _id: order._id,
      patient_id: order.patient_id,
      patient_name: order.patient_name,
      barcode: order.barcode,
      test_type: order.test_type,
      test_item_ids: order.test_item_ids?.map(id => id.toString()) || [],
      test_items: enrichedTestItems,
      status: order.status,
      created_at: order.created_at,
      created_by: order.created_by,
      due_date: order.due_date,
      updated_at: order.updated_at,
      updated_by: order.updated_by,
      is_deleted: order.is_deleted,
      deleted_at: order.deleted_at,
      deleted_by: order.deleted_by,
      notes: order.notes,
      instrument: instrument
        ? {
          instrument_code: instrument.instrument_code,
          instrument_name: instrument.instrument_name,
          instrument_type: instrument.instrument_type,
          manufacturer: instrument.manufacturer,
          status: instrument.status,
        }
        : null,

      reagents: enrichedReagents,
    };

    console.log("enrichedOrder", enrichedOrder);
    res.json(enrichedOrder);
  } catch (err) {
    console.error("[TestOrderController] Error fetching order by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOrdersGroupedByUserId = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;

    // Lấy patient dựa vào user_id
    const patient = await patientServiceClient.getPatientByUserId(user_id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const created_atByString = req.query.created_at as string;
    const created_at = created_atByString ? new Date(created_atByString) : undefined;

    // Lấy tất cả orders của patient (không phân trang)
    const groupOfOnePatientData = await TestOrderService.getOrdersGroupedByOnePatient(
      user_id,
      patient._id,
      created_at
    );

    if (!groupOfOnePatientData.length) {
      return res.json({ success: true, data: null });
    }

    const { patient_name, orders } = groupOfOnePatientData[0];

    return res.json({
      success: true,
      data: {
        user_id,
        patient_name,
        orders
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};





export const searchTestOrders = async (req: Request, res: Response) => {
  try {
    const keyword = (req.query.keyword as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!keyword.trim()) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const { orders, total } = await TestOrderService.searchOrders(keyword, page, limit);

    // Chuẩn hóa dữ liệu
    const enrichedOrders = orders.map(order => ({
      _id: order._id,
      patient_id: order.patient_id,
      patient_name: order.patient_name,
      test_type: order.test_type,
      test_item_ids: order.test_item_ids,
      barcode: order.barcode,
      status: order.status,
      created_at: order.created_at,
      created_by: order.created_by,
      due_date: order.due_date,
      updated_at: order.updated_at,
      updated_by: order.updated_by,
      notes: order.notes,
    }));

    res.json({
      data: enrichedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[TestOrderController] Error searching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const createTestOrder = async (req: Request, res: Response) => {
  try {
    const { ...orderData } = req.body;
    const operatorId = (req as any).userId;
    const order = await TestOrderService.createOrder(orderData, operatorId);
    res.status(201).json({ message: "Test order created successfully", order });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTestOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const updatedBy = data.updated_by;
    const operatorId = (req as any).userId;
    const updated = await TestOrderService.updateOrder(id, data, updatedBy, operatorId);

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const softDeleteTestOrder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id as string;
    const { deleted_by } = req.body;
    const operatorId = (req as any).userId;
    const deletedBy = deleted_by || 'system';

    const deletedOrder = await TestOrderService.softDelete(_id, deletedBy, operatorId);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }
    res.status(200).json({
      message: 'Đã xóa (soft delete) lệnh xét nghiệm thành công',
      order: deletedOrder,
    });
  } catch (error) {
    console.error('❌ Lỗi khi soft delete test order:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa test order' });
  }
};

export const updateTestOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, updated_by } = req.body;
    const operatorId = (req as any).userId;

    if (!updated_by) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin người cập nhật",
      });
    }

    const validStatuses = ["Pending", "Processing", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }
    const updated = await TestOrderService.updateStatus(id, status, updated_by, operatorId);

    // Nếu status là Completed thì tự động tạo Test Results
    if (status === "Completed") {
      const testItemIds: Types.ObjectId[] = updated.test_item_ids ?? [];
      const testItemIdsStr: string[] = testItemIds.map(id => id.toString());

      await TestResultService.createRandomResults(id, testItemIdsStr);
    }
    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


