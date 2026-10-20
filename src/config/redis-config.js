const { createClient } = require("redis");
const logger = require("../utils/logger");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => logger.error(`Redis Client Error: ${err.message}`));
redisClient.on("connect", () => logger.info("Connected to Redis"));
redisClient.on("ready", () => logger.info("Redis client ready"));

async function connectIfNeeded() {
  if (!redisClient.isOpen) await redisClient.connect();
  return redisClient;
}

async function disconnectIfNeeded() {
  if (redisClient.isOpen) await redisClient.quit();
}

redisClient.connectIfNeeded = connectIfNeeded;
redisClient.disconnectIfNeeded = disconnectIfNeeded;

module.exports = redisClient;