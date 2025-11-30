import TestOrder, { ITestOrder } from "../db/models/TestOrder.model.js";
import { HydratedDocument } from 'mongoose';

export const TestOrderRepository = {
  // Tạo Test order
  async create(data: Partial<ITestOrder>): Promise<ITestOrder> {
    return await new TestOrder(data).save();
  },

  // Lấy tất cả Test order chưa bị xoá
  async findAll(query: any, skip = 0, limit = 10, sort: any = { created_at: -1 }) {
    return await TestOrder.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
  },
  

  async count(filter = {}) {
    return TestOrder.countDocuments(filter);
  },

  async find(query: any, skip = 0, limit = 10, sort: any = { created_at: -1 }) {
    return await TestOrder.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
  },


  // Tìm Test order theo ID
  async findById(id: string): Promise<ITestOrder | null> {
    return await TestOrder.findById(id).exec();
  },

  // Cập nhật Test order theo ID
  async update(
    id: string,
    data: Partial<ITestOrder>
  ): Promise<ITestOrder> {
    const updated: HydratedDocument<ITestOrder> | null = await TestOrder.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updated) {
      throw new Error(`TestOrder with id ${id} not found`);
    }

    return updated; // TypeScript hiểu đúng: ITestOrder & Document
  },

  async softDelete(_id: string, deletedBy: string): Promise<ITestOrder> {
    return this.update(_id, {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: deletedBy,
      updated_at: new Date(),
      updated_by: deletedBy,
    });
  },

  async findByBarcode(barcode: string): Promise<ITestOrder | null> {
    const doc: HydratedDocument<ITestOrder> | null = await TestOrder.findOne({
      barcode,
      is_deleted: false,
    });
    return doc;
  },
};


