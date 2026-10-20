const argon2 = require("argon2");
const logger = require("../../../utils/logger");

class AuthValidator {
  static validateLogin(email, password) {
    if (!email || !password) {
      logger.error("Missing credentials");
      throw new Error("MISSING CREDENTIALS");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      logger.error(`Invalid email format: ${email}`);
      throw new Error("INVALID EMAIL");
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      logger.error("Password does not meet security requirements");
      throw new Error("INVALID PASSWORD");
    }

    return true;
  }

  static async validatePassword(hash, plainPassword) {
    const isValid = await argon2.verify(hash, plainPassword);
    if (!isValid) {
      logger.error("Invalid password");
      throw new Error("WRONG PASSWORD");
    }
    return true;
  }

  static validateRole(userRole, allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
      logger.error(`Access denied for role: ${userRole}`);
      throw new Error("ACCESS DENIED");
    }
    return true;
  }
}

module.exports = AuthValidator;
