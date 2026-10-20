const Availability = require("./models/availability");
const User = require("../user/models/user");
const { validateAvailability } = require("./validators/availability-validator");
const logger = require("../../utils/logger");

class AvailabilityService {
  static async createOrUpdate(user_id, data) {
    const normalized = await validateAvailability({ ...data, psychologist_id: user_id });
    const user = await User.findById(user_id);
    if (!user) throw new Error("USER NOT FOUND");
    if (user.role !== "psychologist") throw new Error("INVALID ROLE");

    let availability = user.availability_id
      ? await Availability.findById(user.availability_id)
      : null;

    if (!availability) availability = new Availability(normalized);
    else {
      availability.days = normalized.days;
      availability.slots = normalized.slots;
    }

    await availability.save();
    user.availability_id = availability._id;
    await user.save();
    logger.info(`Availability saved for user ${user_id}`);
    return availability;
  }

  static async deleteForPsychologist(user_id, id) {
    const user = await User.findById(user_id);
    if (!user) throw new Error("USER NOT FOUND");
    if (String(user.availability_id || "") !== String(id)) throw new Error("ACCESS DENIED");

    const availability = await Availability.findByIdAndDelete(id);
    if (!availability) throw new Error("AVAILABILITY NOT FOUND");

    user.availability_id = undefined;
    await user.save();
    return availability;
  }

  static async getByPsychologist(user_id) {
    const user = await User.findById(user_id);
    if (!user) throw new Error("USER NOT FOUND");
    if (!user.availability_id) return null;
    return Availability.findById(user.availability_id);
  }
}

module.exports = AvailabilityService;