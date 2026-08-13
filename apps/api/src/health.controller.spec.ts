import { describe, expect, it, vi } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns a liveness payload without touching the database", () => {
    const controller = new HealthController({} as never);
    expect(controller.liveness()).toMatchObject({
      status: "ok",
      service: "hsk-mind-api",
    });
  });

  it("checks database readiness through Prisma", async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
    };
    const controller = new HealthController(prisma as never);
    await expect(controller.readiness()).resolves.toEqual({
      status: "ok",
      database: "ok",
    });
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });
});
