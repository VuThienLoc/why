import Patient from "../models/Patient.model.js";

const seedPatients = async () => {
  try {
    const existingPatients = await Patient.countDocuments();

    if (existingPatients > 0) {
      console.log("✅ Patients already exist. Skipping seed.");
      return;
    }

    const patients = [
      {
        patientCode: "PT202510240001",
        fullName: "Nguyen Van A",
        identityNumber: "001234567890",
        email: "nguyenvana@example.com",
        phoneNumber: "0901234567",
        gender: "male",
        age: 35,
        dateOfBirth: new Date("1990-05-15"),
        address: "123 Le Loi Street, District 1, Ho Chi Minh City",
        emergencyContactName: "Nguyen Thi B",
        emergencyContactPhone: "0907654321",
        lastVisitDate: new Date("2025-10-20"),
        lastTestType: "CBC",
        isActive: true,
      },
      {
        patientCode: "PT202510240002",
        fullName: "Tran Thi C",
        identityNumber: "001234567891",
        email: "tranthic@example.com",
        phoneNumber: "0912345678",
        gender: "female",
        age: 28,
        dateOfBirth: new Date("1997-08-20"),
        address: "456 Nguyen Hue Boulevard, Hoan Kiem, Hanoi",
        emergencyContactName: "Tran Van E",
        emergencyContactPhone: "0918765432",
        lastVisitDate: new Date("2025-10-18"),
        lastTestType: "Blood Chemistry",
        isActive: true,
      },
      {
        patientCode: "PT202510240003",
        fullName: "Le Van D",
        identityNumber: "001234567892",
        phoneNumber: "0923456789",
        gender: "male",
        age: 42,
        dateOfBirth: new Date("1983-03-10"),
        address: "789 Tran Hung Dao Street, Hai Chau, Da Nang",
        emergencyContactName: "Le Thi F",
        emergencyContactPhone: "0929876543",
        lastVisitDate: new Date("2025-10-15"),
        lastTestType: "Urinalysis",
        isActive: true,
      },
      {
        patientCode: "PT202510240004",
        fullName: "Pham Thi G",
        identityNumber: "001234567893",
        email: "phamthig@example.com",
        phoneNumber: "0934567890",
        gender: "female",
        age: 31,
        dateOfBirth: new Date("1994-07-22"),
        address: "321 Vo Van Tan Street, District 3, Ho Chi Minh City",
        emergencyContactName: "Pham Van H",
        emergencyContactPhone: "0935678901",
        lastVisitDate: new Date("2025-10-22"),
        lastTestType: "Lipid Panel",
        isActive: true,
      },
      {
        patientCode: "PT202510240005",
        fullName: "Hoang Van I",
        identityNumber: "001234567894",
        phoneNumber: "0945678901",
        gender: "male",
        age: 55,
        dateOfBirth: new Date("1970-02-14"),
        address: "654 Hai Ba Trung Street, District 1, Ho Chi Minh City",
        emergencyContactName: "Hoang Thi J",
        emergencyContactPhone: "0946789012",
        lastVisitDate: new Date("2025-10-10"),
        lastTestType: "Thyroid Function",
        isActive: true,
      },
    ];

    await Patient.insertMany(patients);
    console.log("✅ Patient seed data inserted successfully!");
  } catch (error) {
    console.error("❌ Error seeding patients:", error);
  }
};

export default seedPatients;
