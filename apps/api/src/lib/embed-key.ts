import { createHash, randomBytes } from "node:crypto";

const EMBED_KEY_PREFIX = "pk_";
const EMBED_KEY_RANDOM_BYTES = 32;
const EMBED_KEY_DISPLAY_LENGTH = 11;
const EMBED_KEY_PATTERN = /^pk_[A-Za-z0-9_-]{43}$/;

export const generateEmbedKey = () =>
  `${EMBED_KEY_PREFIX}${randomBytes(EMBED_KEY_RANDOM_BYTES).toString("base64url")}`;

export const hashEmbedKey = (rawKey: string) =>
  createHash("sha256").update(rawKey, "utf8").digest("hex");

export const getEmbedKeyPrefix = (rawKey: string) =>
  `${rawKey.slice(0, EMBED_KEY_DISPLAY_LENGTH)}…`;

export const isEmbedKey = (value: string): boolean =>
  EMBED_KEY_PATTERN.test(value);
