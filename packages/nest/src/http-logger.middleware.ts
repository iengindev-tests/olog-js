import type { IncomingMessage, ServerResponse } from 'node:http'
import { Inject, Injectable, type NestMiddleware } from '@nestjs/common'
import { Logger, type LevelName } from '@olog-js/core'

import { OLOG_OPTIONS } from './constants'
import type { OlogHttpOptions, OlogModuleOptions } from './options'

type Request = IncomingMessage & { originalUrl?: string }

const LevelByStatus = (status: number, level: LevelName): LevelName => {
  if (status >= 500) {
    return 'error'
  }

  if (status >= 400) {
    return 'warn'
  }

  return level
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger
  private readonly options: OlogHttpOptions

  constructor(@Inject(OLOG_OPTIONS) options: OlogModuleOptions, @Inject(Logger) root: Logger) {
    this.options = typeof options.http === 'object' ? options.http : {}
    this.logger = root.child(this.options.context ?? 'Http')
  }

  use(req: Request, res: ServerResponse, next: () => void): void {
    const url = req.originalUrl ?? req.url ?? '/'

    if (this.isExcluded(url)) {
      next()

      return
    }

    const start = performance.now()
    const header = this.options.requestIdHeader ?? 'x-request-id'

    res.once('finish', () => {
      const durationMs = Math.round((performance.now() - start) * 100) / 100
      const requestId = header === false ? undefined : req.headers[header] ?? res.getHeader(header)

      this.logger.log(LevelByStatus(res.statusCode, this.options.level ?? 'http'), [req.method, ' ', url, ' ', res.statusCode, ' (', durationMs, 'ms)'].join(''), {
        method: req.method,
        url,
        status: res.statusCode,
        durationMs,
        ...(requestId === undefined ? {} : { requestId }),
      })
    })

    next()
  }

  private isExcluded(url: string): boolean {
    const path = url.split('?')[0] ?? url

    return (this.options.exclude ?? []).some((rule) => typeof rule === 'string' ? path.startsWith(rule) : rule.test(path))
  }
}
