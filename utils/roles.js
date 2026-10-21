// Single source of truth for user roles: 1 = admin, 2 = user.
export const ROLES = Object.freeze({ ADMIN: 1, USER: 2 });

// Accepts numeric roles and legacy string roles ("admin"/"user") still stored
// in older documents, and always returns 1 or 2. Throws on anything else.
export const normalizeRole = (value) => {
  if (value === ROLES.ADMIN || value === "1" || value === "admin") return ROLES.ADMIN;
  if (value === ROLES.USER || value === "2" || value === "user") return ROLES.USER;
  throw new Error(`Invalid role: ${value}`);
};

export const isAdminRole = (value) => {
  try {
    return normalizeRole(value) === ROLES.ADMIN;
  } catch {
    return false;
  }
};
