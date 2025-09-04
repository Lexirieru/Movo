import env from "dotenv";
env.config();

import mongoose from "mongoose";

mongoose.set("strictQuery", false);

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!!, {
      serverSelectionTimeoutMS: 30000, // 10 detik
    });

    console.log(`Database Connected : ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
}
