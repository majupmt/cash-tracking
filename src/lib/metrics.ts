interface RequestMetric {
  totalRequests: number;
  totalErrors: number;
  avgResponseMs: number;
  routeCounts: Record<string, number>;
  statusCounts: Record<number, number>;
}

class MetricsCollector {
  private totalRequests = 0;
  private totalErrors = 0;
  private responseTimes: number[] = [];
  private routeCounts: Record<string, number> = {};
  private statusCounts: Record<number, number> = {};
  private startTime = Date.now();

  recordRequest(route: string, status: number, durationMs: number) {
    this.totalRequests++;
    if (status >= 400) this.totalErrors++;
    this.responseTimes.push(durationMs);
    if (this.responseTimes.length > 1000) this.responseTimes.shift();
    this.routeCounts[route] = (this.routeCounts[route] || 0) + 1;
    this.statusCounts[status] = (this.statusCounts[status] || 0) + 1;
  }

  getSummary(): RequestMetric & { uptimeSeconds: number } {
    const avg = this.responseTimes.length
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgResponseMs: Math.round(avg * 100) / 100,
      routeCounts: { ...this.routeCounts },
      statusCounts: { ...this.statusCounts },
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}

export const metrics = new MetricsCollector();
