const { Score } = require("../models");

async function createScore(payload) {
  return Score.create(payload);
}

async function getAllScores() {
  return Score.findAll({ order: [["id", "ASC"]] });
}

async function getScoreById(id) {
  return Score.findByPk(id);
}

async function updateScore(id, payload) {
  const score = await Score.findByPk(id);
  if (!score) {
    return null;
  }

  await score.update(payload);
  return score;
}

async function deleteScore(id) {
  const score = await Score.findByPk(id);
  if (!score) {
    return null;
  }

  await score.destroy();
  return score;
}

module.exports = {
  createScore,
  getAllScores,
  getScoreById,
  updateScore,
  deleteScore
};
