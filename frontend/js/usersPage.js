import { api } from "./api.js";
import {
  avg,
  clearMessage,
  formatDate,
  getFullName,
  setAvatarImage,
  showMessage
} from "./utils.js";

const state = { users: [], profiles: [], scores: [], expandedUserId: null };

function scoreStatsForUser(userId) {
  const userScores = state.scores.filter((item) => item.user_id === userId);
  return {
    list: userScores,
    count: userScores.length,
    average: userScores.length ? avg(userScores.map((item) => item.score)) : 0
  };
}

function filterAndSortUsers() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const sortMode = document.getElementById("sortSelect").value;
  const filtered = state.users.filter((user) => {
    if (!q) return true;
    return (
      getFullName(user).toLowerCase().includes(q) || (user.email || "").toLowerCase().includes(q)
    );
  });

  filtered.sort((a, b) => {
    switch (sortMode) {
      case "id-desc":
        return b.id - a.id;
      case "name-asc":
        return getFullName(a).localeCompare(getFullName(b));
      case "name-desc":
        return getFullName(b).localeCompare(getFullName(a));
      case "email-asc":
        return (a.email || "").localeCompare(b.email || "");
      default:
        return a.id - b.id;
    }
  });
  return filtered;
}

function renderExpandedRow(user) {
  const profile = state.profiles.find((item) => item.user_id === user.id);
  const stats = scoreStatsForUser(user.id);

  const scoresHtml = stats.list.length
    ? stats.list
        .sort((a, b) => a.id - b.id)
        .map((score) => `<li>#${score.id}: <strong>${score.score}</strong></li>`)
        .join("")
    : "<li>No scores</li>";

  const showForm = stats.list.length < 5;

  const formHtml = showForm
    ? `
      <form class="inline-form add-score-form" data-user-id="${user.id}">
        <input type="number" min="0" max="100" placeholder="0-100" required />
        <button class="btn ghost" type="submit">Add score</button>
      </form>
    `
    : ``;

  return `
    <tr class="expanded-row">
      <td colspan="7">
        <div class="expanded-grid">
          <div class="profile-preview">
            <img class="avatar-image" data-avatar-src="${profile?.avatar_url || ""}" alt="Profile avatar" />
            <div>
              <p>${profile?.bio || "Profile not found"}</p>
            </div>
          </div>
          <div class="scores-preview">
            <ul class="score-list compact-list">${scoresHtml}</ul>
            ${formHtml}
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderTable() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";
  const users = filterAndSortUsers();
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7">No users found.</td></tr>`;
    return;
  }

  users.forEach((user) => {
    const stats = scoreStatsForUser(user.id);
    const avgCell =
      stats.count === 5
        ? `<span class="avg-good">${stats.average.toFixed(2)}</span>`
        : `<span class="avg-missing">✗</span>`;
    const row = document.createElement("tr");
    row.className = "clickable-row";
    row.dataset.userId = String(user.id);
    row.innerHTML = `
      <td>${getFullName(user)}</td>
      <td>${stats.count}</td>
      <td>${avgCell}</td>
      <td>${user.email}</td>
      <td>${formatDate(user.created_at)}</td>
      <td><button class="icon-btn delete-user-btn" data-user-id="${user.id}" title="Delete user">🗑</button></td>
    `;
    tbody.appendChild(row);
    if (state.expandedUserId === user.id) {
      tbody.insertAdjacentHTML("beforeend", renderExpandedRow(user));
    }
  });

  document.querySelectorAll(".avatar-image[data-avatar-src]").forEach((img) => {
    setAvatarImage(img, img.dataset.avatarSrc);
  });
}

async function loadData() {
  document.getElementById("usersLoading").style.display = "block";
  try {
    const [users, profiles, scores] = await Promise.all([
      api.getUsers(),
      api.getProfiles(),
      api.getScores()
    ]);
    state.users = users;
    state.profiles = profiles;
    state.scores = scores;
    renderTable();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    document.getElementById("usersLoading").style.display = "none";
  }
}

async function handleTableClick(event) {
  const deleteBtn = event.target.closest(".delete-user-btn");
  if (deleteBtn) {
    event.stopPropagation();
    const userId = Number(deleteBtn.dataset.userId);
    const ok = window.confirm(`Delete user #${userId}?`);
    if (!ok) return;
    try {
      await api.deleteUser(userId);
      clearMessage();
      showMessage("User deleted.");
      await loadData();
    } catch (error) {
      showMessage(error.message, "error");
    }
    return;
  }

  const row = event.target.closest(".clickable-row");
  if (!row) return;
  const userId = Number(row.dataset.userId);
  state.expandedUserId = state.expandedUserId === userId ? null : userId;
  renderTable();
}

async function handleAddScore(event) {
  const form = event.target.closest(".add-score-form");
  if (!form) return;
  event.preventDefault();
  const userId = Number(form.dataset.userId);
  const input = form.querySelector("input");
  const score = Number(input.value);
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    showMessage("Score must be integer from 0 to 100.", "error");
    return;
  }
  try {
    await api.createScore({ user_id: userId, score });
    showMessage("Score added.");
    await loadData();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

export function initUsersPage() {
  const root = document.getElementById("usersTableBody");
  if (!root) return;
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("sortSelect").addEventListener("change", renderTable);
  document.getElementById("reloadUsersBtn").addEventListener("click", loadData);
  root.addEventListener("click", handleTableClick);
  root.addEventListener("submit", handleAddScore);
  loadData();
}
