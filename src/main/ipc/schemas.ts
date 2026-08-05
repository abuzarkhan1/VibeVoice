import { z } from 'zod'

export const NonEmptyString = z.string().min(1)
export const ShortcutString = z.string().min(1).max(200)
