import { Request, Response } from "express";
import { TestItem } from "../db/models/TestItem.model.js";

export const getAllTestItems = async (req: Request, res: Response) => {
    try {
        const { test_type } = req.query;

        let filter: any = {};
        if (test_type) filter.test_type = test_type;

        const items = await TestItem.find(filter).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};


export const getTestItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await TestItem.findById(id); 


        if (!item) {
            return res.status(404).json({
                success: false,
                message: "TestItem not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
