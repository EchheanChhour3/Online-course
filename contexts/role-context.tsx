"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export type ViewRole = "admin" | "teacher" | "student";

const ROLES: ViewRole[] = ["admin", "teacher", "student"];

function roleFromSession(roleList: string[] | undefined): ViewRole {
  const roles = Array.isArray(roleList) ? roleList : [];
  for (const r of roles) {
    const upper = String(r).toUpperCase();
    if (upper === "ADMIN") return "admin";
    if (upper === "TEACHER") return "teacher";
  }
  return roles.length > 0 ? "student" : "student";
}

interface RoleContextValue {
  role: ViewRole;
  setRole: (role: ViewRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [role, setRoleState] = useState<ViewRole>("student");

  const sessionRole = roleFromSession(session?.user?.role as string[] | undefined);

  useEffect(() => {
    if (status === "loading") return;
    setRoleState(sessionRole);
  }, [status, sessionRole]);

  const setRole = useCallback((r: ViewRole) => {
    if (ROLES.includes(r)) setRoleState(r);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return ctx;
}

export const ROLE_LABELS: Record<ViewRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};
