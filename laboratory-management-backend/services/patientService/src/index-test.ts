import express from "express";
import connectDB from "./config/database.config.js";

const app = express();

// Test database connection
connectDB();

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Patient Service Test" });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
