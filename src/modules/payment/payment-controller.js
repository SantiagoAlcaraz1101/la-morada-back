const PaymentService = require("./payment-service");
const { handleError } = require("../../handlers/error-handler");

class PaymentController {
  static async create(req, res) {
    try {
      const payment = await PaymentService.createPayment(req.user.user_id, req.body);
      res.status(201).json({ success: true, payment });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getUserPayments(req, res) {
    try {
      const payments = await PaymentService.getPaymentsByUser(req.user.user_id);
      res.status(200).json({ success: true, payments });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async delete(req, res) {
    try {
      const payment = await PaymentService.deletePayment(
        req.user.user_id,
        req.params.paymentId
      );
      res.status(200).json({ success: true, payment });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async checkout(req, res) {
    try {
      const transaction = await PaymentService.simulateCheckout(
        req.user.user_id,
        req.body.payment_id
      );
      res.status(200).json({ success: true, transaction });
    } catch (err) {
      handleError(res, err);
    }
  }
}

module.exports = PaymentController;