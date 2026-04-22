const { Sequelize } = require("sequelize");

const isTestEnv = process.env.NODE_ENV === "test";
const databaseName = isTestEnv
  ? process.env.DB_NAME_TEST || process.env.DB_NAME || "registration_app_test"
  : process.env.DB_NAME || "registration_app";

const sequelize = new Sequelize(
  databaseName,
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false
  }
);

module.exports = sequelize;
