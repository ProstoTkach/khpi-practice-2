import { DEFAULT_AVATAR } from "./config.js";

export function qs(selector) {
  return document.querySelector(selector);
}

export function showMessage(message, type = "success") {
  const el = qs("#globalMessage");
  if (!el) return;
  el.textContent = message;
  el.className = `status-message ${type}`;
}

export function clearMessage() {
  const el = qs("#globalMessage");
  if (!el) return;
  el.textContent = "";
  el.className = "status-message";
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

export function getFullName(user) {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim();
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

export function validatePassword(password, min = 8) {
  return typeof password === "string" && password.length >= min;
}

export function setAvatarImage(imgEl, url) {
  if (!imgEl) return;
  imgEl.src = url || DEFAULT_AVATAR;
  imgEl.onerror = () => {
    imgEl.src = DEFAULT_AVATAR;
  };
}

export function avg(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
