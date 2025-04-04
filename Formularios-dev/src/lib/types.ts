export interface ServerActionResponse<T> {
    success: boolean
    data?: T
    error?: string
  }