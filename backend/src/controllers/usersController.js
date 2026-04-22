const usersService = require("../services/usersService");
const { sanitizeString } = require("../utils/sanitize");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

function validateCreatePayload(body) {
  const errors = [];

  if (!body.firstName || !body.firstName.trim()) {
    errors.push("firstName is required.");
  }
  if (!body.lastName || !body.lastName.trim()) {
    errors.push("lastName is required.");
  }
  if (!body.email || !body.email.trim()) {
    errors.push("email is required.");
  } else if (!EMAIL_REGEX.test(body.email)) {
    errors.push("email format is invalid.");
  }
  if (!body.password) {
    errors.push("password is required.");
  } else if (body.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  return errors;
}

function validateUpdatePayload(body) {
  const errors = [];
  const hasAnyField =
    body.firstName !== undefined ||
    body.lastName !== undefined ||
    body.email !== undefined ||
    body.password !== undefined;

  if (!hasAnyField) {
    errors.push("At least one field is required to update.");
    return errors;
  }

  if (body.firstName !== undefined && !body.firstName.trim()) {
    errors.push("firstName cannot be empty.");
  }

  if (body.lastName !== undefined && !body.lastName.trim()) {
    errors.push("lastName cannot be empty.");
  }

  if (body.email !== undefined) {
    if (!body.email.trim()) {
      errors.push("email cannot be empty.");
    } else if (!EMAIL_REGEX.test(body.email)) {
      errors.push("email format is invalid.");
    }
  }

  if (body.password !== undefined && body.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  return errors;
}

function parseUserId(idParam) {
  if (!/^\d+$/.test(idParam)) {
    return null;
  }
  const userId = Number(idParam);
  return Number.isInteger(userId) ? userId : null;
}

async function createUser(req, res, next) {
  try {
    const errors = validateCreatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      firstName: sanitizeString(req.body.firstName?.trim()),
      lastName: sanitizeString(req.body.lastName?.trim()),
      email: req.body.email?.trim(),
      password: req.body.password
    };

    const user = await usersService.createUser(payload);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await usersService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (userId === null) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (userId === null) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const errors = validateUpdatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      firstName: req.body.firstName !== undefined ? sanitizeString(req.body.firstName.trim()) : undefined,
      lastName: req.body.lastName !== undefined ? sanitizeString(req.body.lastName.trim()) : undefined,
      email: req.body.email?.trim(),
      password: req.body.password
    };

    const updatedUser = await usersService.updateUser(userId, payload);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = parseUserId(req.params.id);
    if (userId === null) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const deletedUser = await usersService.deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      user: deletedUser
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsersWithFiveScores(req, res, next) {
  try {
    const users = await usersService.getUsersWithFiveScores();
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

async function getMaxScoreWithUser(req, res, next) {
  try {
    const result = await usersService.getMaxScoreWithUser();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersWithFiveScores,
  getMaxScoreWithUser
};
