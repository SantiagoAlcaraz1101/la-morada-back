const rateLimit = require('express-rate-limit');

const RATELIMIT = Number(process.env.RATELIMIT) || 15 * 60 * 1000;

const loginLimiter = rateLimit({
  windowMs: RATELIMIT, // 15 min
  max: process.env.NODE_ENV === 'test' ? 100 : 5, // evita interferencia entre casos automatizados
  message: "Demasiados intentos de login, intenta mas tarde",
});

module.exports = { loginLimiter };
