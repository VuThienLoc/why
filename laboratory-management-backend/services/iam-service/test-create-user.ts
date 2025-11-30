import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "services/iam-service/.env" });

const API_BASE_URL = process.env.IAM_SERVICE_URL || "http://localhost:3000";
const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || "http://localhost:5001";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "internal-service-secret-key-2025";

interface TestUser {
  email: string;
  fullName: string;
  identityNumber: string;
  gender: "male" | "female" | "other";
  age: number;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: string;
}

const testUser: TestUser = {
  email: `testuser-${Date.now()}@test.com`,
  fullName: "Test User",
  identityNumber: `ID${Date.now()}`,
  gender: "male",
  age: 30,
  dateOfBirth: "1994-05-15",
  phoneNumber: "0912345678",
  address: "123 Test Street",
  password: "TestPassword123",
  role: "USER",
};

async function runTest() {
  console.log("\n========== TEST: CREATE USER & PATIENT ==========\n");
  console.log(`📍 IAM Service URL: ${API_BASE_URL}`);
  console.log(`📍 Patient Service URL: ${PATIENT_SERVICE_URL}`);
  console.log(`\n📝 Creating test user:`, testUser);

  try {
    // Step 1: Create user in IAM service
    console.log("\n\n[STEP 1] 🔵 Creating user in IAM service...");
    const createUserResponse = await axios.post(
      `${API_BASE_URL}/api/internal/user/create`,
      testUser,
      {
        headers: {
          "x-internal-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ User created successfully!`);
    const newUserId = createUserResponse.data.user._id;
    console.log(`   User ID: ${newUserId}`);
    console.log(`   Email: ${createUserResponse.data.user.email}`);
    console.log(`   Full Name: ${createUserResponse.data.user.fullName}`);
    console.log(`   Response:`, JSON.stringify(createUserResponse.data, null, 2));

    // Step 2: Get user to verify
    console.log("\n\n[STEP 2] 🔵 Verifying user in IAM service...");
    const getUserResponse = await axios.get(`${API_BASE_URL}/api/internal/${newUserId}`, {
      headers: {
        "x-internal-api-key": INTERNAL_API_KEY,
      },
    });

    console.log(`✅ User verified in IAM service`);
    console.log(`   Response:`, JSON.stringify(getUserResponse.data, null, 2));

    // Step 3: Get all patients to find the one created by IAM
    console.log("\n\n[STEP 3] 🔵 Checking patients in Patient service...");
    const getAllPatientsResponse = await axios.get(
      `${PATIENT_SERVICE_URL}/api/patients/getAll/?populateUser=true`,
      {
        headers: {
          "x-internal-api-key": INTERNAL_API_KEY,
        },
      }
    );

    console.log(`✅ Retrieved all patients`);
    console.log(`   Total patients: ${getAllPatientsResponse.data.total}`);

    // Find the patient created for this user
    const createdPatient = getAllPatientsResponse.data.patients.find(
      (p: any) => p.user_id === newUserId
    );

    if (createdPatient) {
      console.log(`\n✅ Patient found for user ${newUserId}!`);
      console.log(`   Patient ID: ${createdPatient._id}`);
      console.log(`   Patient Code: ${createdPatient.patient_code}`);
      console.log(`   User ID: ${createdPatient.user_id}`);
      console.log(`   Full patient data:`, JSON.stringify(createdPatient, null, 2));
    } else {
      console.log(`\n❌ Patient NOT found for user ${newUserId}!`);
      console.log(`\n🔍 All patients in database:`);
      getAllPatientsResponse.data.patients.forEach((p: any, idx: number) => {
        console.log(`\n   [${idx + 1}] Patient ID: ${p._id}`);
        console.log(`       Patient Code: ${p.patient_code}`);
        console.log(`       User ID: ${p.user_id}`);
        if (p.user_id === newUserId) {
          console.log(`       ⚠️ THIS MATCHES OUR USER!`);
        }
      });
    }

    // Step 4: Try to get patient detail
    if (createdPatient) {
      console.log("\n\n[STEP 4] 🔵 Getting patient detail...");
      try {
        const getPatientResponse = await axios.get(
          `${PATIENT_SERVICE_URL}/api/patients/viewDetail/${createdPatient._id}?populateUser=true`,
          {
            headers: {
              "x-internal-api-key": INTERNAL_API_KEY,
            },
          }
        );

        console.log(`✅ Patient detail retrieved`);
        console.log(`   Response:`, JSON.stringify(getPatientResponse.data, null, 2));
      } catch (error: any) {
        console.log(`❌ Error getting patient detail:`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.message}`);
      }
    }

    // Step 5: Check if user info is in patient (if populateUser enabled)
    console.log("\n\n[STEP 5] 🔵 Analyzing user-patient relationship...");
    if (createdPatient && createdPatient.user) {
      console.log(`✅ User data found in patient!`);
      console.log(`   User info:`, JSON.stringify(createdPatient.user, null, 2));
    } else {
      console.log(`❌ User data NOT found in patient`);
      console.log(`   User field: ${createdPatient?.user || "undefined"}`);
      console.log(`\n   Possible issues:`);
      console.log(`   1. Patient service didn't auto-create patient on user creation`);
      console.log(`   2. User ID mismatch between IAM and Patient services`);
      console.log(`   3. populateUser query parameter not working`);
    }

    console.log("\n\n========== TEST COMPLETED ==========\n");
  } catch (error: any) {
    console.error("\n❌ ERROR during test:");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error(`   No response received:`, error.message);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.error("\n========== TEST FAILED ==========\n");
    process.exit(1);
  }
}

runTest().catch(console.error);
