type DiagnosticContext = {
  operation: string;
  table: string;
  select: string;
  filters: readonly string[];
  response?: {
    status?: number;
    statusText?: string;
    count?: number | null;
  };
};

function sanitizeStack(stack: string): string {
  return stack
    .replace(/https?:\/\/[^\s)"']+/g, "[redacted-url]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

function readErrorFields(error: unknown) {
  if (!error || (typeof error !== "object" && typeof error !== "function")) {
    return {
      valueType: typeof error,
      value: typeof error === "string" ? error : undefined,
    };
  }

  const value = error as Record<string, unknown>;
  const name =
    typeof value.name === "string"
      ? value.name
      : Object.getPrototypeOf(error)?.constructor?.name;

  return {
    name,
    constructorName: Object.getPrototypeOf(error)?.constructor?.name,
    message: typeof value.message === "string" ? value.message : undefined,
    stack:
      typeof value.stack === "string"
        ? sanitizeStack(value.stack)
        : undefined,
    code:
      typeof value.code === "string" || typeof value.code === "number"
        ? value.code
        : undefined,
    details: typeof value.details === "string" ? value.details : undefined,
    hint: typeof value.hint === "string" ? value.hint : undefined,
    status:
      typeof value.status === "number" || typeof value.status === "string"
        ? value.status
        : undefined,
    cause:
      value.cause && typeof value.cause === "object"
        ? readCause(value.cause)
        : undefined,
    ownPropertyNames: Object.getOwnPropertyNames(error),
  };
}

function readCause(cause: object) {
  const value = cause as Record<string, unknown>;
  const stack = typeof value.stack === "string" ? value.stack : undefined;
  return {
    name:
      typeof value.name === "string"
        ? value.name
        : Object.getPrototypeOf(cause)?.constructor?.name,
    message: typeof value.message === "string" ? value.message : undefined,
    code:
      typeof value.code === "string" || typeof value.code === "number"
        ? value.code
        : undefined,
    stack: stack ? sanitizeStack(stack) : undefined,
    ownPropertyNames: Object.getOwnPropertyNames(cause),
  };
}

export function logSupabaseDiagnostic(
  label: string,
  context: DiagnosticContext,
  error: unknown,
): void {
  if (process.env.NODE_ENV === "production") return;

  console.error(
    `[Supabase diagnostic] ${label}`,
    JSON.stringify({
      context,
      response: context.response,
      error: readErrorFields(error),
    }),
  );
}

export function logSupabaseException(
  label: string,
  context: DiagnosticContext,
  error: unknown,
): void {
  if (process.env.NODE_ENV === "production") return;

  console.error(
    `[Supabase diagnostic] ${label} threw`,
    JSON.stringify({
      context,
      response: context.response,
      exception: readErrorFields(error),
    }),
  );
}
