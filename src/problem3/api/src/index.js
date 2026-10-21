const express = require("express");
const { Pool } = require("pg");
const Redis = require("ioredis");

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432 // default to 5432
});

const redis = new Redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379 }); // default to 6379

// Removed openning and closing db the connecting for each request
// Proper implementation must be handled by developer. I'm providing the direction
app.get("/api/now", async (req, res) => {
  try {

    const result = await pool.query("SELECT NOW()");


    await redis.set("last_call", Date.now());
    res.json({ ok: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("API running on 3000"));

// We must handle graceful shutdown
// This is for a developer to implement
