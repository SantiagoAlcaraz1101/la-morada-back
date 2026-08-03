const User = require("./models/user");
const Cart = require("../cart/models/cart");
const { validateUser } = require("./validators/user-validator");
const { hashPassword } = require("../auth/strategies/password-strategy");
const logger = require("../../utils/logger");
const crypto = require("crypto");
const redisClient = require("../../config/redis-config");
const TwilioService = require("../twilio/twilio-service");

// Helper to generate 6-character reset code
function generateCode(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    crypto.randomBytes(length),
    (value) => alphabet[value % alphabet.length]
  ).join("");
}

class UserService {
  // Register new user
  static async register(data) {
    validateUser(data);

    const existingById = await User.findById(data._id);
    if (existingById) throw new Error("ID EXISTS");

    const existingByEmail = await User.findOne({ email: data.email });
    if (existingByEmail) throw new Error("EMAIL EXISTS");

    data.password = await hashPassword(data.password);

    const user = new User({ ...data, role: "patient" });
    await user.save();

    const cart = new Cart({ user_id: user._id, total: 0, products_id: [] });
    await cart.save();

    user.cart_id = cart._id;
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  // Update user
  static async update(userId, updates) {
    const user = await User.findById(userId);
    if (!user) throw new Error("USER NOT FOUND");

    const allowedFields = ["name", "last_name1", "last_name2", "email", "phone", "age", "password"];
    const invalidFields = Object.keys(updates).filter(f => !allowedFields.includes(f));
    if (invalidFields.length) throw new Error("FIELDS NOT UPDATABLE");

    const dataToValidate = { ...user.toObject(), ...updates, password: updates.password, rePassword: updates.password };
    validateUser(dataToValidate, { validatePassword: updates.password !== undefined });

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        user[field] = field === "password" ? await hashPassword(updates.password) : updates[field];
      }
    }

    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  // Get all patients
  static async getPatients() {
    return await User.find({ role: "patient" }).select("-password").lean();
  }

  // Get all psychologists
  static async getPsychologists() {
    return await User.find({ role: "psychologist" }).select("-password").lean();
  }

  // Get psychologists by specialty
  static async getPsychologistsBySpecialty(specialty) {
    if (!specialty || typeof specialty !== "string") throw new Error("INVALID PARAMS");

    const escaped = specialty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    return await User.find({ role: "psychologist", specialty: regex }).select("-password").lean();
  }

  // Delete own user
  static async delete(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("USER NOT FOUND");

    await User.findByIdAndDelete(userId);
    return { message: "User successfully deleted" };
  }

  // Request password reset
  static async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("USER NOT FOUND");

    const code = generateCode(6);
    const ttl = parseInt(process.env.RESET_CODE_TTL, 10) || 900; // 15 minutes default

    // Store code in Redis
    await redisClient.setEx(`reset:${email}`, ttl, code);
    logger.info(`Password reset code stored for ${email}`);

    // Send reset email
    await TwilioService.sendPasswordResetEmail(user, code);

    return { message: "Reset code sent to your email." };
  }

  // Reset password using code
  static async resetPassword(email, code, newPassword) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("USER NOT FOUND");

    const storedCode = await redisClient.get(`reset:${email}`);
    if (!storedCode) throw new Error("CODE EXPIRED OR NOT FOUND");
    if (storedCode !== code) throw new Error("INVALID CODE");

    validateUser({ ...user.toObject(), password: newPassword });
    user.password = await hashPassword(newPassword);
    await user.save();

    await redisClient.del(`reset:${email}`);
    logger.info(`Password successfully reset for ${email}`);

    return { message: "Password successfully updated." };
  }
}

module.exports = UserService;
