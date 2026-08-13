import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

type RequestWithId = Request & { requestId?: string };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<Response>();
    const requestId = request.requestId ?? "unknown";
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : exceptionResponse &&
            typeof exceptionResponse === "object" &&
            "message" in exceptionResponse
          ? (exceptionResponse as { message: string | string[] }).message
          : status >= 500
            ? "Internal server error"
            : "Request failed";

    if (status >= 500)
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
        undefined,
        requestId,
      );

    response.status(status).json({
      error: {
        code: status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
        message,
        requestId,
        statusCode: status,
      },
    });
  }
}
