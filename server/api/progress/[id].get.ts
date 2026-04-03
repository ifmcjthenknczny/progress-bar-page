import { createError, defineEventHandler } from 'h3'
import { getProgressById } from '../../db/progressRepo'
import { ProgressParamsSchema } from '../../schemas/progress'

export default defineEventHandler(async (event) => {
  const parsed = ProgressParamsSchema.safeParse(event.context.params)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid param: id' })
  }

  const doc = await getProgressById(parsed.data.id)
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return doc
})

