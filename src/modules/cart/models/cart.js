const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  user_id: { type: String, ref: "User", required: true, unique: true, index: true },
  products_id: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, min: 1, default: 1 },
    },
  ],
  total: { type: Number, min: 0, default: 0 },
});

module.exports = mongoose.model("Cart", CartSchema);