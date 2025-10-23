import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "OPERATOR" | "INSPECTOR";
type Ctx = { role: Role; setRole: (r: Role) => void };

const RoleContext = createContext<Ctx | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("OPERATOR");

  // load/save to localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("inspectflow:role") as Role | null : null;
    if (saved === "OPERATOR" || saved === "INSPECTOR") setRole(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("inspectflow:role", role);
  }, [role]);

  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
