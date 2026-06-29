import type { AuthServer } from "@heho/auth/server";
import type { DbClient } from "@heho/db";
import { eq, sql } from "@heho/db/helper";
import { member, organization } from "@heho/db/schema";
import type { CreateOrganizationInput } from "../schemas/organizations";

export type CurrentOrganization = {
  id: string;
  name: string;
  role: string;
  slug: string;
};

export type CreateInitialOrganizationOptions = {
  auth: AuthServer;
  db: DbClient;
  input: CreateOrganizationInput;
  userId: string;
};

export type CreateInitialOrganizationResult =
  | {
      status: "created";
      organization: CurrentOrganization;
    }
  | {
      status: "user_already_has_organization";
      organization: CurrentOrganization;
    }
  | {
      status: "organization_membership_required";
    };

type DbTransaction = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

const ORGANIZATION_INITIALIZATION_LOCK_KEY = 73_640_001;

export const getCurrentOrganization = (db: DbClient, userId: string) =>
  findCurrentOrganization(db, userId);

export const createInitialOrganization = async ({
  auth,
  db,
  input,
  userId,
}: CreateInitialOrganizationOptions): Promise<CreateInitialOrganizationResult> =>
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(${ORGANIZATION_INITIALIZATION_LOCK_KEY})`
    );

    const currentOrganization = await findCurrentOrganization(tx, userId);

    if (currentOrganization) {
      return {
        status: "user_already_has_organization",
        organization: currentOrganization,
      };
    }

    const existingOrganizations = await hasAnyOrganization(tx);

    if (existingOrganizations) {
      return {
        status: "organization_membership_required",
      };
    }

    await auth.api.createOrganization({
      body: {
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        metadata: input.metadata,
        userId,
        keepCurrentActiveOrganization: false,
      },
    });

    const createdOrganization = await findCurrentOrganization(tx, userId);

    if (!createdOrganization) {
      throw new Error("Organization was created but membership was not found.");
    }

    return {
      status: "created",
      organization: createdOrganization,
    };
  });

export const hasAnyOrganization = async (db: DbClient | DbTransaction) => {
  const rows = await db
    .select({ id: organization.id })
    .from(organization)
    .limit(1);

  return rows.length > 0;
};

const findCurrentOrganization = async (
  db: DbClient | DbTransaction,
  userId: string
): Promise<CurrentOrganization | null> => {
  const rows = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .limit(1);

  return rows[0] ?? null;
};
