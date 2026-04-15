let regStep = 1;
let regAvatarFile = null;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const FIELD_MAP = {
  email: { step: 1, errorId: "regEmailError", inputId: "regEmail" },
  password: { step: 2, errorId: "regPasswordError", inputId: "regPassword" },
  password_confirmation: { step: 2, errorId: "regConfirmError", inputId: "regConfirm" },
  username: { step: 3, errorId: "regUsernameError", inputId: "regUsername" },
  avatar: { step: 3, errorId: "regAvatarError", inputId: null }
};


function setStepUI(step) {
  regStep = step;

  [1, 2, 3].forEach(n => {
    el("reg-step-" + n).style.display = n === step ? "flex" : "none";
    el("step-bar-" + n).className = "step-bar " + (n <= step ? "active" : "inactive");
  });

  el("registerBack").style.display = step > 1 ? "flex" : "none";
  el("registerNextBtn").innerText = step < 3 ? "Next" : "Sign Up";
}


function openRegister() {
  regStep = 1;
  regAvatarFile = null;

  ["regEmail", "regPassword", "regConfirm", "regUsername"].forEach(id => {
    el(id).value = "";
  });

  Object.values(FIELD_MAP).forEach(f => {
    const err = el(f.errorId);
    if (err) err.innerText = "";
  });

  el("avatarPlaceholder").style.display = "flex";
  el("avatarFilled").style.display = "none";
  el("avatarPreview").src = "";

  setStepUI(1);
  openModal("registerModal");
}


function registerNext() {
  if (regStep === 1) {
    const email = el("regEmail").value.trim();

    if (!email) return setError("regEmail", "regEmailError", "Email required");
    if (email.length < 3) return setError("regEmail", "regEmailError", "Too short");
    if (!validateEmail(email)) return setError("regEmail", "regEmailError", "Invalid email");

    setStepUI(2);
    return;
  }

  if (regStep === 2) {
    const pw = el("regPassword").value;
    const cpw = el("regConfirm").value;

    let ok = true;

    if (!pw || pw.length < 3) {
      setError("regPassword", "regPasswordError", "Min 3 characters");
      ok = false;
    }

    if (!cpw) {
      setError("regConfirm", "regConfirmError", "Required");
      ok = false;
    } else if (cpw !== pw) {
      setError("regConfirm", "regConfirmError", "Passwords mismatch");
      ok = false;
    }

    if (!ok) return;

    setStepUI(3);
    return;
  }

  submitRegister();
}

function submitRegister() {
  const username = el("regUsername").value.trim();

  if (!username || username.length < 3) {
    setError("regUsername", "regUsernameError", "Min 3 characters");
    return;
  }

  const btn = el("registerNextBtn");
  if (btn.disabled) return; 

  btn.disabled = true;
  btn.innerText = "Creating...";

  const formData = new FormData();
  formData.append("email", el("regEmail").value.trim());
  formData.append("password", el("regPassword").value);
  formData.append("password_confirmation", el("regConfirm").value);
  formData.append("username", username);

  if (regAvatarFile) formData.append("avatar", regAvatarFile);

  fetch(REGISTER_API, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData
  })
    .then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        const errs = data.errors || {};

        Object.entries(errs).forEach(([field, msg]) => {
          const map = FIELD_MAP[field];
          if (!map) return;

          const text = Array.isArray(msg) ? msg[0] : msg;
          const errEl = el(map.errorId);

          if (errEl) errEl.innerText = text;
        });

        btn.disabled = false;
        btn.innerText = "Sign Up";
        return;
      }

      saveToken(data);
      closeModal("registerModal");
      setAuthUI(true);
    })
    .catch(() => {
      el("regUsernameError").innerText = "Network error";
      btn.disabled = false;
      btn.innerText = "Sign Up";
    });
}


function applyAvatarFile(file) {
  const err = el("regAvatarError");
  err.innerText = "";

  if (!ALLOWED_TYPES.includes(file.type)) {
    err.innerText = "Only JPG/PNG/WebP allowed";
    return;
  }

  if (file.size > MAX_AVATAR_SIZE) {
    err.innerText = "Max 2MB allowed";
    return;
  }

  regAvatarFile = file;

  const reader = new FileReader();
  reader.onload = e => {
    el("avatarPreview").src = e.target.result;
    el("avatarPlaceholder").style.display = "none";
    el("avatarFilled").style.display = "flex";
  };

  reader.readAsDataURL(file);
}