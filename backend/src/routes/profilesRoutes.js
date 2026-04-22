const express = require("express");
const profilesController = require("../controllers/profilesController");

const router = express.Router();

router.post("/profiles", profilesController.createProfile);
router.get("/profiles", profilesController.getAllProfiles);
router.get("/profiles/:id", profilesController.getProfileById);
router.put("/profiles/:id", profilesController.updateProfile);
router.delete("/profiles/:id", profilesController.deleteProfile);

module.exports = router;
