import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./common/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  liveness(): { status: "ok"; service: string; uptimeSeconds: number } {
    return {
      status: "ok",
      service: "hsk-mind-api",
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  @Get("ready")
  async readiness(): Promise<{ status: "ok"; database: "ok" }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "ok" };
    } catch {
      throw new ServiceUnavailableException("Database is not ready");
    }
  }
}
