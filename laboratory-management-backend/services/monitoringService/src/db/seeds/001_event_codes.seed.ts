import connectDB from "../../config/database.config.js";
import EventCode from "../models/EventCode.model.js";
import { EVENT_CODES, SERVICE_NAMES } from "../../constants/event.constant.js";

const eventCodesData = [
  {
    event_code: EVENT_CODES.TEST_ORDER_CREATED,
    event_name: "TEST_ORDER_CREATED",
    description: "Event message used when a new test order is created.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.TEST_ORDER_UPDATED,
    event_name: "TEST_ORDER_UPDATED",
    description: "Event message used when a test order is updated.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.TEST_ORDER_DELETED,
    event_name: "TEST_ORDER_DELETED",
    description: "Event message used when a test order is deleted.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.TEST_RESULT_MODIFIED,
    event_name: "TEST_RESULT_MODIFIED",
    description: "Event message used when a test result is modified.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.COMMENT_ADDED,
    event_name: "COMMENT_ADDED",
    description: "Event message used when a new comment is added to a test result.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.COMMENT_MODIFIED,
    event_name: "COMMENT_MODIFIED",
    description: "Event message used when a comment on a test result is modified.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.COMMENT_DELETED,
    event_name: "COMMENT_DELETED",
    description: "Event message used when a comment on a test result is deleted.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.REVIEW_COMPLETED,
    event_name: "REVIEW_COMPLETED",
    description: "Event message used when a supervisory review is completed.",
    service_name: SERVICE_NAMES.TEST_ORDER_SERVICE,
  },
  {
    event_code: EVENT_CODES.INSTRUMENT_ACTIVATION_CHANGED,
    event_name: "INSTRUMENT_ACTIVATION_CHANGED",
    description: "Event message used when an instrument is activated or deactivated.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.USER_LOCK_STATUS_CHANGED,
    event_name: "USER_LOCK_STATUS_CHANGED",
    description: "Event message used when a user account is locked or unlocked.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.USER_CREATED,
    event_name: "USER_CREATED",
    description: "Event message used when an IAM user account is created.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.USER_PASSWORD_CHANGED,
    event_name: "USER_PASSWORD_CHANGED",
    description: "Event message used when an IAM user resets or changes their password.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.USER_UPDATED,
    event_name: "USER_UPDATED",
    description: "Event message used when an IAM user profile is updated.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.USER_DELETED,
    event_name: "USER_DELETED",
    description: "Event message used when an IAM user account is deleted.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.PATIENT_CREATED,
    event_name: "PATIENT_CREATED",
    description: "Event message used when a new patient is created.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.PATIENT_UPDATED,
    event_name: "PATIENT_UPDATED",
    description: "Event message used when a patient profile is updated.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.PATIENT_DELETED,
    event_name: "PATIENT_DELETED",
    description: "Event message used when a patient is deleted.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.MEDICAL_RECORD_CREATED,
    event_name: "MEDICAL_RECORD_CREATED",
    description: "Event message used when a new medical record is created for a patient.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.MEDICAL_RECORD_UPDATED,
    event_name: "MEDICAL_RECORD_UPDATED",
    description: "Event message used when a medical record is updated.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.MEDICAL_RECORD_DELETED,
    event_name: "MEDICAL_RECORD_DELETED",
    description: "Event message used when a medical record is deleted.",
    service_name: SERVICE_NAMES.PATIENT_SERVICE,
  },
  {
    event_code: EVENT_CODES.INSTRUMENT_CREATED,
    event_name: "INSTRUMENT_CREATED",
    description: "Event message used when a new instrument is registered in the system.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.INSTRUMENT_UPDATED,
    event_name: "INSTRUMENT_UPDATED",
    description: "Event message used when an instrument record is updated.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.INSTRUMENT_DELETED,
    event_name: "INSTRUMENT_DELETED",
    description: "Event message used when an instrument is removed from the system.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.REAGENT_CREATED,
    event_name: "REAGENT_CREATED",
    description: "Event message used when a new reagent is stocked or installed.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.REAGENT_UPDATED,
    event_name: "REAGENT_UPDATED",
    description: "Event message used when reagent information or status changes.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.REAGENT_DELETED,
    event_name: "REAGENT_DELETED",
    description: "Event message used when a reagent is removed from the system.",
    service_name: SERVICE_NAMES.WAREHOUSE_SERVICE,
  },
  {
    event_code: EVENT_CODES.ROLE_CREATED,
    event_name: "ROLE_CREATED",
    description: "Event message used when a new IAM role is created.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.ROLE_UPDATED,
    event_name: "ROLE_UPDATED",
    description: "Event message used when an IAM role definition changes.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
  {
    event_code: EVENT_CODES.ROLE_DELETED,
    event_name: "ROLE_DELETED",
    description: "Event message used when an IAM role is removed.",
    service_name: SERVICE_NAMES.IAM_SERVICE,
  },
];

const seedEventCodes = async (): Promise<void> => {
  try {
    console.log("\n🌱 Starting Event Codes Seeding...");

    await connectDB();

    // Clear existing event codes
    await EventCode.deleteMany({});
    console.log("✅ Cleared existing event codes");

    // Insert new event codes
    const insertedCodes = await EventCode.insertMany(eventCodesData);
    console.log(`✅ Inserted ${insertedCodes.length} event codes`);

    console.log("\n📋 Event Codes Summary:");
    for (const code of insertedCodes) {
    console.log(`   - ${code.event_code}: ${code.event_name} (${code.service_name})`);
    }

    console.log("\n✅ Event Codes Seeding Completed Successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding event codes:", error);
    process.exit(1);
  }
};

seedEventCodes();
