import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "./api-client";

function isApiErrorWithCode(
  data: unknown,
  code: string
): data is { code: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    (data as { code: unknown }).code === code
  );
}

export async function getCurrentOrganizationResult() {
  const response = await apiClient.organizations.current.$get();

  if (response.ok) {
    const { organization } = await response.json();
    return {
      status: "ok" as const,
      organization,
    };
  }

  const data = await response.json();

  if (
    response.status === 403 &&
    isApiErrorWithCode(data, "ORGANIZATION_ONBOARDING_REQUIRED")
  ) {
    return {
      status: "onboarding_required" as const,
    };
  }

  if (
    response.status === 403 &&
    isApiErrorWithCode(data, "ORGANIZATION_MEMBERSHIP_REQUIRED")
  ) {
    return {
      status: "membership_required" as const,
    };
  }

  return {
    status: "error" as const,
    error: {
      status: response.status,
      data,
    },
  };
}

export const currentOrganizationResultQueryOptions = () =>
  queryOptions({
    queryKey: ["current-organization"],
    queryFn: getCurrentOrganizationResult,
    staleTime: 30_000,
  });
