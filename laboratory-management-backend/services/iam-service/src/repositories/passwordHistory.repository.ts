// User repository interface
export interface IPassRepository {
  findById(id: string, fields?: string): Promise<any>;
  findByUserId(userId: string): Promise<any>;
  findByChangedAt(date: Date): Promise<any>;
  create(logData: any): Promise<any>;
  findAll(fields?: string): Promise<any[]>;
}

// User repository implementation
export class PasswordHistoryRepository implements IPassRepository {
  constructor(private passwordHistoryModel: any) {}

  async findById(id: string, fields?: string): Promise<any> {
    return await this.passwordHistoryModel.findById(
      id,
      fields ||
        "_id eventCode action eventMessage userId userEmail performedAt serviceName"
    );
  }

  async findByUserId(userId: string): Promise<any> {
    return await this.passwordHistoryModel.findOne({ userId });
  }

  async findLatestByUserId(userId: string) {
    return this.passwordHistoryModel
      .findOne({ userId })
      .sort({ changedAt: -1 })
      .lean(); 
  }

  async findByChangedAt(changedAt: Date): Promise<any> {
    return await this.passwordHistoryModel.findOne({ changedAt });
  }

  async create(logData: any): Promise<any> {
    const log = new this.passwordHistoryModel(logData);
    return await log.save();
  }

  async findAll(fields?: string): Promise<any[]> {
    return await this.passwordHistoryModel.find({}, fields);
  }
}
