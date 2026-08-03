const sgMail = require("@sendgrid/mail");
const logger = require("../utils/logger");

const connectEmail = () => {
  if (process.env.MAIL_MODE === "console" || !process.env.SENDGRID_API_KEY) {
    logger.warn("Email delivery is running in console mode");
    return null;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  logger.info("Connected to SendGrid");
  return sgMail;
};

module.exports = connectEmail;