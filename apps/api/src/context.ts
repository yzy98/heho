import type { AuthServer } from "@heho/auth/server";

export interface AppEnv {
  Variables: Variables;
}

export interface Variables {
  session: Session;
  user: User;
}

export type User = AuthServer["$Infer"]["Session"]["user"];
export type Session = AuthServer["$Infer"]["Session"]["session"];
