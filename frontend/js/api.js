import { API_BASE_URL } from "./config.js";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export const api = {
  request,
  getUsers: () => request("/users"),
  getUserById: (id) => request(`/users/${id}`),
  createUser: (payload) => request("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
  getProfiles: () => request("/profiles"),
  createProfile: (payload) =>
    request("/profiles", { method: "POST", body: JSON.stringify(payload) }),
  updateProfile: (id, payload) =>
    request(`/profiles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProfile: (id) => request(`/profiles/${id}`, { method: "DELETE" }),
  getScores: () => request("/scores"),
  createScore: (payload) => request("/scores", { method: "POST", body: JSON.stringify(payload) })
};
