export interface ProgressFields {
  id: string
  completed: number
  total: number
}

export interface Progress extends ProgressFields {
  startTime: Date
}

export interface ProgressJson extends ProgressFields {
  startTime: string
}

export interface ProgressUpsertBody {
  id?: string
  completed: number
  total: number
  startTime: Date
}
