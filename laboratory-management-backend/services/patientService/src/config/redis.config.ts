import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("❌ Patient Service: Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Patient Service: Redis connected successfully");
});

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Patient Service: Redis connection error:", error);
  }
};

export { redisClient, connectRedis };
