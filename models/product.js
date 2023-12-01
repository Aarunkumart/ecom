import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "pls enter product name"],
  },
  description: {
    type: String,
    required: [true, "pls enter description"],
  },
  price: {
    type: Number,
    required: [true, "pls enter product price"],
  },
  stock: {
    type: Number,
    required: [true, "pls enter product stock"],
  },
  images: [{ public_id: String, url: String }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

export const Product = mongoose.model("Product", schema);
