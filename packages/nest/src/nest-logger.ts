import { Inject, Injectable, type LoggerService } from '@nestjs/common'
import { Logger, type LogArg } from '@olog-js/core'

type NestLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'verbose'

const ToLogArg = (value: unknown): LogArg => {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Error) {
    return value
  }

  if (Array.isArray(value)) {
    return {
      value,
    }
  }

  if (typeof value === 'object') {
    return value as Record<string, unknown>
  }

  return String(value)
}

/**
 * Adapter for Nest's own logs: `app.useLogger(app.get(OlogNestLogger))`.
 * Nest passes the context as the last string argument and, for errors, the stack as a separate string.
 */
@Injectable()
export class OlogNestLogger implements LoggerService {
  private readonly children = new Map<string, Logger>()

  constructor(@Inject(Logger) private readonly root: Logger) {}

  log(message: unknown, ...params: unknown[]): void {
    this.write('info', message, params)
  }

  error(message: unknown, ...params: unknown[]): void {
    this.write('error', message, params)
  }

  warn(message: unknown, ...params: unknown[]): void {
    this.write('warn', message, params)
  }

  debug(message: unknown, ...params: unknown[]): void {
    this.write('debug', message, params)
  }

  verbose(message: unknown, ...params: unknown[]): void {
    this.write('verbose', message, params)
  }

  fatal(message: unknown, ...params: unknown[]): void {
    this.write('fatal', message, params)
  }

  private write(level: NestLevel, message: unknown, params: unknown[]): void {
    const last = params.at(-1)
    const context = typeof last === 'string' ? last : undefined
    const rest = context === undefined ? params : params.slice(0, -1)
    const stack = rest.find((param): param is string => typeof param === 'string')

    this.scoped(context)[level](ToLogArg(message), ...(stack === undefined ? [] : [{ stack }]))
  }

  private scoped(context: string | undefined): Logger {
    if (context === undefined) {
      return this.root
    }

    let child = this.children.get(context)

    if (child === undefined) {
      child = this.root.child(context)
      this.children.set(context, child)
    }

    return child
  }
}
