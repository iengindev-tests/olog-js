import { Global, Inject, Module, type DynamicModule, type MiddlewareConsumer, type NestModule, type OnApplicationShutdown, type Provider } from '@nestjs/common'
import { CreateLogger, Logger } from '@olog-js/core'

import { GetLoggerToken, OLOG_OPTIONS } from './constants'
import { HttpLoggerMiddleware } from './http-logger.middleware'
import { Contexts } from './inject-logger'
import { OlogNestLogger } from './nest-logger'
import type { OlogModuleAsyncOptions, OlogModuleOptions } from './options'

const ResolveLogger = ({ logger }: OlogModuleOptions): Logger => logger instanceof Logger ? logger : CreateLogger(logger)

@Global()
@Module({})
export class OlogModule implements NestModule, OnApplicationShutdown {
  constructor(
    @Inject(OLOG_OPTIONS) private readonly options: OlogModuleOptions,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  static forRoot(options: OlogModuleOptions): DynamicModule {
    return OlogModule.create({
      provide: OLOG_OPTIONS,
      useValue: options,
    })
  }

  static forRootAsync(options: OlogModuleAsyncOptions): DynamicModule {
    return OlogModule.create({
      provide: OLOG_OPTIONS,
      inject: options.inject ?? [],
      useFactory: options.useFactory,
    }, options.imports)
  }

  private static create(options: Provider, imports: DynamicModule['imports'] = []): DynamicModule {
    const children: Provider[] = [...Contexts].map((context) => ({
      provide: GetLoggerToken(context),
      inject: [Logger],
      useFactory: (root: Logger): Logger => root.child(context),
    }))

    return {
      module: OlogModule,
      imports,
      providers: [
        options,
        {
          provide: Logger,
          inject: [OLOG_OPTIONS],
          useFactory: ResolveLogger,
        },
        OlogNestLogger,
        ...children,
      ],
      exports: [
        Logger,
        OlogNestLogger,
        ...[...Contexts].map(GetLoggerToken),
      ],
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    if (this.options.http) {
      consumer.apply(HttpLoggerMiddleware).forRoutes('*')
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.logger.close()
  }
}
