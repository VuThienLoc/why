import { Schema, model } from "mongoose";

const TestItemSchema = new Schema({
  test_type: {           
    type: String,
    required: true,
  },
  code: {                 
    type: String,
    required: true,
  },
  name: {               
    type: String,
    required: true,
  },
  unit: String,           
  ref_min: Number,
  ref_max: Number,
  method: String,        
}, { timestamps: true });

export const TestItem = model("TestItem", TestItemSchema,"testItems");
