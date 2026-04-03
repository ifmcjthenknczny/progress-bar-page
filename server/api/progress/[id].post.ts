import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import type { Progress } from '#shared/types/progress'
import { ProgressIdSchema, ProgressUpsertBodySchema } from '../../schemas/progress'
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

  const rawBody = await readBody(event)
  const bodyParse = ProgressUpsertBodySchema.safeParse(rawBody)
  if (!bodyParse.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  const idCandidate = bodyParse.data.id ?? event.context.params?.id
  const idParse = ProgressIdSchema.safeParse(idCandidate)
  if (!idParse.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid param: id' })
  }

  const progress: Progress = {
    id: idParse.data,
    completed: bodyParse.data.completed,
    total: bodyParse.data.total,
    startTime: bodyParse.data.startTime,
    updatedAt: new Date(),
  }

  return upsertProgress(progress)
})

