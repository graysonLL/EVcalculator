import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    console.log("MONGO_URL not set. Skipping MongoDB connection.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, { family: 4 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 1 indicates failure, 0 indicates success
  }
};

export default connectDB;
