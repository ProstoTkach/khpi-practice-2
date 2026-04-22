const express = require("express");
const scoresController = require("../controllers/scoresController");

const router = express.Router();

router.post("/scores", scoresController.createScore);
router.get("/scores", scoresController.getAllScores);
router.get("/scores/:id", scoresController.getScoreById);
router.put("/scores/:id", scoresController.updateScore);
router.delete("/scores/:id", scoresController.deleteScore);

module.exports = router;
