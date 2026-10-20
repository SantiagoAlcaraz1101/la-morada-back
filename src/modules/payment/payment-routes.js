const express = require("express");
const { validToken } = require("../../middlewares/jwt-middleware");
const PaymentController = require("./payment-controller");

const router = express.Router();

router.post("/", validToken, PaymentController.create);
router.get("/", validToken, PaymentController.getUserPayments);
router.post("/checkout", validToken, PaymentController.checkout);
router.delete("/:paymentId", validToken, PaymentController.delete);

module.exports = router;