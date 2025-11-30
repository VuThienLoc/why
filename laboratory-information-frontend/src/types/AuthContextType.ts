

import type { User } from "./User";

export interface AuthContextType {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  loading: boolean;
}
