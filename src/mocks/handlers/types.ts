export interface MockRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  /** Username of the mock session, or null when not signed in. */
  user: string | null;
}

export interface MockResult {
  status: number;
  body: unknown;
}

export type MockHandler = (req: MockRequest) => MockResult | Promise<MockResult>;

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pattern: string;
  handler: MockHandler;
  public?: boolean;
}

export const ok = (data: unknown, message?: string): MockResult => ({
  status: 200,
  body: { success: true, data, message },
});

export const fail = (
  status: number,
  message: string,
  errors?: Record<string, string[]>,
): MockResult => ({
  status,
  body: { success: false, message, errors },
});
