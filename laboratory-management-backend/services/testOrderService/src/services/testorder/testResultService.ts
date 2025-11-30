import { TestResultRepository } from "../../repositories/testResult.repository.js";
import { TestItem } from "../../db/models/TestItem.model.js";
import { Types } from "mongoose";
import { TestOrderRepository } from "../../repositories/testOrderRepository.js";
import { TestOrderResult } from "../../db/models/TestResult.model.js";
import instrumentServiceClient from "../warehouse/instrumentServiceClient.js";
import reagentServiceClient from "../warehouse/reagentServiceClient.js";
import patientServiceClient from "../patient/patientServiceClient.js";
export const TestResultService = {

    createRandomResults: async (test_order_id: string, test_item_ids: string[]) => {
        // Lấy Test Order 
        const order = await TestOrderRepository.findById(test_order_id);
        if (!order) throw new Error("Test Order not found");
        
        // Lấy Patient
        const patient = await patientServiceClient.getPatientById(order.patient_id);
        if (!patient) throw new Error("Patient not found");

        // Lấy instrument
        const instrument = await instrumentServiceClient.getInstrumentById(order.instrument_id || "");
        if (!instrument) throw new Error("Instrument not found");

        // Lấy tên reagent
        const reagent_usages = order.reagent_usages || [];
        const reagentArray = await reagentServiceClient.getReagentsByIds(
            reagent_usages.map(ru => ru.reagent_id)
        );
        const reagent_names = reagentArray ? Array.from(reagentArray.values()).map(r => r.reagent_name) : [];

        // Lấy thông tin các Test Item
        const items = await TestItem.find({ _id: { $in: test_item_ids } });

        const results = items.map(item => {
            // Random tỷ lệ: low 30%, normal 40%, high 30%
            const roll = Math.random(); // [0, 1)

            let randomValue: number;
            let status: "normal" | "high" | "low" = "normal";

            if (roll < 0.3) {
                status = "low";
                randomValue = item.ref_min! - Math.random() * (item.ref_min! * 0.2);
            }
            else if (roll < 0.7) {
                status = "normal";
                randomValue = Math.random() * (item.ref_max! - item.ref_min!) + item.ref_min!;
            }
            else {
                status = "high";
                randomValue = item.ref_max! + Math.random() * (item.ref_max! * 0.2);
            }


            return {
                test_order_id: new Types.ObjectId(test_order_id),
                test_item_id: item._id.toString(),
                user_id: patient.user_id,
                patient_id: order.patient_id,
                patient_name: order.patient_name ?? "",
                instrument_name: instrument.instrument_name,
                reagent_names: reagent_names,
                test_type: item.test_type,
                name: item.name,
                code: item.code,
                unit: item.unit,
                result_value: parseFloat(randomValue.toFixed(2)),
                result_status: status,
                reviewed: false,
                reviewer_comment: "",
                is_deleted: false,
                deleted_at: null,
            };
        });

        return TestResultRepository.createMany(results);
    },


    getTestOrdersWithResultsSummary: async (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;

        const result = await TestOrderResult.aggregate([
            { $match: { is_deleted: false } },

            {
                $group: {
                    _id: "$test_order_id",
                    user_id: {$first: "$user_id" },
                    patient_id: { $first: "$patient_id" },
                    patient_name: { $first: "$patient_name" },
                    test_type: { $first: "$test_type" },
                    totalResults: { $sum: 1 },
                    resultsSample: { $push: "$$ROOT" }
                }
            },

            { $sort: { _id: -1 } },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                test_order_id: "$_id",
                                user_id: 1,
                                patient_id: 1,
                                patient_name: 1,
                                test_type: 1,
                                totalResults: 1,
                                resultsSample: 1
                            }
                        }
                    ],

                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const data = result[0].data;
        const totalCount = result[0].totalCount[0]?.count || 0;

        return { data, totalCount };
    },



    getTestResultByPatientIdService: async (patient_id: string, page = 1, limit = 10) => {
        if (!patient_id) {
            throw new Error("patient_id is required");
        }
        return TestResultRepository.findByPatientId(patient_id, page, limit);
    },
    
    getTestResultByUserIdService: async (user_id: string, page = 1, limit = 10) => {
        if (!user_id) {
            throw new Error("user_id is required");
        }
        return TestResultRepository.findByUserId(user_id, page, limit);
    },

    async softDeleteByOrderId(test_order_id: any) {
        await TestResultRepository.softDeleteByOrderId(test_order_id);
        return { success: true, message: "Soft-deleted results for order" };
    },


    async updateTestResult(
        id: string,
        updateData: {
            result_value?: number;
            reviewed?: boolean;
            reviewer_comment?: string;
            result_status?: "normal" | "high" | "low";
        }
    ) {
        // Lấy record hiện tại
        const existing = await TestResultRepository.findById(id);
        if (!existing || existing.is_deleted) {
            throw new Error("Test Result not found or already deleted");
        }

        // Nếu result_value thay đổi, cần lấy ref_min/ref_max từ TestItem
        if (updateData.result_value !== undefined) {
            const testItem = await TestItem.findById(existing.test_item_id);
            if (!testItem) {
                throw new Error("Test Item not found");
            }

            let status: "normal" | "high" | "low" = "normal";
            if (updateData.result_value < testItem.ref_min!) status = "low";
            else if (updateData.result_value > testItem.ref_max!) status = "high";

            updateData.result_status = status;
        }

        const updated = await TestResultRepository.updateById(
            new Types.ObjectId(id),
            updateData
        );

        return {
            success: true,
            message: "Test Result updated successfully",
            data: updated,
        };
    },


    async searchResults(keyword: string, page: number, limit: number) {
        const filter: any = { is_deleted: false };

        if (Types.ObjectId.isValid(keyword)) {
            // Nếu keyword là ObjectId → tìm theo test_order_id
            filter.test_order_id = new Types.ObjectId(keyword);
        } else if (keyword.trim() !== "") {
            // Nếu keyword là chữ → tìm theo patient_name hoặc test_type
            filter.$or = [
                { patient_name: { $regex: keyword, $options: "i" } },
                { test_type: { $regex: keyword, $options: "i" } },
                { name: { $regex: keyword, $options: "i" } },
            ];
        }

        const total = await TestOrderResult.countDocuments(filter);

        const results = await TestOrderResult.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        return { results, total };
    },
};



