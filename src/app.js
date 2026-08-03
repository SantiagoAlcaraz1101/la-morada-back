const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const logger = require("./utils/logger");
const requestLogger = require("./middlewares/logger-middleware");
const { handleError } = require("./handlers/error-handler");

const {
  authRoutes,
  userRoutes,
  appointmentRoutes,
  availabilityRoutes,
  productRoutes,
  cartRoutes,
  postRoutes,
  podcastRoutes,
  paymentRoutes,
} = require("./modules");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:4200")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS ORIGIN NOT ALLOWED"));
  },
  exposedHeaders: ["x-new-token"],
}));
app.use(requestLogger);
app.use(helmet());

app.get("/", (req, res) => {
  res.json({ message: "La Morada API", status: "ok" });
  logger.http("GET /");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "la-morada-back" });
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/availability", availabilityRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/post", postRoutes);
app.use("/podcast", podcastRoutes);
app.use("/payment", paymentRoutes);

app.use((err, req, res, next) => {
  handleError(res, err);
});

module.exports = app;