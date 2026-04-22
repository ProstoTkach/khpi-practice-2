const express = require("express");
const usersController = require("../controllers/usersController");

const router = express.Router();

router.post("/users", usersController.createUser);
router.get("/users", usersController.getAllUsers);
router.get("/users-with-five-scores", usersController.getUsersWithFiveScores);
router.get("/users-max-score", usersController.getMaxScoreWithUser);
router.get("/users/:id", usersController.getUserById);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

module.exports = router;
