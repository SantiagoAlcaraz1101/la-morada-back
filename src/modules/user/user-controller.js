const UserService = require("./user-service");
const { handleError } = require("../../handlers/error-handler");
const logger = require("../../utils/logger");

class UserController {
  // Register new user
  static async register(req, res) {
    try {
      const { password, rePassword, ...rest } = req.body;
      if (password !== rePassword) throw new Error("PASSWORD_MISMATCH");

      const user = await UserService.register({ ...rest, password });
      res.status(201).json({ success: true, message: "User successfully registered", user });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Update user
  static async update(req, res) {
    try {
      const { password, rePassword, ...rest } = req.body;
      if (password && password !== rePassword) throw new Error("PASSWORD_MISMATCH");

      if (String(req.params.id) !== String(req.user.user_id)) throw new Error("ACCESS DENIED");
      const updatedUser = await UserService.update(req.user.user_id, { ...rest, password });
      res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Get all patients
  static async getPatients(req, res) {
    try {
      const users = await UserService.getPatients();
      res.status(200).json({ success: true, users });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Get all psychologists
  static async getPsychologists(req, res) {
    try {
      const users = await UserService.getPsychologists();
      res.status(200).json({ success: true, users });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Get psychologists by specialty
  static async getPsychologistsBySpecialty(req, res) {
    try {
      const { specialty } = req.query;
      const psychologists = await UserService.getPsychologistsBySpecialty(specialty);
      res.status(200).json({ success: true, psychologists });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Delete own user
  static async deleteUser(req, res) {
    try {
      const userId = req.user.user_id;
      const result = await UserService.delete(userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      logger.error(`UserController.deleteUser: ${err.message}`);
      handleError(res, err);
    }
  }

  // Request password reset
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const result = await UserService.requestPasswordReset(email);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      handleError(res, err);
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;
      if (newPassword !== confirmPassword) throw new Error("PASSWORD_MISMATCH");

      const result = await UserService.resetPassword(email, code, newPassword);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      handleError(res, err);
    }
  }
}

module.exports = UserController;
