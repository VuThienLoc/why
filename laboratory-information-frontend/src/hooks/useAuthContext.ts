import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../types/AuthContextType";

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
