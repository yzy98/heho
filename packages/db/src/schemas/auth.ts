import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text(),
  createdAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  createdAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  activeOrganizationId: text(),
  activeTeamId: text(),
});

export const account = pgTable("account", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  accessTokenExpiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }),
  scope: text(),
  idToken: text(),
  password: text(),
  createdAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
});

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
});

export const organization = pgTable("organization", {
  id: text().primaryKey(),
  name: text().notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  logo: text(),
  metadata: text(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const member = pgTable("member", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text().notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const invitation = pgTable("invitation", {
  id: text().primaryKey(),
  email: text().notNull(),
  inviterId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text(),
  status: text().notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  expiresAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});
