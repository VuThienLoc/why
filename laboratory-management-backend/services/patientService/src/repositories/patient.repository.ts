import Patient, { type IPatient } from "../db/models/Patient.model.js";

export class PatientRepository {
  async create(patientData: Partial<IPatient>): Promise<IPatient> {
    const patient = new Patient(patientData);
    return await patient.save();
  }

  async findById(id: string): Promise<IPatient | null> {
    return await Patient.findOne({ _id: id, isDeleted: false }).lean();
  }

  async findByIdentityNumber(identityNumber: string): Promise<IPatient | null> {
    return await Patient.findOne({ identityNumber, isDeleted: false }).lean();
  }

  async findByEmail(email: string): Promise<IPatient | null> {
    return await Patient.findOne({ email, isDeleted: false }).lean();
  }

  async findAll(
    filters: any = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IPatient[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Patient.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Patient.countDocuments(filters),
    ]);

    return {
      data: data as IPatient[],
      total,
    };
  }

  async update(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    return await Patient.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  async softDelete(id: string, deletedBy: string): Promise<IPatient | null> {
    return await Patient.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
        },
      },
      { new: true }
    ).lean();
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await Patient.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async search(searchTerm: string, limit: number = 20): Promise<IPatient[]> {
    return await Patient.find({
      isDeleted: false,
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { identityNumber: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phoneNumber: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .limit(limit)
      .lean();
  }

  async count(filters: any = {}): Promise<number> {
    return await Patient.countDocuments(filters);
  }
}

export default new PatientRepository();
