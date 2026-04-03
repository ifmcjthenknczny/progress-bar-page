import { z } from 'zod'

export const ProgressIdSchema = z.string()

const CoercedIntSchema = z.coerce.number().int()

export const ProgressGetParamsSchema = z.object({
  id: ProgressIdSchema,
})

export const ProgressUpsertBodySchema = z
  .object({
    id: ProgressIdSchema.optional(),
    completed: CoercedIntSchema,
    total: CoercedIntSchema,
    startTime: z.coerce.date(),
  })
  .refine((data) => !Number.isNaN(data.startTime.getTime()), {
    message: '`startTime` must be a valid date',
    path: ['startTime'],
  })

export type ProgressUpsertBody = z.infer<typeof ProgressUpsertBodySchema>

