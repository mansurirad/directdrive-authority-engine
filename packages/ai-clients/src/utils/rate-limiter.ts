/**
 * Rate Limiting Utilities for AI API Calls
 * DirectDrive Authority Engine
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
  burstLimit?: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      requestsPerHour: config.requestsPerMinute * 60,
      burstLimit: Math.max(config.requestsPerMinute / 2, 5),
      ...config,
    };
  }

  /**
   * Check if request is allowed based on rate limits
   */
  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Clean old requests (older than 1 hour)
    this.requests = this.requests.filter(timestamp => 
      now - timestamp < 60 * 60 * 1000
    );

    // Check per-minute limit
    const recentRequests = this.requests.filter(timestamp => 
      now - timestamp < 60 * 1000
    );

    if (recentRequests.length >= this.config.requestsPerMinute) {
      return false;
    }

    // Check per-hour limit
    if (this.requests.length >= this.config.requestsPerHour) {
      return false;
    }

    // Check burst limit (requests in last 10 seconds)
    const burstRequests = this.requests.filter(timestamp => 
      now - timestamp < 10 * 1000
    );

    if (burstRequests.length >= this.config.burstLimit) {
      return false;
    }

    return true;
  }

  /**
   * Wait for rate limit to allow request
   */
  async waitForSlot(): Promise<void> {
    while (!(await this.checkLimit())) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Record a request for rate limiting
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    this.recordRequest();
    return fn();
  }

  /**
   * Get time until next slot is available
   */
  getTimeUntilNextSlot(): number {
    const now = Date.now();
    const recentRequests = this.requests.filter(timestamp => 
      now - timestamp < 60 * 1000
    );

    if (recentRequests.length < this.config.requestsPerMinute) {
      return 0;
    }

    const oldestRecentRequest = Math.min(...recentRequests);
    return 60 * 1000 - (now - oldestRecentRequest);
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): {
    requestsLastMinute: number;
    requestsLastHour: number;
    percentageUsed: number;
  } {
    const now = Date.now();
    
    const requestsLastMinute = this.requests.filter(timestamp => 
      now - timestamp < 60 * 1000
    ).length;

    const requestsLastHour = this.requests.length;

    const percentageUsed = (requestsLastMinute / this.config.requestsPerMinute) * 100;

    return {
      requestsLastMinute,
      requestsLastHour,
      percentageUsed,
    };
  }
}