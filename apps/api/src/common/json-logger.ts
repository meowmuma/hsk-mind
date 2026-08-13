import { Injectable, LoggerService } from "@nestjs/common";

@Injectable()
export class JsonLogger implements LoggerService {
  private write(
    level: string,
    message: unknown,
    context?: string,
    trace?: string,
  ): void {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: typeof message === "string" ? message : JSON.stringify(message),
      ...(trace ? { trace } : {}),
    };
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  }

  log(message: unknown, context?: string): void {
    this.write("info", message, context);
  }
  error(message: unknown, trace?: string, context?: string): void {
    this.write("error", message, context, trace);
  }
  warn(message: unknown, context?: string): void {
    this.write("warn", message, context);
  }
  debug(message: unknown, context?: string): void {
    this.write("debug", message, context);
  }
  verbose(message: unknown, context?: string): void {
    this.write("verbose", message, context);
  }
}
