import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import { z, type ZodTypeAny } from 'zod'

export class IpcError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IpcError'
  }
}

type Tuple = readonly ZodTypeAny[]
type Infer<T extends Tuple> = { [K in keyof T]: z.infer<T[K]> }

export function safeHandle<S extends Tuple, R>(
  channel: string,
  schemas: S,
  handler: (event: IpcMainInvokeEvent, ...args: Infer<S>) => R | Promise<R>
): void {
  ipcMain.handle(channel, async (event, ...rawArgs: unknown[]) => {
    if (rawArgs.length !== schemas.length) {
      throw new IpcError(`${channel}: expected ${schemas.length} args, got ${rawArgs.length}`)
    }
    const parsed = schemas.map((schema, i) => {
      const result = schema.safeParse(rawArgs[i])
      if (!result.success) {
        throw new IpcError(`${channel}: arg ${i} invalid — ${result.error.message}`)
      }
      return result.data
      // WHY: zod tuple inference doesn't preserve the structural type without this cast
    }) as unknown as Infer<S>
    return handler(event, ...parsed)
  })
}
