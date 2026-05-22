export function getRedirectByRole(roleCode: string | null): string {
  switch (roleCode) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    default:
      return "/";
  }
}
