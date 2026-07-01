export const hasOwnerRole = (role: string): boolean =>
  role
    .split(",")
    .map((value) => value.trim())
    .includes("owner");
