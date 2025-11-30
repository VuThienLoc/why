import type { FilterQuery } from "mongoose";
import Patient, { type IPatient } from "../db/models/Patient.model.js";
import iamServiceClient, { type IamUser } from "./iamService.client.js";

type PatientFilters = FilterQuery<IPatient> & { is_deleted?: boolean };
type PatientWithUser = IPatient & { user?: IamUser | null };

export interface GetAllPatientsResult {
	patients: PatientWithUser[];
	total: number;
	page: number;
	totalPages: number;
}

export interface CreatePatientPayload {
	user_id: string;
	emergency_contact: {
		name?: string;
		phone?: string;
	};
	last_visit_date?: Date;
	last_test_type?: string;
	is_active?: boolean;
	created_by?: string;
}

export type PatientDetail = PatientWithUser;

export class PatientService {

	async createPatient(payload: CreatePatientPayload): Promise<IPatient> {
		// Tạo mới patient, trả về document đã lưu
		const patient = new Patient({
			...payload,
			is_deleted: false,
		});
		await patient.save();
		return patient.toObject();
	}

	async getPatientByUserId(user_id: string): Promise<IPatient | null> {
		return await Patient.findOne({ user_id, is_deleted: false }).lean<IPatient | null>();
	}

	async getPatientById(id: string, includeUser: boolean = false): Promise<PatientWithUser | null> {
		const patient = await Patient.findOne({ _id: id, is_deleted: false }).lean<IPatient | null>();
		if (!patient) {
			return null;
		}

		if (!includeUser || !patient.user_id) {
			return patient as PatientWithUser;
		}

		const user = await iamServiceClient.getUserById(patient.user_id);
		return {
			...patient,
			user: user ?? null,
		} as PatientWithUser;
	}
       async getAllPatients(
	       filters: PatientFilters = {},
	       page: number = 1,
	       limit: number = 10,
	       populateUser: boolean = true
       ): Promise<GetAllPatientsResult> {
	       console.log("\n[PatientService] ====== GET ALL PATIENTS START ======");
	       console.log("[PatientService] Input filters:", JSON.stringify(filters));
	       console.log("[PatientService] page:", page, "limit:", limit, "populateUser:", populateUser);
	       const refinedFilters: PatientFilters = { ...filters };

	       if (typeof refinedFilters.is_deleted === "undefined") {
		       refinedFilters.is_deleted = false;
	       }

	       const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
	       const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
	       const skip = (safePage - 1) * safeLimit;

	       const [patients, total] = await Promise.all([
		       Patient.find(refinedFilters)
			       .sort({ updated_at: -1 })
			       .skip(skip)
			       .limit(safeLimit)
			       .lean<IPatient[]>(),
		       Patient.countDocuments(refinedFilters),
	       ]);

	       let patientsWithUser = patients as PatientWithUser[];
	       if (populateUser && patients.length > 0) {
		       const userIds = [...new Set(patients.map((patient) => patient.user_id).filter(Boolean))];
		       const userMap = await iamServiceClient.getUsersByIds(userIds);
		       patientsWithUser = patients.map((patient) => ({
			       ...patient,
			       user: userMap.get(patient.user_id) ?? null,
		       })) as PatientWithUser[];
	       }

	       return {
		       patients: patientsWithUser,
		       total,
		       page: safePage,
		       totalPages: Math.max(Math.ceil(total / safeLimit), 1),
	       };
       }

	async updatePatient(id: string, updateData: Partial<CreatePatientPayload>): Promise<IPatient | null> {
		return await Patient.findOneAndUpdate(
			{ _id: id, is_deleted: false },
			{ $set: updateData },
			{ new: true, runValidators: true, timestamps: true }
		).lean<IPatient | null>();
	}

	async softDeletePatient(id: string): Promise<IPatient | null> {
		return await Patient.findOneAndUpdate(
			{ _id: id, is_deleted: false },
			{
				$set: {
					is_deleted: true,
					is_active: false,
					deleted_at: new Date(),
				},
			},
			{ new: true }
		).lean<IPatient | null>();
	}

	async softDeletePatientByUserId(userId: string): Promise<IPatient | null> {
		return await Patient.findOneAndUpdate(
			{ user_id: userId, is_deleted: false },
			{
				$set: {
					is_deleted: true,
					is_active: false,
					deleted_at: new Date(),
				},
			},
			{ new: true }
		).lean<IPatient | null>();
	}

	async hardDeletePatient(id: string): Promise<boolean> {
		const result = await Patient.deleteOne({ _id: id });
		return result.deletedCount !== undefined && result.deletedCount > 0;
	}

	async searchPatients(searchTerm: string, limit: number = 20): Promise<IPatient[]> {
		const regex = { $regex: searchTerm, $options: "i" };

		return await Patient.find({
			is_deleted: false,
			$or: [
				{ patient_code: regex },
				{ user_id: regex },
				{ last_test_type: regex },
				{ "emergency_contact.name": regex },
			],
		})
			.limit(limit)
			.lean<IPatient[]>();
	}
}

export default PatientService;
