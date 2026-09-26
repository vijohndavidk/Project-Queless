import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/* Small convenience hook so pages write `useAuth()` instead of
   `useContext(AuthContext)` everywhere. */
export function useAuth() {
  return useContext(AuthContext);
}
