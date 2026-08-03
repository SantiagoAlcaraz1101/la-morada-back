const AvailabilityService = require("./availability-service");
const { handleError } = require("../../handlers/error-handler");
const logger = require("../../utils/logger");

class AvailabilityController {

  // Create or update availability
  static async upsert(req, res) {
    try {
      const availability = await AvailabilityService.createOrUpdate(
        req.user.user_id,
        req.body
      );
      res.status(200).json({ success: true, availability });
    } catch (err) {
      logger.error(`AvailabilityController.upsert: ${err.message}`);
      handleError(res, err);
    }
  }

  // Delete appointment
  static async remove(req, res) {
    try {
      const result = await AvailabilityService.deleteForPsychologist(req.user.user_id, req.params.id);
      res.status(200).json({ success: true, result });
    } catch (err) {
      logger.error(`AvailabilityController.remove: ${err.message}`);
      handleError(res, err);
    }
  }

  // Get availability for user
  static async get(req, res) {
    try {
      const availability = await AvailabilityService.getByPsychologist(
        req.user.user_id
      );
      res.json({ success: true, availability });
    } catch (err) {
      logger.error(`AvailabilityController.get: ${err.message}`);
      handleError(res, err);
    }
  }
}

module.exports = AvailabilityController;
