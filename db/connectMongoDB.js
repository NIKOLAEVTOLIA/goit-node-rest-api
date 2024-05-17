import mongoose from "mongoose";

export default async function connectMongoDB() {
  try {
    const uri = process.env.DB_URI;
    await mongoose.connect(uri, {});
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
}
