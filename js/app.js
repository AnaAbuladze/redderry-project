window.loadUser = function () {
  const token = getCookie("token");
  if (!token) return;

  fetch("https://api.redclass.redberryinternship.ge/api/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  })
    .then(res => {
      return res.json().then(data => {
        return { ok: res.ok, data };
      });
    })
    .then(({ ok, data }) => {
      if (!ok) {
        console.log("ME ERROR:", data);
        return;
      }

      const user = data.data;

      setCookie("user", JSON.stringify(user), 7);

      if (typeof updateTopUI === "function") updateTopUI();
      if (typeof updateNavbarAvatar === "function") updateNavbarAvatar();
      if (typeof updateProfileIndicator === "function") updateProfileIndicator();
    })
    .catch(err => {
      console.error("Failed to load user:", err);
    });
};

window.handleAvatarChange = function (input) {
  const file = input.files[0];
  if (!file) return;

  applyAvatarFile(file);
};