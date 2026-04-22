const { Pool } = require("pg");

const isTestEnv = process.env.NODE_ENV === "test";
const databaseName = isTestEnv
  ? process.env.DB_NAME_TEST || process.env.DB_NAME || "registration_app_test"
  : process.env.DB_NAME || "registration_app";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
