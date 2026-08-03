const User = require("../../user/models/user");

const DAYS_OF_WEEK = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

function normalizeDay(day) {
  return String(day)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function timeToMinutes(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time))) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function validateAvailability(data) {
  if (!data.psychologist_id) throw new Error("PSYCHOLOGIST_ID REQUIRED");

  const psychologist = await User.findById(data.psychologist_id);
  if (!psychologist) throw new Error("USER NOT FOUND");
  if (psychologist.role !== "psychologist") throw new Error("INVALID ROLE");

  if (!Array.isArray(data.days) || data.days.length === 0) throw new Error("DAYS REQUIRED");
  if (!Array.isArray(data.slots) || data.slots.length === 0) throw new Error("SLOTS REQUIRED");

  const normalizedDays = data.days.map(normalizeDay);
  if (new Set(normalizedDays).size !== normalizedDays.length) throw new Error("DUPLICATE DAY");
  if (normalizedDays.some((day) => !DAYS_OF_WEEK.includes(day))) throw new Error("INVALID DAY");

  for (const slot of data.slots) {
    const start = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);
    if (start === null || end === null || start >= end) throw new Error("INVALID SLOT TIME");
  }

  return { days: normalizedDays, slots: data.slots };
}

module.exports = { validateAvailability, normalizeDay };