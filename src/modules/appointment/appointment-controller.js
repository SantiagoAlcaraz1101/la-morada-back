const AppointmentService = require("./appointment-service");
const { handleError } = require("../../handlers/error-handler");
const logger = require("../../utils/logger");

class AppointmentController {
  static async create(req, res) {
    try {
      const appointmentData = {
        patient_id: req.user.role === "patient" ? req.user.user_id : String(req.body.patient_id),
        psychologist_id:
          req.user.role === "psychologist" ? req.user.user_id : String(req.body.psychologist_id),
        start: req.body.start,
      };

      const appointment = await AppointmentService.createAppointment(appointmentData);
      res.status(201).json({ success: true, appointment });
    } catch (err) {
      logger.error(`AppointmentController.create: ${err.message}`);
      handleError(res, err);
    }
  }

  static async remove(req, res) {
    try {
      const appointment = await AppointmentService.deleteAppointment(req.params.id, req.user);
      res.status(200).json({ success: true, appointment });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getAll(req, res) {
    try {
      const appointments = req.user.role === "patient"
        ? await AppointmentService.getAppointmentsByPatient(req.user.user_id)
        : await AppointmentService.getAppointmentsByPsychologist(req.user.user_id);
      res.json({ success: true, appointments });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async updateStatus(req, res) {
    try {
      const appointment = await AppointmentService.updateAppointmentStatus(
        req.params.id,
        req.user,
        req.body.status
      );
      res.status(200).json({ success: true, appointment });
    } catch (err) {
      handleError(res, err);
    }
  }
}

module.exports = AppointmentController;