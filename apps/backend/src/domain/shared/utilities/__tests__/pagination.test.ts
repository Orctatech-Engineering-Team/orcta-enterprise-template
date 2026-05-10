import { describe, it, expect } from "vitest";
import { buildPaginationResult } from "../pagination";

describe("buildPaginationResult", () => {
  it("builds result for first page with next page", () => {
    const result = buildPaginationResult([1, 2, 3], 1, 10, 25);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
  });

  it("builds result for middle page", () => {
    const result = buildPaginationResult([1, 2, 3], 2, 10, 25);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("builds result for last page", () => {
    const result = buildPaginationResult([1, 2, 3, 4, 5], 3, 10, 25);
    expect(result.page).toBe(3);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it("handles single page", () => {
    const result = buildPaginationResult([1, 2], 1, 10, 2);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });

  it("handles empty data", () => {
    const result = buildPaginationResult([], 1, 10, 0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });

  it("preserves data array", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = buildPaginationResult(data, 1, 2, 2);
    expect(result.data).toEqual(data);
  });
});
