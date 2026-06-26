import { memberAc, ownerAc } from "better-auth/plugins/organization/access";

export const organizationRoles = {
  owner: ownerAc,
  member: memberAc,
} as const;

export type OrganizationRole = keyof typeof organizationRoles;
