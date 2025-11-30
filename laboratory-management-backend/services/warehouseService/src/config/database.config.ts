import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = "mongodb+srv://user:123@cluster0.uevq3rb.mongodb.net/warehouseService?retryWrites=true&w=majority&appName=Cluster0";

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected to:", mongoose.connection.db?.databaseName);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
