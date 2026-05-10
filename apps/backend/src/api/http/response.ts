export type ApiErrorBody = {
  error: string;
  message: string;
  requestId?: string;
  details?: Record<string, unknown>;
};

export function toApiErrorBody(error: ApiErrorBody): ApiErrorBody {
  return error;
}
