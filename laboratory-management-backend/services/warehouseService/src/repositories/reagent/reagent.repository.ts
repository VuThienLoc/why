// src/repositories/reagent.repository.ts
import { FilterQuery } from "mongoose";
import Reagent, { type IReagent } from "../../db/models/Reagent.model.js";
import { generateReagentCode } from "../../utils/reagentCode.util.js";

export class ReagentRepository {
  // Lấy tất cả reagents có phân trang
  async findAll(
    query: FilterQuery<IReagent> = { is_deleted: false }, // <- dùng FilterQuery
    skip = 0,
    limit = 10,
    sort: Record<string, 1 | -1> = { expiration_date: 1, created_at: -1 }
  ): Promise<IReagent[]> {
    return await Reagent.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select("-__v")
      .lean<IReagent[]>()
      .exec();
  }

  async findById(id: string): Promise<IReagent | null> {
    return Reagent.findOne({ _id: id, is_deleted: false }).select("-__v").lean<IReagent>();
  }

  async findByCode(code: string): Promise<IReagent | null> {
    return Reagent.findOne({ reagent_code: code, is_deleted: false }).select("-__v").lean<IReagent>();
  }

  async create(data: Partial<IReagent>): Promise<IReagent> {
    const payload: Partial<IReagent> = { ...data };

    if (!payload.reagent_code) {
      payload.reagent_code = generateReagentCode();
    }

    if (payload.created_by && !payload.updated_by) {
      payload.updated_by = payload.created_by;
    }

    const reagent = await Reagent.create(payload);
    return reagent.toObject<IReagent>({ versionKey: false });
  }

  async findAndUpdate(id: string, data: Partial<IReagent>): Promise<IReagent | null> {
    return Reagent.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { $set: data },
      { new: true }
    )
      .select("-__v")
      .lean<IReagent>()
      .exec();
  }

  async softDelete(_id: string, deletedBy: string): Promise<IReagent | null> {
    return Reagent.findOneAndUpdate(
      { _id }, // filter
      {
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
      { new: true } // trả về document sau khi update
    )
      .select("-__v")
      .lean<IReagent>()
      .exec();
  }
  async count(query: any = { is_deleted: false }): Promise<number> {
    return await Reagent.countDocuments(query);
  }


  async search(keyword: string, skip: number, limit: number, sort: any) {
    const query = {
      $or: [
        { reagent_name: { $regex: keyword, $options: "i" } },
        { code: { $regex: keyword, $options: "i" } },
        { unit_of_measure: { $regex: keyword, $options: "i" } },
        { storage_location: { $regex: keyword, $options: "i" } }
      ]
    };

    const [data, totalItems] = await Promise.all([
      Reagent.find(query).skip(skip).limit(limit).sort(sort),
      Reagent.countDocuments(query)
    ]);

    return { data, totalItems };
  }

}
