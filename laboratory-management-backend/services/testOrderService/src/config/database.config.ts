import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Connect to test_oder_service database
    await mongoose.connect("mongodb+srv://user:123@cluster0.uevq3rb.mongodb.net/test_oder_service?retryWrites=true&w=majority&appName=Cluster0");
  } catch (error) {
    console.error(" MongoDB error:", error);
    // don't exit the process here; allow the caller to decide how to handle DB failures
    // rethrow so callers can catch the error if desired
    throw error;
  }
};

export default connectDB;
