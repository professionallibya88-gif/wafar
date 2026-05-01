import { EventEmitter } from 'events';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { sequelize } from '../database';

export class MonitoringSystem extends EventEmitter {
  private static instance: MonitoringSystem | null = null;
  public options: any;
  public logger: winston.Logger;
  public metrics: any;
  public healthStatus: any;
  public alerts: any[];
  public intervals: ReturnType<typeof setInterval>[];

  constructor(options: any = {}) {
    super();

    this.options = {
      logPath: options.logPath || path.join(__dirname, '../../logs'),
      metricsInterval: options.metricsInterval || 60000,
      healthCheckInterval: options.healthCheckInterval || 30000,
      errorThreshold: options.errorThreshold || 10,
      memoryThreshold: options.memoryThreshold || 0.9,
      cpuThreshold: options.cpuThreshold || 0.8,
      maxStoredMetrics: options.maxStoredMetrics || 1000,
      maxAlerts: options.maxAlerts || 200,
      metricsRetentionMs: options.metricsRetentionMs || 60 * 60 * 1000,
      ...options,
    };

    if (!fs.existsSync(this.options.logPath)) {
      fs.mkdirSync(this.options.logPath, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({
          filename: path.join(this.options.logPath, 'monitoring.log'),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(this.options.logPath, 'errors.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });

    this.metrics = {
      requests: [],
      errors: [],
      processingTimes: [],
      activeConnections: 0,
      startTime: Date.now(),
    };

    this.healthStatus = {
      status: 'healthy',
      checks: {},
      lastCheck: null,
    };

    this.alerts = [];
    this.intervals = [];
  }

  static getInstance(options?: any): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem(options);
      MonitoringSystem.instance.start();
    }
    return MonitoringSystem.instance;
  }

  start() {
    this.log('info', 'Monitoring system started');

    const metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.options.metricsInterval);
    this.intervals.push(metricsInterval);

    const healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckInterval);
    this.intervals.push(healthInterval);

    process.on('uncaughtException', (error) => {
      this.trackError(error, 'uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      this.trackError(reason, 'unhandledRejection');
    });
  }

  stop() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    this.log('info', 'Monitoring system stopped');
  }

  log(level: string, message: string, meta: any = {}) {
    this.logger.log(level, message, {
      ...meta,
      timestamp: new Date().toISOString(),
      service: 'pdf-processor',
    });
    this.emit('log', { level, message, meta });
  }

  trackRequest(endpoint: string, method: string, duration: number, statusCode: number) {
    this.metrics.requests.push({
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
    });
    this.trimMetricCollection(this.metrics.requests);
    this.emit('request', { endpoint, method, duration, statusCode });
  }

  trackError(error: any, source: string, context: any = {}) {
    const errorEntry = {
      id: this.generateId(),
      message: error?.message || String(error),
      stack: error?.stack,
      source,
      context,
      timestamp: Date.now(),
      severity: this.calculateSeverity(error),
    };

    this.metrics.errors.push(errorEntry);
    this.trimMetricCollection(this.metrics.errors);
    this.log('error', `Error tracked: ${errorEntry.message}`, {
      errorId: errorEntry.id,
      source,
      severity: errorEntry.severity,
    });

    this.emit('error', errorEntry);
    this.checkErrorThreshold();
  }

  trackProcessingTime(fileId: string, duration: number, success: boolean) {
    this.metrics.processingTimes.push({
      fileId,
      duration,
      success,
      timestamp: Date.now(),
    });
    this.trimMetricCollection(this.metrics.processingTimes);
    this.emit('processing:complete', { fileId, duration, success });
  }

  collectMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.pruneExpiredMetrics(now);

    const recentRequests = this.metrics.requests.filter((r: any) => r.timestamp > oneMinuteAgo);
    const recentErrors = this.metrics.errors.filter((e: any) => e.timestamp > oneMinuteAgo);

    const stats = {
      timestamp: now,
      requests: {
        total: recentRequests.length,
        byStatus: this.groupBy(recentRequests, 'statusCode'),
        avgDuration: this.average(recentRequests.map((r: any) => r.duration)),
      },
      errors: {
        total: recentErrors.length,
        bySource: this.groupBy(recentErrors, 'source'),
        bySeverity: this.groupBy(recentErrors, 'severity'),
      },
      system: this.getSystemMetrics(),
      uptime: now - this.metrics.startTime,
    };

    this.emit('metrics', stats);
    return stats;
  }

  getSystemMetrics() {
    const cpus = os.cpus();
    const totalCpu = cpus.reduce(
      (acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b);
        const idle = cpu.times.idle;
        return { total: acc.total + total, idle: acc.idle + idle };
      },
      { total: 0, idle: 0 }
    );

    const cpuUsage = 1 - totalCpu.idle / totalCpu.total;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = 1 - freeMem / totalMem;

    return {
      cpu: {
        cores: cpus.length,
        usage: Math.round(cpuUsage * 100) / 100,
      },
      memory: {
        total: this.formatBytes(totalMem),
        free: this.formatBytes(freeMem),
        used: this.formatBytes(totalMem - freeMem),
        usagePercent: Math.round(memoryUsage * 100),
      },
      loadAverage: os.loadavg(),
      platform: os.platform(),
      uptime: os.uptime(),
    };
  }

  async performHealthCheck() {
    const checks: any = {};
    let allHealthy = true;

    const memUsage = this.getSystemMetrics().memory.usagePercent / 100;
    checks.memory = {
      status: memUsage < this.options.memoryThreshold ? 'healthy' : 'unhealthy',
      value: memUsage,
    };
    if (checks.memory.status === 'unhealthy') allHealthy = false;

    const cpuUsage = this.getSystemMetrics().cpu.usage;
    checks.cpu = {
      status: cpuUsage < this.options.cpuThreshold ? 'healthy' : 'unhealthy',
      value: cpuUsage,
    };
    if (checks.cpu.status === 'unhealthy') allHealthy = false;

    const now = Date.now();
    const recentErrors = this.metrics.errors.filter((e: any) => e.timestamp > now - 60000);
    checks.errorRate = {
      status: recentErrors.length < this.options.errorThreshold ? 'healthy' : 'unhealthy',
      value: recentErrors.length,
    };
    if (checks.errorRate.status === 'unhealthy') allHealthy = false;

    checks.disk = { status: 'healthy', value: 'N/A' };

    try {
      await sequelize.authenticate();
      checks.database = { status: 'healthy', value: 'connected' };
    } catch (error: any) {
      checks.database = { status: 'unhealthy', value: error.message };
      allHealthy = false;
    }

    this.healthStatus = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      lastCheck: Date.now(),
    };

    this.emit('health', this.healthStatus);

    if (!allHealthy) {
      this.createAlert('health', 'System health check failed', this.healthStatus);
    }

    return this.healthStatus;
  }

  checkErrorThreshold() {
    const now = Date.now();
    const recentErrors = this.metrics.errors.filter((e: any) => e.timestamp > now - 60000);

    if (recentErrors.length >= this.options.errorThreshold) {
      this.createAlert(
        'error',
        `High error rate detected: ${recentErrors.length} errors in last minute`,
        {
          errorCount: recentErrors.length,
          threshold: this.options.errorThreshold,
        }
      );
    }
  }

  createAlert(type: string, message: string, data: any) {
    const alert = {
      id: this.generateId(),
      type,
      message,
      data,
      timestamp: Date.now(),
      acknowledged: false,
    };

    this.alerts.push(alert);
    if (this.alerts.length > this.options.maxAlerts) {
      this.alerts.splice(0, this.alerts.length - this.options.maxAlerts);
    }
    this.log('warn', `Alert created: ${message}`, { alertId: alert.id, type });
    this.emit('alert', alert);

    return alert;
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      (alert as any).acknowledgedAt = Date.now();
      this.emit('alert:acknowledged', alert);
    }
    return alert;
  }

  getHealthStatus() {
    return this.healthStatus;
  }

  getAlerts(includeAcknowledged = false) {
    if (includeAcknowledged) return [...this.alerts];
    return this.alerts.filter((a) => !a.acknowledged);
  }

  getStats() {
    return this.collectMetrics();
  }

  trimMetricCollection(collection: any[]) {
    if (collection.length > this.options.maxStoredMetrics) {
      collection.splice(0, collection.length - this.options.maxStoredMetrics);
    }
  }

  pruneExpiredMetrics(now: number) {
    const threshold = now - this.options.metricsRetentionMs;
    this.metrics.requests = this.metrics.requests.filter(
      (item: any) => item.timestamp >= threshold
    );
    this.metrics.errors = this.metrics.errors.filter((item: any) => item.timestamp >= threshold);
    this.metrics.processingTimes = this.metrics.processingTimes.filter(
      (item: any) => item.timestamp >= threshold
    );
  }

  calculateSeverity(error: any) {
    if (error?.stack?.includes('OutOfMemory')) return 'critical';
    if (error?.stack?.includes('ECONNREFUSED')) return 'high';
    if (error?.message?.includes('timeout')) return 'medium';
    return 'low';
  }

  groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  average(numbers: number[]) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default MonitoringSystem;
