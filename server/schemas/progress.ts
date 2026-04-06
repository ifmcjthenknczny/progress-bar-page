import { z } from 'zod'

export const ProgressIdSchema = z.string().min(1)

const CoercedIntSchema = z.coerce.number().int()

export const ProgressParamsSchema = z.object({
  id: ProgressIdSchema,
})

export const ProgressUpsertBodySchema = z
  .object({
    id: ProgressIdSchema,
    completed: CoercedIntSchema,
    total: CoercedIntSchema,
    startTime: z.coerce.date(),
    name: z.string().max(500).optional(),
  })
  .refine((data) => !Number.isNaN(data.startTime.getTime()), {
    message: '`startTime` must be a valid date',
    path: ['startTime'],
  })

export type ProgressUpsertBody = z.infer<typeof ProgressUpsertBodySchema>

