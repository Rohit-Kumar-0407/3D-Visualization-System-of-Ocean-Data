const redis = require("redis");
const config = require("../config/env");

let client;

async function connectRedisClient() {
  client = redis.createClient({ url: config.redisUrl });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
}

async function getCached(key) {
  if (!client) return null;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCached(key, data, ttl = 3600) {
  if (!client) return;
  await client.setEx(key, ttl, JSON.stringify(data));
}

async function connectRedis() {
  await connectRedisClient();
}

module.exports = { getCached, setCached, connectRedis };