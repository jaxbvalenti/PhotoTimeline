export const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));

  // 🔥 trigger update across app
  window.dispatchEvent(new Event("userUpdated"));
};
