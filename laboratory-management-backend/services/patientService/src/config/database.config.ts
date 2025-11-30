import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Connect to patientService database
    await mongoose.connect("mongodb+srv://user:123@cluster0.uevq3rb.mongodb.net/patientService?retryWrites=true&w=majority&appName=Cluster0");
  } catch (error) {
    console.error("❌ MongoDB error:", error);
    process.exit(1);
  }
};

export default connectDB;
