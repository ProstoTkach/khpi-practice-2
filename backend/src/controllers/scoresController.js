const scoresService = require("../services/scoresService");

function parseId(idParam) {
  if (!/^\d+$/.test(idParam)) {
    return null;
  }
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

function validateCreatePayload(body) {
  const errors = [];
  const numericUserId = Number(body.user_id);
  const numericScore = Number(body.score);

  if (body.user_id === undefined) {
    errors.push("user_id is required.");
  } else if (!Number.isInteger(numericUserId)) {
    errors.push("user_id must be an integer.");
  }

  if (body.score === undefined) {
    errors.push("score is required.");
  } else if (!Number.isInteger(numericScore)) {
    errors.push("score must be an integer.");
  } else if (numericScore < 0 || numericScore > 100) {
    errors.push("score must be between 0 and 100.");
  }

  return errors;
}

function validateUpdatePayload(body) {
  const errors = [];
  const numericUserId = Number(body.user_id);
  const numericScore = Number(body.score);
  const hasAnyField = body.user_id !== undefined || body.score !== undefined;

  if (!hasAnyField) {
    errors.push("At least one field is required to update.");
    return errors;
  }

  if (body.user_id !== undefined && !Number.isInteger(numericUserId)) {
    errors.push("user_id must be an integer.");
  }

  if (body.score !== undefined && !Number.isInteger(numericScore)) {
    errors.push("score must be an integer.");
  } else if (body.score !== undefined && (numericScore < 0 || numericScore > 100)) {
    errors.push("score must be between 0 and 100.");
  }

  return errors;
}

async function createScore(req, res, next) {
  try {
    const errors = validateCreatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      user_id: Number(req.body.user_id),
      score: Number(req.body.score)
    };
    const score = await scoresService.createScore(payload);
    return res.status(201).json(score);
  } catch (error) {
    return next(error);
  }
}

async function getAllScores(req, res, next) {
  try {
    const scores = await scoresService.getAllScores();
    return res.status(200).json(scores);
  } catch (error) {
    return next(error);
  }
}

async function getScoreById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid score id." });
    }

    const score = await scoresService.getScoreById(id);
    if (!score) {
      return res.status(404).json({ message: "Score not found." });
    }

    return res.status(200).json(score);
  } catch (error) {
    return next(error);
  }
}

async function updateScore(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid score id." });
    }

    const errors = validateUpdatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      ...(req.body.user_id !== undefined && { user_id: Number(req.body.user_id) }),
      ...(req.body.score !== undefined && { score: Number(req.body.score) })
    };
    const score = await scoresService.updateScore(id, payload);
    if (!score) {
      return res.status(404).json({ message: "Score not found." });
    }

    return res.status(200).json(score);
  } catch (error) {
    return next(error);
  }
}

async function deleteScore(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid score id." });
    }

    const score = await scoresService.deleteScore(id);
    if (!score) {
      return res.status(404).json({ message: "Score not found." });
    }

    return res.status(200).json({ message: "Score deleted successfully.", score });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createScore,
  getAllScores,
  getScoreById,
  updateScore,
  deleteScore
};
