const getApiErrorMessage = (data: unknown, status: number): string => {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return `API request failed with status ${status}.`;
};

export class ApiError extends Error {
  readonly data: unknown;
  readonly status: number;

  constructor(status: number, data: unknown) {
    super(getApiErrorMessage(data, status));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const createApiError = async (response: Response): Promise<ApiError> => {
  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return new ApiError(response.status, data);
};
