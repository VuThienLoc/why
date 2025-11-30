// src/services/reagent.service.ts
import { ReagentRepository } from "../../repositories/reagent/reagent.repository.js";
import { IReagent } from "../../db/models/Reagent.model.js";

const computeReagentStatus = (
  quantityCurrent: number,
  lowStockThreshold?: number,
  expirationDate?: Date | string
): IReagent["status"] => {
  const parsedExpiration = expirationDate ? new Date(expirationDate) : undefined;
  const now = new Date();
  if (parsedExpiration && !isNaN(parsedExpiration.getTime()) && parsedExpiration < now) {
    return "Expired";
  }
  if (quantityCurrent <= 0) {
    return "Depleted";
  }
  if (typeof lowStockThreshold === "number" && quantityCurrent < lowStockThreshold) {
    return "LowStock";
  }
  return "Available";
};

export class ReagentService {
  private repo: ReagentRepository;

  constructor() {
    this.repo = new ReagentRepository();
  }

  async getAll(
    page = 1,
    limit = 10,
    sort: any = { expiration_date: 1, created_at: -1 } // sort 2 cấp
  ) {
    const skip = (page - 1) * limit;
    const query = { is_deleted: false }; 
    const data = await this.repo.findAll(query, skip, limit, sort);
    const totalItems = await this.repo.count(query);
    return { data, totalItems };
  }



  async getById(id: string): Promise<IReagent | null> {
    return this.repo.findById(id);
  }

  async create(data: Partial<IReagent>): Promise<IReagent> {
    const payload: Partial<IReagent> = { ...data };

    if ("reagent_code" in payload) {
      delete payload.reagent_code;
    }

    // Nếu low_stock_threshold chưa set, mặc định = 10% của quantity_current
    if (!payload.low_stock_threshold && typeof payload.quantity_current === "number") {
      payload.low_stock_threshold = Math.round(payload.quantity_current * 0.1);
    }

    const normalizedQuantityCurrent = typeof payload.quantity_current === "number" ? payload.quantity_current : 0;
    payload.status = computeReagentStatus(
      normalizedQuantityCurrent,
      payload.low_stock_threshold,
      payload.expiration_date
    );

    if (payload.created_by && !payload.updated_by) {
      payload.updated_by = payload.created_by;
    }

    return this.repo.create(payload);
  }


  async update(
    id: string,
    data: Partial<IReagent>,
    updatedBy?: string
  ): Promise<IReagent | null> {
    const reagent = await this.repo.findById(id);
    if (!reagent) throw new Error("Reagent not found");

    if ('reagent_code' in data) delete data.reagent_code;

    const oldQuantityCurrent = reagent.quantity_current ?? 0;
    const newQuantityCurrent = data.quantity_current ?? oldQuantityCurrent;

    if (newQuantityCurrent < 0) {
      throw new Error("quantity_current không thể âm");
    }

    data.quantity_current = newQuantityCurrent;

    const effectiveLowStockThreshold =
      typeof data.low_stock_threshold === "number"
        ? data.low_stock_threshold
        : reagent.low_stock_threshold;

    const effectiveExpirationDate = data.expiration_date ?? reagent.expiration_date;

    data.status = computeReagentStatus(
      newQuantityCurrent,
      effectiveLowStockThreshold,
      effectiveExpirationDate
    );

    // Cập nhật metadata
    data.updated_at = new Date();
    if (updatedBy) data.updated_by = updatedBy;

    return this.repo.findAndUpdate(id, data);
  }

  async delete(id: string, deletedBy: string): Promise<IReagent | null> {
    return this.repo.softDelete(id, deletedBy);
  }

  async search(keyword: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const sort = { expiration_date: 1, created_at: -1 };
    return await this.repo.search(keyword, skip, limit, sort);
  }


}
