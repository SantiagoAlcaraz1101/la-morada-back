const Appointment = require("./models/appointment");
const User = require("../user/models/user");
const Availability = require("../availability/models/availability");
const TwilioService = require("../twilio/twilio-service");
const logger = require("../../utils/logger");

const TIME_ZONE = process.env.APP_TIMEZONE || "America/Bogota";
const ALLOWED_STATUSES = new Set(["pendiente", "confirmada", "completada", "cancelada"]);

function normalizeDay(day) {
  return String(day)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function localDateParts(date) {
  const formatter = new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    day: normalizeDay(parts.weekday),
    time: `${parts.hour}:${parts.minute}`,
  };
}

function addHour(time) {
  const [hour, minute] = time.split(":").map(Number);
  return `${String(hour + 1).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function ownsAppointment(appointment, user) {
  return (
    (user.role === "patient" && String(appointment.patient_id) === String(user.user_id)) ||
    (user.role === "psychologist" &&
      String(appointment.psychologist_id) === String(user.user_id))
  );
}

class AppointmentService {
  static async createAppointment(data) {
    const patient = await User.findById(String(data.patient_id));
    const psychologist = await User.findById(String(data.psychologist_id));
    if (patient?.role !== "patient") throw new Error("INVALID PATIENT");
    if (psychologist?.role !== "psychologist") {
      throw new Error("INVALID PSYCHOLOGIST");
    }

    const availability = await Availability.findById(psychologist.availability_id);
    if (!availability) throw new Error("PSYCHOLOGIST HAS NO AVAILABILITY");

    const scheduledAt = new Date(data.start);
    if (Number.isNaN(scheduledAt.getTime())) throw new Error("INVALID START DATE");
    if (scheduledAt <= new Date()) throw new Error("DATE MUST BE IN THE FUTURE");

    const endAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
    const { day, time: start } = localDateParts(scheduledAt);
    const end = addHour(start);

    if (!availability.days.map(normalizeDay).includes(day)) throw new Error("DAY NOT AVAILABLE");

    const validSlot = availability.slots.some(
      (slot) => start >= slot.start && end <= slot.end
    );
    if (!validSlot) throw new Error("TIME NOT AVAILABLE IN SLOT");

    const overlapping = await Appointment.findOne({
      psychologist_id: String(data.psychologist_id),
      status: { $ne: "cancelada" },
      scheduled_at: { $lt: endAt },
      end_at: { $gt: scheduledAt },
    });
    if (overlapping) throw new Error("TIME ALREADY BOOKED");

    const appointment = await Appointment.create({
      patient_id: String(data.patient_id),
      psychologist_id: String(data.psychologist_id),
      scheduled_at: scheduledAt,
      end_at: endAt,
      day,
      start,
      end,
      status: "pendiente",
    });

    await TwilioService.sendAppointmentEmail({ patient, psychologist, appointment });
    logger.info(`Appointment created: ${appointment._id}`);
    return appointment;
  }

  static async updateAppointmentStatus(appointmentId, user, newStatus) {
    const appointment = await Appointment.findById(String(appointmentId));
    if (!appointment) throw new Error("APPOINTMENT NOT FOUND");
    if (!ownsAppointment(appointment, user)) throw new Error("ACCESS DENIED");
    if (!ALLOWED_STATUSES.has(newStatus)) throw new Error("INVALID STATUS");

    if (user.role === "patient" && newStatus !== "cancelada") throw new Error("ACCESS DENIED");
    if (appointment.status === "completada") throw new Error("CANNOT CHANGE COMPLETED APPOINTMENT");
    if (appointment.status === "cancelada") throw new Error("CANNOT CHANGE CANCELLED APPOINTMENT");

    appointment.status = newStatus;
    await appointment.save();
    return appointment;
  }

  static async deleteAppointment(id, user) {
    const appointment = await Appointment.findById(String(id));
    if (!appointment) throw new Error("APPOINTMENT NOT FOUND");
    if (!ownsAppointment(appointment, user)) throw new Error("ACCESS DENIED");

    appointment.status = "cancelada";
    await appointment.save();
    return appointment;
  }

  static getAppointmentsByPatient(patient_id) {
    return Appointment.find({ patient_id: String(patient_id) }).sort({ scheduled_at: 1 });
  }

  static getAppointmentsByPsychologist(psychologist_id) {
    return Appointment.find({ psychologist_id: String(psychologist_id) }).sort({ scheduled_at: 1 });
  }
}

module.exports = AppointmentService;
