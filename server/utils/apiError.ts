import { createError } from 'h3'
import type { ZodError } from 'zod'

/** Odpowiedź JSON z `data` — w DevTools → Network → Response zobaczysz szczegóły (o ile CORS nie zablokuje). */
export const badRequest = (statusMessage: string, data?: Record<string, unknown>) => {
  return createError({ statusCode: 400, statusMessage, data: data ?? {} })
}

export const zodFieldIssues = (err: ZodError) => ({
  fieldErrors: err.flatten().fieldErrors,
  formErrors: err.flatten().formErrors,
  issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
})
