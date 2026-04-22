import { api } from "./api.js";
import { clearMessage, getFullName, setAvatarImage, showMessage, validateEmail, validatePassword } from "./utils.js";

const sections = [
  "managerDashboard",
  "createUserSection",
  "createProfileSection",
  "editUserSection",
  "editProfileSection",
  "deleteUserSection",
  "deleteProfileSection"
];

let currentDeleteUserId = null;
let currentDeleteProfileId = null;

function showOnly(sectionId) {
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", id !== sectionId);
  });
}

function showDashboard() {
  showOnly("managerDashboard");
}

function readPositiveInt(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function clearErrors(prefixes) {
  prefixes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function bindCancelButtons() {
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      clearMessage();
      showDashboard();
    });
  });
}

function setupCreateUser() {
  document.getElementById("showCreateUserFormBtn").addEventListener("click", () => {
    clearMessage();
    showOnly("createUserSection");
  });

  document.getElementById("createUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(["createFirstNameError", "createLastNameError", "createEmailError", "createPasswordError"]);
    clearMessage();

    const firstName = document.getElementById("createFirstName").value.trim();
    const lastName = document.getElementById("createLastName").value.trim();
    const email = document.getElementById("createEmail").value.trim();
    const password = document.getElementById("createPassword").value;
    let valid = true;

    if (!firstName) {
      document.getElementById("createFirstNameError").textContent = "First name is required.";
      valid = false;
    }
    if (!lastName) {
      document.getElementById("createLastNameError").textContent = "Last name is required.";
      valid = false;
    }
    if (!validateEmail(email)) {
      document.getElementById("createEmailError").textContent = "Invalid email.";
      valid = false;
    }
    if (!validatePassword(password, 8)) {
      document.getElementById("createPasswordError").textContent = "Password min length is 8.";
      valid = false;
    }
    if (!valid) return;

    try {
      await api.createUser({ firstName, lastName, email, password });
      showMessage("User created.");
      event.target.reset();
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

function setupCreateProfile() {
  document.getElementById("showCreateProfileFormBtn").addEventListener("click", () => {
    clearMessage();
    showOnly("createProfileSection");
  });

  document.getElementById("createProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(["createProfileUserIdError"]);
    clearMessage();
    const userId = readPositiveInt("createProfileUserId");
    if (!userId) {
      document.getElementById("createProfileUserIdError").textContent = "Valid user ID required.";
      return;
    }

    const payload = {
      user_id: userId,
      bio: document.getElementById("createProfileBio").value.trim(),
      avatar_url: document.getElementById("createProfileAvatar").value.trim()
    };
    try {
      await api.createProfile(payload);
      showMessage("Profile created.");
      event.target.reset();
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

async function loadUserForEdit() {
  const userId = readPositiveInt("updateUserIdInput");
  if (!userId) throw new Error("Enter valid user ID.");
  return api.getUserById(userId);
}

function setupEditUser() {
  document.getElementById("editUserBtn").addEventListener("click", async () => {
    clearMessage();
    try {
      const user = await loadUserForEdit();
      document.getElementById("editUserId").value = user.id;
      document.getElementById("editFirstName").value = user.first_name;
      document.getElementById("editLastName").value = user.last_name;
      document.getElementById("editEmail").value = user.email;
      document.getElementById("editPassword").value = "";
      showOnly("editUserSection");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("editUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
    clearErrors(["editFirstNameError", "editLastNameError", "editEmailError", "editPasswordError"]);
    const userId = Number(document.getElementById("editUserId").value);
    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName = document.getElementById("editLastName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const password = document.getElementById("editPassword").value;

    let valid = true;
    if (!firstName) {
      document.getElementById("editFirstNameError").textContent = "First name is required.";
      valid = false;
    }
    if (!lastName) {
      document.getElementById("editLastNameError").textContent = "Last name is required.";
      valid = false;
    }
    if (!validateEmail(email)) {
      document.getElementById("editEmailError").textContent = "Invalid email.";
      valid = false;
    }
    if (password && !validatePassword(password, 8)) {
      document.getElementById("editPasswordError").textContent = "Password min length is 8.";
      valid = false;
    }
    if (!valid) return;

    const payload = { firstName, lastName, email, ...(password ? { password } : {}) };
    try {
      await api.updateUser(userId, payload);
      showMessage("User updated.");
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

function setupEditProfile() {
  document.getElementById("editProfileBtn").addEventListener("click", async () => {
    clearMessage();
    try {
      const user = await loadUserForEdit();
      const profiles = await api.getProfiles();
      const profile = profiles.find((item) => item.user_id === user.id);
      if (!profile) throw new Error("Profile not found for this user.");

      document.getElementById("editProfileId").value = profile.id;
      document.getElementById("editProfileUserId").value = profile.user_id;
      document.getElementById("editProfileBio").value = profile.bio || "";
      document.getElementById("editProfileAvatar").value = profile.avatar_url || "";
      setAvatarImage(document.getElementById("editProfileAvatarPreview"), profile.avatar_url);
      showOnly("editProfileSection");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("reloadAvatarPreviewBtn").addEventListener("click", () => {
    setAvatarImage(
      document.getElementById("editProfileAvatarPreview"),
      document.getElementById("editProfileAvatar").value.trim()
    );
  });

  document.getElementById("editProfileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
    const profileId = Number(document.getElementById("editProfileId").value);
    const user_id = readPositiveInt("editProfileUserId");
    if (!profileId || !user_id) {
      showMessage("Invalid profile or user ID.", "error");
      return;
    }
    const payload = {
      user_id,
      bio: document.getElementById("editProfileBio").value.trim(),
      avatar_url: document.getElementById("editProfileAvatar").value.trim()
    };
    try {
      await api.updateProfile(profileId, payload);
      showMessage("Profile updated.");
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

function setupDeleteFlows() {
  document.getElementById("deleteUserFlowBtn").addEventListener("click", async () => {
    clearMessage();
    try {
      const user = await loadUserForEdit();
      currentDeleteUserId = user.id;
      document.getElementById("deleteUserInfo").innerHTML = `<strong>${getFullName(
        user
      )}</strong><br>${user.email}`;
      showOnly("deleteUserSection");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("deleteProfileFlowBtn").addEventListener("click", async () => {
    clearMessage();
    try {
      const user = await loadUserForEdit();
      const profiles = await api.getProfiles();
      const profile = profiles.find((item) => item.user_id === user.id);
      if (!profile) throw new Error("Profile not found for this user.");
      currentDeleteProfileId = profile.id;
      document.getElementById("deleteProfileInfo").innerHTML = `Profile #${profile.id} for <strong>${getFullName(
        user
      )}</strong>`;
      showOnly("deleteProfileSection");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("confirmDeleteUserBtn").addEventListener("click", async () => {
    if (!currentDeleteUserId) return;
    if (!window.confirm(`Delete user #${currentDeleteUserId} with profile and scores?`)) return;
    try {
      await api.deleteUser(currentDeleteUserId);
      showMessage("User deleted.");
      currentDeleteUserId = null;
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  document.getElementById("confirmDeleteProfileBtn").addEventListener("click", async () => {
    if (!currentDeleteProfileId) return;
    if (!window.confirm(`Delete profile #${currentDeleteProfileId}?`)) return;
    try {
      await api.deleteProfile(currentDeleteProfileId);
      showMessage("Profile deleted.");
      currentDeleteProfileId = null;
      showDashboard();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

export function initManagerPage() {
  if (!document.getElementById("managerDashboard")) return;
  bindCancelButtons();
  setupCreateUser();
  setupCreateProfile();
  setupEditUser();
  setupEditProfile();
  setupDeleteFlows();
}
