import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

/*
 * Wraps the whole app. Anything inside can read `user`/`role`/`loading`
 * or call login()/register()/logout() via useContext(AuthContext).
 *
 * On first load we check localStorage for a saved token. If one exists,
 * we ask Django "who am I?" via /api/profile/ to restore the session -
 * this is what keeps a customer logged in after refreshing the page.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("profile/")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await api.post("login/", { username, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post("register/", payload);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post("logout/");
    } catch (err) {
      // Even if the server call fails (e.g. token already expired),
      // we still want to clear the local session below.
    }
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
