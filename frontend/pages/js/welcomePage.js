import { api } from "./api.js";
import { avg, getFullName, showMessage } from "./utils.js";

export async function initWelcomePage() {
  try {
    const [users, profiles, scores] = await Promise.all([
      api.getUsers(),
      api.getProfiles(),
      api.getScores()
    ]);

    const scoresByUser = new Map();
    scores.forEach((score) => {
      const arr = scoresByUser.get(score.user_id) || [];
      arr.push(score.score);
      scoresByUser.set(score.user_id, arr);
    });

    const usersWithFive = users
      .map((user) => ({ user, scores: scoresByUser.get(user.id) || [] }))
      .filter((item) => item.scores.length === 5);

    let bestUserLabel = "-";
    if (usersWithFive.length > 0) {
      usersWithFive.sort((a, b) => avg(b.scores) - avg(a.scores));
      const best = usersWithFive[0];
      bestUserLabel = `${getFullName(best.user)} (${avg(best.scores).toFixed(2)})`;
    }

    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalProfiles").textContent = profiles.length;
    document.getElementById("totalScores").textContent = scores.length;
    document.getElementById("overallAvgScore").textContent = scores.length
      ? avg(scores.map((item) => item.score)).toFixed(2)
      : "-";
    document.getElementById("usersWithFiveScores").textContent = usersWithFive.length;
    document.getElementById("bestUserByAvg").textContent = bestUserLabel;
  } catch (error) {
    showMessage(error.message, "error");
  }
}
