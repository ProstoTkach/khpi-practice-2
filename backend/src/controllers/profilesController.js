const profilesService = require("../services/profilesService");
const { sanitizeString } = require("../utils/sanitize");

function parseId(idParam) {
  if (!/^\d+$/.test(idParam)) {
    return null;
  }
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

function validateCreatePayload(body) {
  const errors = [];
  if (body.user_id === undefined) {
    errors.push("user_id is required.");
  } else if (!Number.isInteger(Number(body.user_id))) {
    errors.push("user_id must be an integer.");
  }
  return errors;
}

function validateUpdatePayload(body) {
  const errors = [];
  const hasAnyField =
    body.user_id !== undefined ||
    body.bio !== undefined ||
    body.avatar_url !== undefined;
  if (!hasAnyField) {
    errors.push("At least one field is required to update.");
    return errors;
  }

  if (body.user_id !== undefined && !Number.isInteger(Number(body.user_id))) {
    errors.push("user_id must be an integer.");
  }

  return errors;
}

async function createProfile(req, res, next) {
  try {
    const errors = validateCreatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      user_id: Number(req.body.user_id),
      bio: req.body.bio !== undefined ? sanitizeString(req.body.bio) : undefined,
      avatar_url: req.body.avatar_url !== undefined ? sanitizeString(req.body.avatar_url) : undefined
    };

    const profile = await profilesService.createProfile(payload);
    return res.status(201).json(profile);
  } catch (error) {
    return next(error);
  }
}

async function getAllProfiles(req, res, next) {
  try {
    const profiles = await profilesService.getAllProfiles();
    return res.status(200).json(profiles);
  } catch (error) {
    return next(error);
  }
}

async function getProfileById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid profile id." });
    }

    const profile = await profilesService.getProfileById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid profile id." });
    }

    const errors = validateUpdatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const payload = {
      ...(req.body.user_id !== undefined && { user_id: Number(req.body.user_id) }),
      ...(req.body.bio !== undefined && { bio: sanitizeString(req.body.bio) }),
      ...(req.body.avatar_url !== undefined && { avatar_url: sanitizeString(req.body.avatar_url) })
    };

    const profile = await profilesService.updateProfile(id, payload);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
}

async function deleteProfile(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Invalid profile id." });
    }

    const profile = await profilesService.deleteProfile(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.status(200).json({ message: "Profile deleted successfully.", profile });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
};
