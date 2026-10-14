import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { connectRedis } from "./redis.connection.js";

export const connectDB = async (app, port) => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log("Database Connected");
    await connectRedis()
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
    console.log("Database Connection Failed");
    process.exit(1);
  }
};