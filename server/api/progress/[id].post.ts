import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import type { Progress, ProgressUpserted } from '#shared/types/progress'
import { ProgressParamsSchema, ProgressUpsertBody, ProgressUpsertBodySchema } from '../../schemas/progress'
import { upsertProgress } from '../../db/progressRepo'
import { badRequest, zodFieldIssues } from '../../utils/apiError'

const log = (...args: unknown[]) => {
  console.error('[api/progress POST]', ...args)
}

export default defineEventHandler(async (event) => {
  const requiredApiKey = process.env.PROGRESS_API_KEY
  if (!requiredApiKey) {
    log('PROGRESS_API_KEY is not set on the server')
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing server API key configuration',
      data: { hint: 'Set PROGRESS_API_KEY in .env' },
    })
  }

  const requestApiKey = getHeader(event, 'x-api-key')
  if (requestApiKey !== requiredApiKey) {
    log('x-api-key mismatch or missing', { hasHeader: Boolean(requestApiKey) })
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        hint: 'Header x-api-key must equal PROGRESS_API_KEY',
        headerPresent: Boolean(requestApiKey),
      },
    })
  }

  const paramsParse = ProgressParamsSchema.safeParse(event.context.params)
  if (!paramsParse.success) {
    log('invalid route params', zodFieldIssues(paramsParse.error))
    throw badRequest('Invalid param: id', zodFieldIssues(paramsParse.error))
  }

  let rawBody: unknown
  try {
    rawBody = await readBody(event)
  } catch (e) {
    log('readBody failed', e)
    throw badRequest('Could not read request body', {
      hint: 'Send JSON with Content-Type: application/json',
      cause: String(e),
    })
  }

  const bodyParse = ProgressUpsertBodySchema.safeParse(rawBody)
  if (!bodyParse.success) {
    log('invalid body', rawBody, zodFieldIssues(bodyParse.error))
    throw badRequest('Invalid request body', {
      ...zodFieldIssues(bodyParse.error),
      hint: 'Expected JSON: { completed, total, startTime } optional name; startTime = ISO string or number',
      receivedType: rawBody === null || rawBody === undefined ? 'empty/null' : typeof rawBody,
    })
  }

  const progress: ProgressUpserted = {
    id: paramsParse.data.id,
    completed: bodyParse.data.completed,
    total: bodyParse.data.total,
    startTime: bodyParse.data.startTime,
    ...(bodyParse.data.name !== undefined ? { name: bodyParse.data.name } : {}),
  }

  try {
    await upsertProgress(progress)
  } catch (e) {
    log('upsertProgress failed', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save progress',
      data: { hint: 'Database error; see server logs' },
    })
  }

  return { id: paramsParse.data.id }
})
