export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'SCRAPING_FAILED'
  | 'AI_GENERATION_FAILED'
  | 'DATABASE_ERROR';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = 'INTERNAL_SERVER_ERROR',
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}
