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
