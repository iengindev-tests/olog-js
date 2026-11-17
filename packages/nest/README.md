<div align="center">
<b>NestJS integration for olog-js.</b>

Module · LoggerService adapter · HTTP request logging · graceful shutdown

[![npm](https://img.shields.io/npm/v/@olog-js/nest?color=00afff&label=%40olog-js%2Fnest)](https://www.npmjs.com/package/@olog-js/nest)
[![license](https://img.shields.io/badge/license-MIT-8a5cf6)](./LICENSE)
[![types](https://img.shields.io/badge/types-TypeScript-3178c6)](#)
</div>

## Install

```sh
pnpm add @olog-js/core @olog-js/nest @olog-js/console-transport
```

## Usage

```ts
// app.module.ts
import { OlogModule } from '@olog-js/nest'
import { ConsoleTransport } from '@olog-js/console-transport'

@Module({
  imports: [
    OlogModule.forRoot({
      logger: { level: 'info', transports: [new ConsoleTransport()] },
      http: { exclude: ['/api/health'] },
    }),
  ],
})
export class AppModule {}
```

With config, use `forRootAsync`:

```ts
OlogModule.forRootAsync({
  inject: [Config.KEY],
  useFactory: (config: ConfigType<typeof Config>) => ({
    logger: CreateAppLogger(config), // a Logger instance or LoggerOptions
    http: true,
  }),
})
```

Route Nest's own logs through olog:

```ts
// main.ts
const app = await NestFactory.create(AppModule, { bufferLogs: true })

app.useLogger(app.get(OlogNestLogger))
```

Inject the logger:

```ts
import { Logger } from '@olog-js/core'
import { InjectLogger } from '@olog-js/nest'

@Injectable()
export class FlowsService {
  constructor(
    private readonly logger: Logger,                       // root logger
    @InjectLogger('Flows') private readonly flows: Logger, // child with context "Flows"
  ) {}
}
```

`OlogModule` is global and calls `logger.close()` on application shutdown (enable it with `app.enableShutdownHooks()`).

## HTTP options

| Option | Default | Description |
| --- | --- | --- |
| `context` | `Http` | Context of the HTTP logger |
| `level` | `http` | Level for successful responses; 4xx → `warn`, 5xx → `error` |
| `exclude` | `[]` | Path prefixes or `RegExp` that are not logged |
| `requestIdHeader` | `x-request-id` | Header added to the record as `requestId`, `false` to skip |

More to: [MAIN README](https://github.com/iengindev/olog-js#readme)
