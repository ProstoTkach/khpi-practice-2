require("dotenv").config();
const express = require("express");
const usersRoutes = require("./routes/usersRoutes");
const profilesRoutes = require("./routes/profilesRoutes");
const scoresRoutes = require("./routes/scoresRoutes");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", usersRoutes);
app.use("/", profilesRoutes);
app.use("/", scoresRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  // Handle unique email conflict from PostgreSQL.
  if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "Unique constraint violation." });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({ message: "Invalid relation: user_id does not exist." });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map((item) => item.message)
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
