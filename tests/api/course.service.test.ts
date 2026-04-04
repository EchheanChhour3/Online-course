import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/services/course.service";
import { generateManyCourses } from "@/tests/mocks/bulk-data";
import { createMockResponse } from "@/tests/helpers/mock-fetch";

describe("course.service (API client)", () => {
  const token = "course-token";
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("positive: getCourses returns full response with many items (150)", async () => {
    const items = generateManyCourses(150);
    const body = {
      message: "OK",
      status: "OK",
      requested_time: "",
      payload: {
        items,
        pagination: {
          totalElements: 10_000,
          currentPage: 1,
          pageSize: 150,
          totalPages: 67,
        },
      },
    };
    fetchSpy.mockResolvedValue(createMockResponse(true, 200, body));
    const res = await getCourses(token, { page: 1, size: 150 });
    expect(res.payload.items).toHaveLength(150);
    expect(res.payload.pagination.totalElements).toBe(10_000);
  });

  it("positive: getCourses bulk payload (400 courses)", async () => {
    const items = generateManyCourses(400);
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        message: "OK",
        status: "OK",
        requested_time: "",
        payload: {
          items,
          pagination: {
            totalElements: 20_000,
            currentPage: 2,
            pageSize: 400,
            totalPages: 50,
          },
        },
      })
    );
    const res = await getCourses(token, { page: 2, size: 400 });
    expect(res.payload.items).toHaveLength(400);
    expect(res.payload.items[399].course_name).toContain("00400");
  });

  it("negative: getCourses throws with errors.errorMessage", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(false, 403, {
        errors: { errorMessage: "Forbidden" },
      })
    );
    await expect(getCourses(token)).rejects.toThrow("Forbidden");
  });

  it("positive: getCourseById", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        message: "OK",
        payload: { course_id: 1, course_name: "A" },
      })
    );
    const res = await getCourseById(token, 1);
    expect(res.payload.course_name).toBe("A");
  });

  it("positive: createCourse trims name and description", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 201, {
        payload: { course_id: 9, course_name: "Trimmed" },
      })
    );
    await createCourse(token, {
      category_id: 1,
      instructor_id: 2,
      course_name: "  Trimmed  ",
      description: "  desc  ",
    });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.course_name).toBe("Trimmed");
    expect(body.description).toBe("desc");
    expect(body.is_active).toBe(true);
    expect(body.course_status).toBe("NEW");
  });

  it("positive: updateCourse sends is_active and course_status", async () => {
    fetchSpy.mockResolvedValue(
      createMockResponse(true, 200, {
        payload: { course_id: 1, course_name: "U" },
      })
    );
    await updateCourse(token, 1, {
      category_id: 2,
      course_name: "U",
      description: "d",
      is_active: false,
      course_status: "POPULAR",
    });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body)).is_active).toBe(false);
    expect(JSON.parse(String(init.body)).course_status).toBe("POPULAR");
  });

  it("positive: deleteCourse", async () => {
    fetchSpy.mockResolvedValue(createMockResponse(true, 204, {}));
    await deleteCourse(token, 3);
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/courses\/3$/);
  });
});
