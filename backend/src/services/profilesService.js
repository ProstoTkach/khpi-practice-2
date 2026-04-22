const { Profile } = require("../models");

async function createProfile(payload) {
  return Profile.create(payload);
}

async function getAllProfiles() {
  return Profile.findAll({ order: [["id", "ASC"]] });
}

async function getProfileById(id) {
  return Profile.findByPk(id);
}

async function updateProfile(id, payload) {
  const profile = await Profile.findByPk(id);
  if (!profile) {
    return null;
  }

  await profile.update(payload);
  return profile;
}

async function deleteProfile(id) {
  const profile = await Profile.findByPk(id);
  if (!profile) {
    return null;
  }

  await profile.destroy();
  return profile;
}

module.exports = {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
};
