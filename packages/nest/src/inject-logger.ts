import { Inject } from '@nestjs/common'
import { Logger } from '@olog-js/core'

import { GetLoggerToken } from './constants'

export const Contexts = new Set<string>()

/**
 * Injects the root logger, or its child with the given context.
 * Contexts are collected at import time, so `OlogModule.forRoot()` must be evaluated after the classes that use them.
 */
export const InjectLogger = (context?: string): PropertyDecorator & ParameterDecorator => {
  if (context === undefined) {
    return Inject(Logger)
  }

  Contexts.add(context)

  return Inject(GetLoggerToken(context))
}
