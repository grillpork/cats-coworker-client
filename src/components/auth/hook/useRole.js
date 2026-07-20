import { useAuth } from "./useAuth";

export const useRole = () => {
  const { user } = useAuth();
  const role = user?.role || null;

  const hasRole = (allowedRoles = []) => {
    if (allowedRoles.length === 0) return true;
    return !!role && allowedRoles.includes(role);
  };

  const isAdmin = role === "admin";
  const isEmployee = role === "employee";

  return {
    role,
    hasRole,
    isAdmin,
    isEmployee,
  };
};
