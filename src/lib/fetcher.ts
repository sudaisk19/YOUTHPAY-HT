export class FetchError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, message: string, data: Record<string, unknown> = {}) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.data = data;
  }
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    throw new FetchError(
      res.status,
      (data.error as string) ?? `Request failed (${res.status})`,
      data
    );
  }

  return data as T;
}
