export interface ProgressFields {
  id: string
  completed: number
  total: number
  name?: string
}

export interface Progress extends ProgressFields {
  startTime: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ProgressJson extends ProgressFields {
  startTime: string
  updatedAt: string
}

export interface ProgressUpsertBody {
  completed: number
  total: number
  startTime: Date
  name?: string
}

export interface ProgressUpserted extends ProgressUpsertBody {
  id: string
}