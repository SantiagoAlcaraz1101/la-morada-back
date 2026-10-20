const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  card_last4: { type: String, required: true, match: /^\d{4}$/ },
  card_brand: { type: String, required: true },
  card_name: { type: String, required: true },
  expiration_date: { type: String, required: true },
  user_id: { type: String, ref: "User", required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);