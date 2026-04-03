import type { Progress } from '#shared/types/progress'
import { ProgressModel } from './progressModel'
import { ensureMongooseConnected } from './mongoose'

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
  }
}

export const upsertProgress = async (progress: Progress): Promise<Progress> => {
  await ensureMongooseConnected()

  const doc = await ProgressModel.findOneAndUpdate(
    { _id: progress.id },
    {
      $set: {
        completed: progress.completed,
        total: progress.total,
        startTime: progress.startTime,
      },
      $setOnInsert: { _id: progress.id },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  ).exec()

  if (!doc) {
    throw new Error('Failed to upsert progress')
  }

  const obj = doc.toObject() as any
  return {
    id: String(obj._id),
    completed: obj.completed,
    total: obj.total,
    startTime: obj.startTime,
  }
}

