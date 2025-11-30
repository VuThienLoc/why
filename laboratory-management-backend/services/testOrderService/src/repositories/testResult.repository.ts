import { Types } from "mongoose";
import { TestOrderResult } from "../db/models/TestResult.model.js";

export const TestResultRepository = {
  createMany: async (results: any[]) => {
    return TestOrderResult.insertMany(results);
  },

  softDeleteByOrderId(test_order_id: any) {
    return TestOrderResult.updateMany(
      { test_order_id },
      {
        is_deleted: true,
        deleted_at: new Date(),
      }
    );
  },

  updateById(id: string | Types.ObjectId, updateData: Partial<any>) {
    return TestOrderResult.findOneAndUpdate(
      { _id: id, is_deleted: false },
      updateData,
      { new: true }
    );
  },

  findById(id: string | Types.ObjectId) {
    return TestOrderResult.findOne({ _id: id, is_deleted: false });
  },

  findByPatientId: async (patient_id: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const filter = {
      patient_id,
      is_deleted: false
    };

    const total = await TestOrderResult.countDocuments(filter);

    const results = await TestOrderResult.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { results, total };
  },

  findByUserId: async (user_id: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const filter = {
      user_id,
      is_deleted: false
    };

    const total = await TestOrderResult.countDocuments(filter);

    const results = await TestOrderResult.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { results, total };
  }
};
