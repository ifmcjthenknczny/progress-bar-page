import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const progressCollectionName = process.env.MONGODB_COLLECTION || 'progress'

const progressSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true, index: true },
    completed: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '`completed` must be an integer',
      },
    },
    total: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '`total` must be an integer',
      },
    },
    startTime: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: progressCollectionName,
    versionKey: false,
    timestamps: false,
  },
)

export type ProgressModelAttrs = InferSchemaType<typeof progressSchema>

export const ProgressModel =
  (mongoose.models.Progress as mongoose.Model<ProgressModelAttrs>) ??
  mongoose.model<ProgressModelAttrs>('Progress', progressSchema)

