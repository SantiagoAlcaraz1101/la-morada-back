const crypto = require("crypto");
const Payment = require("./models/payment");
const User = require("../user/models/user");
const CartService = require("../cart/cart-service");
const { validatePayment } = require("./validators/payment-validator");
const logger = require("../../utils/logger");

function detectBrand(number) {
  if (/^4/.test(number)) return "Visa";
  if (/^5[1-5]/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "American Express";
  return "Tarjeta";
}

class PaymentService {
  static async createPayment(userId, data) {
    validatePayment(data);
    const user = await User.findById(userId);
    if (!user) throw new Error("USER NOT FOUND");

    const normalizedNumber = String(data.card_number).replace(/\s/g, "");
    const payment = await Payment.create({
      card_last4: normalizedNumber.slice(-4),
      card_brand: detectBrand(normalizedNumber),
      card_name: data.card_name.trim(),
      expiration_date: data.expiration_date,
      user_id: userId,
    });

    logger.info(`Tokenless payment reference created for user ${user.email}`);
    return payment;
  }

  static getPaymentsByUser(userId) {
    return Payment.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
  }

  static async deletePayment(userId, paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("PAYMENT NOT FOUND");
    if (String(payment.user_id) !== String(userId)) throw new Error("ACCESS DENIED");
    await payment.deleteOne();
    return payment;
  }

  static async simulateCheckout(userId, paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("PAYMENT NOT FOUND");
    if (String(payment.user_id) !== String(userId)) throw new Error("ACCESS DENIED");

    const cart = await CartService.getCart(userId);
    if (!cart.products_id.length) throw new Error("CART EMPTY");

    const result = {
      transaction_id: crypto.randomUUID(),
      status: "simulated_approved",
      amount: cart.total,
      currency: "COP",
      card_last4: payment.card_last4,
      processed_at: new Date().toISOString(),
    };

    await CartService.clearCart(userId);
    return result;
  }
}

module.exports = PaymentService;