const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: String, ref: "User", required: true },
  psychologist_id: { type: String, ref: "User", required: true },
  scheduled_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  day: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  status: {
    type: String,
    enum: ["pendiente", "confirmada", "completada", "cancelada"],
    default: "pendiente",
  },
}, { timestamps: true });

appointmentSchema.index({ psychologist_id: 1, scheduled_at: 1 });
appointmentSchema.index({ patient_id: 1, scheduled_at: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);