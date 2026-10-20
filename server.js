require("dotenv").config();

const app = require("./src/app");
const connectMongo = require("./src/config/mongo-config");
const redisClient = require("./src/config/redis-config");
const connectEmail = require("./src/config/twilio-config");
const logger = require("./src/utils/logger");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectMongo();
  await redisClient.connectIfNeeded();
  connectEmail();

  const server = app.listen(PORT, () => {
    logger.info(`La Morada API running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    logger.info("Shutting down La Morada API");
    server.close(async () => {
      await redisClient.disconnectIfNeeded();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  logger.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});