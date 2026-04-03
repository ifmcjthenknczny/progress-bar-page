import { createError, defineEventHandler, readBody } from 'h3'
import type { Progress } from '#shared/types/progress'
import { ProgressIdSchema, ProgressUpsertBodySchema } from '../../schemas/progress'
import { upsertProgress } from '../../db/progressRepo'

export default defineEventHandler(async (event) => {
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

