import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { validateEnv } from "./config/env";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { PrismaService } from "./common/prisma.service";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })],
  controllers: [HealthController],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes(HealthController);
  }
}
