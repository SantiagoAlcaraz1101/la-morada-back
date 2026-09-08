const jwt = require("jsonwebtoken");
const redisClient = require("../../../config/redis-config");

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_ACCESS_EXPIRES = Number.parseInt(process.env.JWT_ACCESS_EXPIRES);

class JwtStrategy {
  // Generate new JWT and store in Redis
  static async generateToken(user_id, role) {
    const token = jwt.sign({ user_id, role }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES,
      algorithm: "HS256",
    });

    const redisKey = `user:${user_id}`;
    await redisClient.del(redisKey); // Remove old token if exists
    await redisClient.setEx(redisKey, JWT_ACCESS_EXPIRES, token); // Save new token in Redis

    return token;
  }

  // Verify JWT and check if it's valid in Redis
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const redisKey = `user:${decoded.user_id}`;
      const storedToken = await redisClient.get(redisKey);

      if (!storedToken || storedToken !== token) return null; // Invalid or expired
      return { user_id: decoded.user_id, role: decoded.role, exp: decoded.exp };
    } catch {
      return null; // Invalid signature or expired
    }
  }

  // Invalidate user token (logout)
  static async invalidateToken(user_id) {
    const redisKey = `user:${user_id}`;
    await redisClient.del(redisKey);
  }
}

module.exports = JwtStrategy;
