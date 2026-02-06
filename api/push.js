import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body = req.body; // JSON from Raspberry Pi

    // Store newest metric at the start of the list
    await redis.lpush("metrics", body);

    // Keep last 5000 entries (prevent infinite growth)
    await redis.ltrim("metrics", 0, 5000);

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Error storing metric:", err);
    return res.status(500).json({ error: "Failed to store metric" });
  }
}
