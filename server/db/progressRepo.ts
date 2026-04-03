import { ProgressModel } from './progressModel'
import { ensureMongooseConnected } from './mongoose'

export type Progress = {
  id: string
  completed: number
  total: number
  startTime: Date
}

export const getProgressById = async (id: string): Promise<Progress | null> => {
  await ensureMongooseConnected()
  const doc = await ProgressModel.findOne({ id }).exec()
  if (!doc) {
    return null
  }

  const obj = doc.toObject() as any
  delete obj._id
  return obj as Progress
}

export const upsertProgress = async (progress: Progress): Promise<Progress> => {
  await ensureMongooseConnected()

  const doc = await ProgressModel.findOneAndUpdate(
    { id: progress.id },
    {
      $set: {
        completed: progress.completed,
        total: progress.total,
        startTime: progress.startTime,
      },
      $setOnInsert: { id: progress.id },
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
  delete obj._id
  return obj as Progress
}

