let profileAvatarFile = null;
const PROFILE_API = "https://api.redclass.redberryinternship.ge/api/profile";

function resetFieldUI() {
  ["profileFullName", "profileMobile", "profileAge"].forEach((id) => {
    const input = el(id);
    if (!input) return;
    input.classList.remove("input-error", "input-success");
  });

  ["fullNameError", "mobileError", "ageError"].forEach((id) => {
    const err = el(id);
    if (err) err.innerText = "";
  });
}
function isProfileComplete(user) {
  if (!user) return false;

  const name = (user.fullName || "").trim();
  const mobile = (user.mobileNumber || "").replace(/\s/g, "");
  const age = Number(user.age);

  return (
    name.length >= 3 &&
    name.length <= 50 &&
    /^5\d{8}$/.test(mobile) &&
    age >= 16 &&
    age <= 120
  );
}
function formatMobileInput(input) {
  let val = input.value.replace(/\D/g, "").slice(0, 9);

  if (val.length > 6) {
    val = val.slice(0, 3) + " " + val.slice(3, 6) + " " + val.slice(6);
  } else if (val.length > 3) {
    val = val.slice(0, 3) + " " + val.slice(3);
  }

  input.value = val;

  validateProfile();
  updateTopUI();
}
function openProfileModal() {
  openModal("profileModal");
  resetFieldUI();

  const user = getCookie("user") || {};

  if (user.avatar) {
    el("profileTopAvatar").src = user.avatar;
  }

  el("profileEmail").value = user.email || "";
  el("profileFullName").value = user.fullName || "";
  el("profileAge").value = user.age || "";

  const raw = (user.mobileNumber || "").replace(/\s/g, "");
  el("profileMobile").value =
    raw.length === 9
      ? raw.slice(0, 3) + " " + raw.slice(3, 6) + " " + raw.slice(6)
      : user.mobileNumber || "";

  profileAvatarFile = null;

  el("profileAvatarPlaceholder").style.display = "flex";
  el("profileAvatarFilled").style.display = "none";

  el("profileEmail").disabled = true;

  updateTopUI();
  validateProfile();
}
function setFieldState(inputId, state) {
  const input = el(inputId);
  if (!input) return;

  input.classList.remove("input-error", "input-success");

  if (state === "error") input.classList.add("input-error");
  if (state === "success") input.classList.add("input-success");
}

function setFieldError(inputId, errorId, msg) {
  const input = el(inputId);
  const err = el(errorId);

  if (input) {
    input.classList.remove("input-success");
    input.classList.add("input-error");
  }

  if (err) {
    err.innerText = msg;
  }
}
function clearField(inputId, errorId) {
  const input = el(inputId);
  const err = el(errorId);

  if (input) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
  }

  if (err) err.innerText = "";
}
function validateProfile() {
  let valid = true;

  const name = el("profileFullName").value.trim();
  const mobile = el("profileMobile").value.replace(/\s/g, "");
  const age = Number(el("profileAge").value);

  if (!name) {
    setFieldError("profileFullName", "fullNameError", "Name is required");
    setFieldState("profileFullName", "error");
    valid = false;
  } else if (name.length < 3) {
    setFieldError(
      "profileFullName",
      "fullNameError",
      "Name must be at least 3 characters",
    );
    setFieldState("profileFullName", "error");
    valid = false;
  } else if (name.length > 50) {
    setFieldError(
      "profileFullName",
      "fullNameError",
      "Name must be at most 50 characters",
    );
    setFieldState("profileFullName", "error");
    valid = false;
  } else {
    clearField("profileFullName", "fullNameError");
  }

  if (!mobile) {
    setFieldError("profileMobile", "mobileError", "Mobile number is required");
    setFieldState("profileMobile", "error");
    updateMobilePrefixState(false);
    valid = false;
  } else if (!/^\d+$/.test(mobile)) {
    setFieldError("profileMobile", "mobileError", "Digits only");
    setFieldState("profileMobile", "error");
    updateMobilePrefixState(false);
    valid = false;
  } else if (!mobile.startsWith("5")) {
    setFieldError(
      "profileMobile",
      "mobileError",
      "Georgian mobile numbers must start with 5",
    );
    setFieldState("profileMobile", "error");
    updateMobilePrefixState(false);
    valid = false;
  } else if (mobile.length !== 9) {
    setFieldError(
      "profileMobile",
      "mobileError",
      "Georgian mobile numbers must be 9 digits",
    );
    setFieldState("profileMobile", "error");
    updateMobilePrefixState(false);
    valid = false;
  } else {
    clearField("profileMobile", "mobileError");
    const isMobileValid = /^5\d{8}$/.test(mobile);
    updateMobilePrefixState(isMobileValid);
  }

  if (!el("profileAge").value) {
    setFieldError("profileAge", "ageError", "Age is required");
    setFieldState("profileAge", "error");
    valid = false;
  } else if (isNaN(age)) {
    setFieldError("profileAge", "ageError", "Age must be a number");
    setFieldState("profileAge", "error");
    valid = false;
  } else if (age < 16) {
    setFieldError("profileAge", "ageError", "You must be at least 16");
    setFieldState("profileAge", "error");
    valid = false;
  } else if (age > 120) {
    setFieldError("profileAge", "ageError", "Please enter a valid age");
    setFieldState("profileAge", "error");
    valid = false;
  } else {
    clearField("profileAge", "ageError");
  }

  el("saveProfileBtn").disabled = !valid;
  return valid;
}
function updateMobilePrefixState(isValid) {
  const prefix = el("mobilePrefix");
  if (!prefix) return;

  prefix.style.borderColor = isValid ? "#4caf50" : "#e53935";
}
document.addEventListener("DOMContentLoaded", () => {
  ["profileFullName", "profileMobile", "profileAge"].forEach((id) => {
    const input = el(id);
    if (!input) return;
    input.addEventListener("input", () => {
      validateProfile();
      updateTopUI();
    });
    input.addEventListener("blur", validateProfile);
  });
});
function resetFieldLocks() {
  unlockField("profileFullName");
  unlockField("profileMobile");
  unlockField("profileAge");
}
function updateTopUI() {
  const user = getCookie("user") || {};

  el("profileUsername").innerText = user.username || "User";

  const complete = isProfileComplete({
    fullName: el("profileFullName").value.trim(),
    mobileNumber: el("profileMobile").value.replace(/\s/g, ""),
    age: el("profileAge").value,
  });

  const text = el("profileStatusText");
  const dot = el("topStatusDot");

  text.innerText = complete ? "Profile is Complete" : "Profile is incomplete";
  text.style.color = complete ? "#4caf50" : "orange";
  dot.style.background = complete ? "#4caf50" : "orange";
}

const PROFILE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function handleProfileAvatarChange(input) {
  const file = input.files[0];
  if (!file) return;

  const errEl = el("profileAvatarError");

  if (!PROFILE_ALLOWED_TYPES.includes(file.type)) {
    if (errEl) errEl.innerText = "Invalid format. Please use JPG, PNG or WebP.";
    input.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    if (errEl) errEl.innerText = "Image must be less than 2MB.";
    input.value = "";
    return;
  }
  if (errEl) errEl.innerText = "";

  profileAvatarFile = file;

  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  el("profileAvatarFileName").innerText = file.name;
  el("profileAvatarFileSize").innerText = "Size ~ " + sizeMB + "MB";

  const reader = new FileReader();
  reader.onload = (e) => {
    el("profileAvatarPreview").src = e.target.result;
    el("profileTopAvatar").src = e.target.result;
    const navAv = el("navAvatar");
    if (navAv) navAv.src = e.target.result;

    el("profileAvatarPlaceholder").style.display = "none";
    el("profileAvatarFilled").style.display = "flex";
  };
  reader.readAsDataURL(file);

  input.value = "";
}

function handleProfileDragOver(e) {
  e.preventDefault();
  el("profileAvatarDropArea").classList.add("drag-over");
}
function handleProfileDragLeave() {
  el("profileAvatarDropArea").classList.remove("drag-over");
}
function handleProfileDrop(e) {
  e.preventDefault();
  el("profileAvatarDropArea").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) {
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = el("profileAvatarInput");
    input.files = dt.files;
    handleProfileAvatarChange(input);
  }
}

async function updateProfile() {
  if (!validateProfile()) return;

  const token = getCookie("token");
  if (!token) return;

  const btn = el("saveProfileBtn");
  btn.disabled = true;
  btn.innerText = "Saving...";

  const formData = new FormData();
  formData.append("full_name", el("profileFullName").value.trim());
  formData.append(
    "mobile_number",
    el("profileMobile").value.replace(/\s/g, ""),
  );
  formData.append("age", el("profileAge").value);
  if (profileAvatarFile) formData.append("avatar", profileAvatarFile);

  try {
    const response = await fetch(PROFILE_API + "?_method=PUT", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && typeof data.errors === "object") {
        const fieldMap = {
          full_name: ["profileFullName", "fullNameError"],
          mobile_number: ["profileMobile", "mobileError"],
          age: ["profileAge", "ageError"],
          avatar: [null, "profileAvatarError"],
        };
        for (const [field, messages] of Object.entries(data.errors)) {
          const map = fieldMap[field];
          const text = Array.isArray(messages) ? messages.join(" ") : messages;
          if (map) {
            if (map[0]) {
              const inp = el(map[0]);
              if (inp) inp.classList.add("input-error");
            }
            const errEl = el(map[1]);
            if (errEl) errEl.innerText = text;
          }
        }
      } else if (data.message) {
        el("fullNameError").innerText = data.message;
      }
      btn.disabled = false;
      btn.innerText = "Update Profile";
      return;
    }

    const updatedUser = {
      ...data.data,
      fullName: data.data.fullName || data.data.full_name,
      mobileNumber: data.data.mobileNumber || data.data.mobile_number,
    };
    setCookie("user", updatedUser, 7);

    updateNavbarAvatar();
    updateProfileIndicator();

    resetFieldUI();
    closeModal("profileModal");

    showToast("Profile updated successfully!");
  } catch (err) {
    el("fullNameError").innerText = "Something went wrong. Please try again.";
  } finally {
    btn.disabled = false;
    btn.innerText = "Update Profile";
  }
}

function updateNavbarAvatar() {
  const user = getCookie("user") || {};
  const navAv = el("navAvatar");
  if (navAv && user.avatar) navAv.src = user.avatar;
}

function updateProfileIndicator() {
  const user = getCookie("user") || {};
  const dot = el("profileIndicator");
  if (!dot) return;
  dot.style.background = isProfileComplete(user) ? "#4caf50" : "orange";
}

function closeProfileModal(e) {
  const user = getCookie("user") || {};

  const tryClose = () => {
    closeModal("profileModal");
  };

  const confirmIfNeeded = () => {
    if (!isProfileComplete(user)) {
      return confirm(
        "Your profile is incomplete. You won't be able to enroll in courses until you complete it. Close anyway?",
      );
    }
    return true;
  };
  if (e && e.type === "overlay") {
    if (e.event && e.event.target !== e.event.currentTarget) return;

    if (!confirmIfNeeded()) return;
    tryClose();
    return;
  }

  if (e && e.type === "esc") {
    if (!confirmIfNeeded()) return;
    tryClose();
    return;
  }

  if (!confirmIfNeeded()) return;
  tryClose();
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProfileModal({ type: "esc" });
  }
});
function onProfileOverlayClick(event) {
  closeProfileModal({ type: "overlay", event });
}
function showToast(msg) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
      background:#333; color:#fff; padding:12px 24px; border-radius:8px;
      font-size:14px; z-index:9999; opacity:0; transition:opacity 0.3s;
      white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}
