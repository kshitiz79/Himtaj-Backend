// models/products.model.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  image: { type: String, required: true }, // Primary image
  additionalImages: [{ type: String }], // Array to store secondary images
  size: { type: String },
  color: { type: String },
  metal: { type: String },
  rating: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isTrending: { type: Boolean, default: false }
}, { timestamps: true });

const Products = mongoose.model("Product", ProductSchema);

module.exports = Products;
