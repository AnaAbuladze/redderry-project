function handleLogin() {
  clearError("loginEmail", "emailError");
  clearError("loginPassword", "passwordError");

  const email    = el("loginEmail").value.trim();
  const password = el("loginPassword").value.trim();
  let valid = true;

  if (!email || email.length < 3) {
    setError("loginEmail", "emailError", "Email must be at least 3 characters");
    valid = false;
  } else if (!validateEmail(email)) {
    setError("loginEmail", "emailError", "Invalid email format");
    valid = false;
  }

  if (!password || password.length < 3) {
    setError("loginPassword", "passwordError", "Password must be at least 3 characters");
    valid = false;
  }

  if (!valid) return;

 fetch(LOGIN_API, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({ email, password })
})
  .then(res => res.json().then(data => ({ ok: res.ok, data })))
  .then(({ ok, data }) => {
    console.log("LOGIN RESPONSE:", data); // 👈 აქ სწორია

    if (!ok) {
      console.log("ERROR RESPONSE:", data);
      return;
    }

    saveToken(data);
    closeModal("loginModal");
    setAuthUI(true);
  })
  .catch(err => {
    console.log("NETWORK ERROR:", err);
  })}