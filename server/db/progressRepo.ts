import type { Progress, ProgressUpsertBody, ProgressUpserted } from '#shared/types/progress'
import { ProgressModel } from './progressModel'
import { ensureMongooseConnected } from './mongoose'
import { PROGRESS_TTL_AFTER_UPDATE_MS } from '~~/shared/config'

export type { Progress } from '#shared/types/progress'

export const getProgressById = async (id: string): Promise<Progress | null> => {
  await ensureMongooseConnected()
  const doc = (await ProgressModel.findById(id).exec()) ?? (await ProgressModel.findOne({ _id: id }).exec())
  if (!doc) {
    return null
  }

  const obj = doc.toObject() as any
  return {
    id: typeof obj._id === 'string' ? obj._id : String(obj.id ?? obj._id),
    completed: obj.completed,
    total: obj.total,
    startTime: obj.startTime,
    updatedAt: obj.updatedAt ?? obj.startTime,
    ...(typeof obj.name === 'string' && obj.name.length > 0 ? { name: obj.name } : {}),
  }
}

export const upsertProgress = async (progress: ProgressUpserted): Promise<Progress> => {
  await ensureMongooseConnected()

  const updatedAt = new Date()

  const $set: Record<string, unknown> = {
    completed: progress.completed,
    total: progress.total,
    startTime: progress.startTime,
    updatedAt,
    expiresAt: new Date(updatedAt.getTime() + PROGRESS_TTL_AFTER_UPDATE_MS),
  }
  if (progress.name !== undefined) {
    $set.name = progress.name
  }

  await ProgressModel.updateOne(
    { _id: progress.id },
    {
      $set,
      $setOnInsert: { _id: progress.id },
    },
    { upsert: true, runValidators: true },
  ).exec()

  const doc = await ProgressModel.findById(progress.id).exec()
  if (!doc) {
    throw new Error('Failed to upsert progress')
  }

  const obj = doc.toObject() as any
  return {
    id: String(obj._id),
    completed: obj.completed,
    total: obj.total,
    startTime: obj.startTime,
    updatedAt: obj.updatedAt ?? obj.startTime,
    ...(obj.expiresAt instanceof Date ? { expiresAt: obj.expiresAt } : {}),
    ...(typeof obj.name === 'string' && obj.name.length > 0 ? { name: obj.name } : {}),
  }
}

