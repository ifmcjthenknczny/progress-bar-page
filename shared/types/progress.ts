export interface ProgressFields {
  id: string
  completed: number
  total: number
}

export interface Progress extends ProgressFields {
  startTime: Date
  updatedAt: Date
}

export interface ProgressJson extends ProgressFields {
  startTime: string
  updatedAt: string
}

export interface ProgressUpsertBody {
  completed: number
  total: number
  startTime: Date
}
