const LOGIN_API = "https://api.redclass.redberryinternship.ge/api/login";
const REGISTER_API = "https://api.redclass.redberryinternship.ge/api/register";

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);

  const expires = "expires=" + d.toUTCString();

  const val = typeof value === "object" ? JSON.stringify(value) : value;

  document.cookie =
    name + "=" + encodeURIComponent(val) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const decoded = decodeURIComponent(document.cookie);
  const ca = decoded.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();

    if (c.indexOf(name + "=") === 0) {
      const value = c.substring(name.length + 1);

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function el(id) {
  return document.getElementById(id);
}

function openModal(id) {
  el(id).style.display = "flex";
}

function closeModal(id) {
  el(id).style.display = "none";
}

function switchModal(from, to) {
  closeModal(from);
  openModal(to);
}

window.onclick = (e) => {
  ["loginModal", "registerModal"].forEach((id) => {
    const m = el(id);
    if (m && e.target === m) m.style.display = "none";
  });
};

function setError(inputId, errorId, msg) {
  const input = el(inputId);
  const error = el(errorId);

  if (!input || !error) return;

  error.innerText = msg;
  input.classList.add("input-error");
  input.closest(".form-group")?.classList.add("error");
}

function clearError(inputId, errorId) {
  const input = el(inputId);
  const error = el(errorId);

  if (error) error.innerText = "";

  if (input) {
    input.classList.remove("input-error");
    input.closest(".form-group")?.classList.remove("error");
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function togglePassword(inputId, iconEl) {
  const input = el(inputId);
  if (!input) return;

  const img = iconEl.querySelector("img");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";

  if (img) {
    img.src = isHidden ? "imgs/closeeye.svg" : "imgs/openeye.svg";
  }
}

function setAuthUI(loggedIn) {
  const guest = el("guestActions");
  const auth = el("authActions");

  if (!guest || !auth) return;

  guest.style.display = loggedIn ? "none" : "flex";
  auth.style.display = loggedIn ? "flex" : "none";
}

function saveToken(data) {
  const token = data?.data?.token || data?.token || data?.access_token;

  if (token) {
    setCookie("token", token, 7);
  }
}

async function logout() {
  const token = getCookie("token");

  try {
    await fetch("https://api.redclass.redberryinternship.ge/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    console.warn("Logout failed:", err);
  } finally {
    deleteCookie("token");
    deleteCookie("user");
    setAuthUI(false);
  }
}
function isLoggedIn() {
  return !!getCookie("token");
}

document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = isLoggedIn();

  setAuthUI(loggedIn);

  if (loggedIn) {
    window.loadUser();
  }
});
