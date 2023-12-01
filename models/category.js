import mongoose from "mongoose";

const schema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "pls enter a category"],
  },
});

export const Category = mongoose.model("Category", schema);
