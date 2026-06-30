import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/Mini-project"; // Replace "your_database_name" with your actual database name

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      throw new Error("Failed to connect to the database");
    }
  }
}