import { vi } from "vitest";

export type FetchMockCall = {
  url: string;
  init?: RequestInit;
};

/** Build a Response-like object used by service code (ok, status, text, json). */
export function createMockResponse(
  ok: boolean,
  status: number,
  body: unknown
): Response {
  const textBody =
    typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok,
    status,
    text: async () => textBody,
    json: async () => {
      if (typeof body === "string") return JSON.parse(body);
      return body;
    },
  } as Response;
}

export function mockFetchSequence(
  responses: Array<{ ok: boolean; status: number; body: unknown }>
): ReturnType<typeof vi.fn> {
  let i = 0;
  return vi.fn().mockImplementation(async () => {
    const r = responses[i++];
    if (!r) throw new Error("mockFetchSequence: no more responses");
    return createMockResponse(r.ok, r.status, r.body);
  });
}
