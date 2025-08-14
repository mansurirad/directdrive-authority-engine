/**
 * Retry Handler for AI API Calls
 * DirectDrive Authority Engine
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryHandler {
  private config: Required<RetryConfig>;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryCondition: this.defaultRetryCondition,
      ...config,
    };
  }

  /**
   * Default retry condition - retry on network errors and rate limits
   */
  private defaultRetryCondition(error: any): boolean {
    // Retry on network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // Retry on rate limit errors
    if (error.response?.status === 429) {
      return true;
    }

    // Retry on server errors
    if (error.response?.status >= 500) {
      return true;
    }

    // Don't retry on client errors (4xx except 429)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }

    return true;
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry if condition is not met
        if (!this.config.retryCondition(error)) {
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt === this.config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelay
        );

        console.warn(`Retry attempt ${attempt + 1}/${this.config.maxRetries} after ${delay}ms delay:`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Calculate next retry delay
   */
  calculateDelay(attempt: number): number {
    return Math.min(
      this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt),
      this.config.maxDelay
    );
  }
}