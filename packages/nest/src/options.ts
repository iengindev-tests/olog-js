import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'
import type { LevelName, Logger, LoggerOptions } from '@olog-js/core'

export interface OlogHttpOptions {
  /** Context of the HTTP logger. Default: `Http` */
  context?:          string
  /** Level for successful responses. 4xx are logged as `warn`, 5xx as `error`. Default: `http` */
  level?:            LevelName
  /** Path prefixes or patterns that are not logged, e.g. `['/api/health']` */
  exclude?:          (string | RegExp)[]
  /** Header to take the request id from, `false` to skip it. Default: `x-request-id` */
  requestIdHeader?:  string | false
}

export interface OlogModuleOptions {
  /** Ready logger instance or options for `CreateLogger` */
  logger:  Logger | LoggerOptions
  /** Log every HTTP request with status and duration */
  http?:   boolean | OlogHttpOptions
}

export interface OlogModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?:     FactoryProvider['inject']
  useFactory:  (...args: any[]) => OlogModuleOptions | Promise<OlogModuleOptions>
}
