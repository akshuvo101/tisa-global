export type ApplicationRole = "admin" | "customer";

export function isApplicationRole(role: string): role is ApplicationRole {
  return role === "admin" || role === "customer";
}

export function getRoleHome(role: ApplicationRole) {
  return role === "admin" ? "/admin" : "/account";
}

export function getPostAuthPath(
  role: ApplicationRole,
  requestedPath: string | null | undefined,
  origin: string,
) {
  if (role === "admin") {
    return "/admin";
  }

  if (!requestedPath) {
    return "/account";
  }

  try {
    const target = new URL(requestedPath, origin);
    const isCustomerRoute =
      target.origin === origin &&
      (target.pathname === "/account" ||
        target.pathname.startsWith("/account/") ||
        target.pathname === "/request");

    return isCustomerRoute
      ? `${target.pathname}${target.search}${target.hash}`
      : "/account";
  } catch {
    return "/account";
  }
}
