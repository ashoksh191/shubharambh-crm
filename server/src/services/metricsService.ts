export interface HttpMetric {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  isSlow: boolean;
}

class MetricsService {
  private totalRequests = 0;
  private slowRequests = 0;
  private statusCounts: Record<string, number> = {};
  private routeCounts: Record<string, number> = {};
  private totalDurationMs = 0;
  private dbQueriesCount = 0;
  private auditEventsCount = 0;

  /**
   * Records an HTTP request execution
   */
  public recordHttpRequest(metric: HttpMetric): void {
    this.totalRequests += 1;
    this.totalDurationMs += metric.durationMs;

    if (metric.isSlow) {
      this.slowRequests += 1;
    }

    const statusKey = `${Math.floor(metric.statusCode / 100)}xx`;
    this.statusCounts[statusKey] = (this.statusCounts[statusKey] || 0) + 1;

    const routeKey = `${metric.method} ${metric.route}`;
    this.routeCounts[routeKey] = (this.routeCounts[routeKey] || 0) + 1;
  }

  /**
   * Increments DB Query counter
   */
  public recordDbQuery(): void {
    this.dbQueriesCount += 1;
  }

  /**
   * Increments Security Audit event counter
   */
  public recordAuditEvent(): void {
    this.auditEventsCount += 1;
  }

  /**
   * Generates Prometheus / JSON format observability report
   */
  public getMetricsReport() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptimeSeconds = Math.floor(process.uptime());

    const avgDurationMs = this.totalRequests > 0
      ? parseFloat((this.totalDurationMs / this.totalRequests).toFixed(2))
      : 0;

    return {
      service: 'shubharambh-crm-backend',
      timestamp: new Date().toISOString(),
      process: {
        uptimeSeconds,
        memoryRssBytes: memoryUsage.rss,
        memoryHeapUsedBytes: memoryUsage.heapUsed,
        cpuUserMicros: cpuUsage.user,
        cpuSystemMicros: cpuUsage.system,
      },
      http: {
        totalRequests: this.totalRequests,
        slowRequestsCount: this.slowRequests,
        averageDurationMs: avgDurationMs,
        statusCodes: this.statusCounts,
        routes: this.routeCounts,
      },
      database: {
        queriesExecuted: this.dbQueriesCount,
      },
      audit: {
        eventsRecorded: this.auditEventsCount,
      },
    };
  }
}

export const metricsService = new MetricsService();
