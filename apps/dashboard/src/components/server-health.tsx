import { Button } from "@heho/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

async function getServerHealth() {
  // Manually slow down 1s in dev environment
  if (import.meta.env.DEV) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const response = await apiClient.health.$get();

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}.`);
  }

  return response.json();
}

function getStatus({
  isError,
  isFetching,
  isLoading,
}: {
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
}) {
  if (isLoading || isFetching) {
    return "loading";
  }

  if (isError) {
    return "offline";
  }

  return "online";
}

function getMessage({
  error,
  isError,
  isLoading,
}: {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return "Checking server health...";
  }

  if (isError) {
    return error?.message ?? "Unable to reach the server.";
  }

  return "Server is online.";
}

export function ServerHealth() {
  const {
    data,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
    status: queryStatus,
  } = useQuery({
    queryKey: ["server-health"],
    queryFn: getServerHealth,
  });

  const status = getStatus({ isError, isFetching, isLoading });
  const message = getMessage({
    error,
    isError,
    isLoading,
  });

  const statusClassName = {
    loading: "bg-muted text-muted-foreground",
    online: "bg-emerald-500 text-white",
    offline: "bg-destructive text-destructive-foreground",
  }[status];

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium text-base">Server health</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 font-medium text-xs ${statusClassName}`}
        >
          {status}
        </span>
      </div>

      {queryStatus === "success" ? (
        <p className="text-muted-foreground text-sm">Service: {data.service}</p>
      ) : null}

      <Button
        disabled={isFetching}
        onClick={() => {
          refetch();
        }}
        type="button"
        variant="outline"
      >
        Check again
      </Button>
    </section>
  );
}
