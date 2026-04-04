import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  addGroupCourse,
  removeGroupCourse,
  getGroupCourseIdsByUser,
} from "@/services/group.service";
import { generateManyGroups, buildGroupItem } from "@/tests/mocks/bulk-data";
import { createMockResponse } from "@/tests/helpers/mock-fetch";

describe("group.service (API client)", () => {
  const token = "test-bearer";
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("positive: getAllGroups returns payload with large item set (200)", async () => {
    const items = generateManyGroups(200);
    const payload = {
      items,
      pagination: {
        totalElements: 5000,
        currentPage: 1,
        pageSize: 200,
        totalPages: 25,
      },
    };
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload })
    );

    const result = await getAllGroups(token, { page: 1, size: 200 });
    expect(result.items).toHaveLength(200);
    expect(result.pagination.totalElements).toBe(5000);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/groups?page=1&size=200"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );
  });

  it("positive: getAllGroups stress payload (500 groups)", async () => {
    const items = generateManyGroups(500);
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        payload: {
          items,
          pagination: {
            totalElements: 50_000,
            currentPage: 1,
            pageSize: 500,
            totalPages: 100,
          },
        },
      })
    );
    const result = await getAllGroups(token, { page: 1, size: 500 });
    expect(result.items).toHaveLength(500);
    expect(result.items[499].group_name).toContain("0500");
  });

  it("positive: getAllGroups passes sort params", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        payload: { items: [], pagination: { totalElements: 0, currentPage: 1, pageSize: 100, totalPages: 0 } },
      })
    );
    await getAllGroups(token, { sortBy: "groupName", direction: "DESC", page: 2, size: 50 });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("sortBy=groupName");
    expect(url).toContain("direction=DESC");
    expect(url).toContain("page=2");
    expect(url).toContain("size=50");
  });

  it("negative: getAllGroups throws on 401 with JSON message", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 401, { message: "Unauthorized" })
    );
    await expect(getAllGroups(token)).rejects.toThrow("Unauthorized");
  });

  it("negative: getAllGroups throws on non-JSON error body", async () => {
    const bad = {
      ok: false,
      status: 500,
      text: async () => "plain text failure",
      json: async () => ({}),
    } as Response;
    fetchSpy.mockResolvedValue(bad);
    await expect(getAllGroups(token)).rejects.toThrow("plain text failure");
  });

  it("positive: getGroupById returns group", async () => {
    const g = buildGroupItem(42);
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, { payload: g }));
    const result = await getGroupById(token, 42);
    expect(result.group_id).toBe(42);
  });

  it("negative: getGroupById 404", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 404, { message: "Not found" })
    );
    await expect(getGroupById(token, 999)).rejects.toThrow("Not found");
  });

  it("positive: createGroup POST body and returns payload", async () => {
    const created = buildGroupItem(1);
    fetchSpy.mockResolvedValue(createMockResponse(true, 201, { payload: created }));
    const result = await createGroup(token, "New Group");
    expect(result.group_name).toBeDefined();
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ group_name: "New Group" });
  });

  it("negative: createGroup validation error", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 400, { message: "Invalid group name" })
    );
    await expect(createGroup(token, "")).rejects.toThrow("Invalid group name");
  });

  it("positive: updateGroup PUT", async () => {
    const updated = buildGroupItem(5);
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, { payload: updated }));
    await updateGroup(token, 5, "Renamed");
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ group_name: "Renamed" });
  });

  it("positive: deleteGroup DELETE without body", async () => {
    fetchSpy.mockResolvedValue(createMockResponse(true, 204, {}));
    await deleteGroup(token, 10);
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("DELETE");
  });

  it("positive: addGroupMember POST user_id", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: buildGroupItem(1) })
    );
    await addGroupMember(token, 1, 99);
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ user_id: 99 });
  });

  it("positive: removeGroupMember DELETE correct path", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: buildGroupItem(1) })
    );
    await removeGroupMember(token, 1, 99);
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/members\/99$/);
  });

  it("positive: addGroupCourse POST course_id", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: buildGroupItem(1) })
    );
    await addGroupCourse(token, 1, 55);
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ course_id: 55 });
  });

  it("positive: removeGroupCourse DELETE path", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: buildGroupItem(1) })
    );
    await removeGroupCourse(token, 1, 55);
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/courses\/55$/);
  });

  it("positive: getGroupCourseIdsByUser returns array", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, { payload: [1, 2, 3] })
    );
    const ids = await getGroupCourseIdsByUser(token, 7);
    expect(ids).toEqual([1, 2, 3]);
  });

  it("positive: getGroupCourseIdsByUser empty payload becomes []", async () => {
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, {}));
    const ids = await getGroupCourseIdsByUser(token, 7);
    expect(ids).toEqual([]);
  });
});
