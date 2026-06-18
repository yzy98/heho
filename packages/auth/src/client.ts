import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { organizationRoles } from "./access-control";

export interface CreateAuthClientOptions {
  baseURL?: string;
}

export const createAuthClient = ({ baseURL }: CreateAuthClientOptions = {}) =>
  createBetterAuthClient({
    baseURL,
    plugins: [
      organizationClient({
        roles: organizationRoles,
      }),
    ],
  });

export type AuthClient = ReturnType<typeof createAuthClient>;
