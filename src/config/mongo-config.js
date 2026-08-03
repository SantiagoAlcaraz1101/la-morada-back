const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });
    logger.info(`Connected to MongoDB database ${process.env.DB_NAME}`);
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectMongo;