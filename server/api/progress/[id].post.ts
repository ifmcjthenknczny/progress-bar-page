import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import type { Progress } from '#shared/types/progress'
import { ProgressParamsSchema, ProgressUpsertBodySchema } from '../../schemas/progress'
import { upsertProgress } from '../../db/progressRepo'

export default defineEventHandler(async (event) => {
  const requiredApiKey = process.env.PROGRESS_API_KEY
  if (!requiredApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Missing server API key configuration' })
  }

  const requestApiKey = getHeader(event, 'x-api-key')
  if (requestApiKey !== requiredApiKey) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const paramsParse = ProgressParamsSchema.safeParse(event.context.params)
  if (!paramsParse.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid param: id' })
  }

  const rawBody = await readBody(event)
  const bodyParse = ProgressUpsertBodySchema.safeParse(rawBody)
  if (!bodyParse.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  const progress: Progress = {
    id: paramsParse.data.id,
    completed: bodyParse.data.completed,
    total: bodyParse.data.total,
    startTime: bodyParse.data.startTime,
    updatedAt: new Date(),
  }

  await upsertProgress(progress)

  return { id: paramsParse.data.id }
})
