import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "UdemyCourse",
    });
    console.log(`server connected to db ${connection.host}`);
  } catch (error) {
    console.log("database error", error);
    process.exit(1);
  }
};
