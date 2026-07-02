import z from "zod";

const allowedDomainSchema = z
  .url("Allowed domain must be a valid URL")
  .transform((value, context) => {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      context.addIssue({
        code: "custom",
        message: "Allowed domain must use HTTP or HTTPS",
      });

      return z.NEVER;
    }

    if (url.username || url.password) {
      context.addIssue({
        code: "custom",
        message: "Allowed domain cannot contain credentials",
      });

      return z.NEVER;
    }

    if (url.pathname !== "/" || url.search || url.hash) {
      context.addIssue({
        code: "custom",
        message:
          "Allowed domain must be an origin without a path, query, or hash",
      });

      return z.NEVER;
    }

    return url.origin;
  });

export const createEmbedKeySchema = z
  .object({
    chatbotId: z.uuid("Chatbot ID must be a valid UUID"),
    allowedDomains: z
      .array(allowedDomainSchema)
      .max(20, "A maximum of 20 allowed domains is supported")
      .transform((domains) => [...new Set(domains)])
      .default([]),
  })
  .strict();

export type CreateEmbedKeyInput = z.infer<typeof createEmbedKeySchema>;
