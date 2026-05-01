/**
 * Performance Monitor - مراقب الأداء
 * يوفر:
 * - قياس أداء العمليات
 * - تحليل استخدام الموارد
 * - تقارير الأداء
 * - تحسينات تلقائية
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as v8 from 'v8';
import { AppError, BusinessError } from '../errors';

const toPerformanceError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return new BusinessError(error.message, { reason: 'performance_measure_failed' });
  }

  return new BusinessError('فشل قياس العملية');
};

interface PerformanceMonitorOptions {
  enableAutoOptimization?: boolean;
  maxMemoryMB?: number;
  gcThreshold?: number;
  collectInterval?: number;
  historySize?: number;
}

interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
}

interface OperationMetric {
  name: string;
  metadata: Record<string, unknown>;
  duration: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  timestamp: number;
  error?: string;
}

interface MemoryMetric {
  process: MemorySnapshot;
  system: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  timestamp: number;
}

interface CPUMetric {
  usage: number;
  cores: number;
  loadAverage: {
    one: number;
    five: number;
    fifteen: number;
  };
  timestamp: number;
}

interface MetricsCollection {
  operations: OperationMetric[];
  memory: MemoryMetric[];
  cpu: CPUMetric[];
  gc: unknown[];
  custom: Map<string, unknown[]>;
}

interface CpuUsageSnapshot {
  user: number;
  system: number;
}

interface ActiveOperation {
  name: string;
  metadata: Record<string, unknown>;
  startTime: number;
  startMemory: MemorySnapshot;
  startCPU: CpuUsageSnapshot;
}

type MetricType = 'operations' | 'memory' | 'cpu' | 'gc';

class PerformanceMonitor extends EventEmitter {
  options: Required<PerformanceMonitorOptions>;
  metrics: MetricsCollection;
  activeOperations: Map<string, ActiveOperation>;
  intervals: ReturnType<typeof setInterval>[];
  static getInstance: (_options?: PerformanceMonitorOptions) => PerformanceMonitor;

  constructor(options: PerformanceMonitorOptions = {}) {
    super();

    this.options = {
      enableAutoOptimization: options.enableAutoOptimization !== false,
      maxMemoryMB: options.maxMemoryMB || 512,
      gcThreshold: options.gcThreshold || 0.8,
      collectInterval: options.collectInterval || 10000,
      historySize: options.historySize || 1000,
    };

    this.metrics = {
      operations: [],
      memory: [],
      cpu: [],
      gc: [],
      custom: new Map(),
    };

    this.activeOperations = new Map();
    this.intervals = [];

    this.startCollecting();
  }

  /**
   * بدء جمع metrics
   */
  startCollecting() {
    // جمع memory metrics
    const memoryInterval = setInterval(() => {
      this.collectMemoryMetrics();
    }, this.options.collectInterval);
    this.intervals.push(memoryInterval);

    // جمع CPU metrics
    const cpuInterval = setInterval(() => {
      this.collectCPUMetrics();
    }, this.options.collectInterval * 2);
    this.intervals.push(cpuInterval);

    // التحقق من الحاجة لـ GC
    if (this.options.enableAutoOptimization) {
      const gcCheckInterval = setInterval(() => {
        this.checkForGC();
      }, this.options.collectInterval);
      this.intervals.push(gcCheckInterval);
    }
  }

  /**
   * إيقاف المراقبة
   */
  stop() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }

  /**
   * بدء عملية
   */
  startOperation(name: string, metadata: Record<string, unknown> = {}) {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activeOperations.set(id, {
      name,
      metadata,
      startTime: Date.now(),
      startMemory: process.memoryUsage(),
      startCPU: process.cpuUsage(),
    });

    return id;
  }

  /**
   * إنهاء عملية
   */
  endOperation(id: string) {
    const operation = this.activeOperations.get(id);

    if (!operation) {
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    const endMemory = process.memoryUsage();
    const endCPU = process.cpuUsage(operation.startCPU);

    const metric: OperationMetric = {
      name: operation.name,
      metadata: operation.metadata,
      duration,
      memory: {
        heapUsed: this.bytesToMB(endMemory.heapUsed - operation.startMemory.heapUsed),
        heapTotal: this.bytesToMB(endMemory.heapTotal),
        rss: this.bytesToMB(endMemory.rss),
        external: this.bytesToMB(endMemory.external),
      },
      cpu: {
        user: endCPU.user,
        system: endCPU.system,
      },
      timestamp: endTime,
    };

    // إضافة للـ history
    this.addMetric('operations', metric);

    this.activeOperations.delete(id);
    this.emit('operation:complete', metric);

    return metric;
  }

  /**
   * قياس دالة
   */
  async measure<T>(name: string, fn: () => Promise<T> | T, metadata: Record<string, unknown> = {}) {
    const id = this.startOperation(name, metadata);

    try {
      const result = await fn();
      const metric = this.endOperation(id);
      return { result, metric };
    } catch (error: unknown) {
      const metric = this.endOperation(id);
      if (metric && error instanceof Error) {
        metric.error = error.message;
      }
      this.emit('operation:error', { metric, error });
      throw toPerformanceError(error);
    }
  }

  /**
   * قياس متزامن
   */
  measureSync<T>(name: string, fn: () => T, metadata: Record<string, unknown> = {}) {
    const id = this.startOperation(name, metadata);

    try {
      const result = fn();
      const metric = this.endOperation(id);
      return { result, metric };
    } catch (error: unknown) {
      const metric = this.endOperation(id);
      if (metric && error instanceof Error) {
        metric.error = error.message;
      }
      this.emit('operation:error', { metric, error });
      throw toPerformanceError(error);
    }
  }

  /**
   * إضافة metric مخصص
   */
  addCustomMetric(name: string, value: unknown, metadata: Record<string, unknown> = {}) {
    if (!this.metrics.custom.has(name)) {
      this.metrics.custom.set(name, []);
    }

    const metrics = this.metrics.custom.get(name);
    if (!metrics) return;
    metrics.push({
      value,
      metadata,
      timestamp: Date.now(),
    });

    // الحفاظ على الحجم
    if (metrics.length > this.options.historySize) {
      metrics.shift();
    }
  }

  /**
   * جمع metrics للذاكرة
   */
  collectMemoryMetrics() {
    const memUsage = process.memoryUsage();
    const systemMem = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };

    const metric = {
      process: {
        heapUsed: this.bytesToMB(memUsage.heapUsed),
        heapTotal: this.bytesToMB(memUsage.heapTotal),
        rss: this.bytesToMB(memUsage.rss),
        external: this.bytesToMB(memUsage.external),
      },
      system: {
        total: this.bytesToMB(systemMem.total),
        free: this.bytesToMB(systemMem.free),
        used: this.bytesToMB(systemMem.used),
        usagePercent: Math.round((systemMem.used / systemMem.total) * 100),
      },
      timestamp: Date.now(),
    };

    this.addMetric('memory', metric);

    // التحقق من الذاكرة
    const heapUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
    if (heapUsagePercent > this.options.gcThreshold) {
      this.emit('memory:warning', {
        heapUsagePercent: Math.round(heapUsagePercent * 100),
        heapUsed: this.bytesToMB(memUsage.heapUsed),
        heapTotal: this.bytesToMB(memUsage.heapTotal),
      });
    }

    return metric;
  }

  /**
   * جمع metrics للـ CPU
   */
  collectCPUMetrics() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const metric = {
      usage: Math.round((1 - totalIdle / totalTick) * 100),
      cores: cpus.length,
      loadAverage: {
        one: loadAvg[0],
        five: loadAvg[1],
        fifteen: loadAvg[2],
      },
      timestamp: Date.now(),
    };

    this.addMetric('cpu', metric);
    return metric;
  }

  /**
   * إضافة metric للـ history
   */
  addMetric(type: MetricType, metric: unknown) {
    (this.metrics[type] as unknown[]).push(metric);

    if ((this.metrics[type] as unknown[]).length > this.options.historySize) {
      (this.metrics[type] as unknown[]).shift();
    }
  }

  /**
   * التحقق من الحاجة لـ Garbage Collection
   */
  checkForGC() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = this.bytesToMB(memUsage.heapUsed);

    if (heapUsedMB > this.options.maxMemoryMB) {
      this.emit('memory:high', {
        heapUsedMB,
        threshold: this.options.maxMemoryMB,
      });

      // اقتراح GC
      if (typeof global.gc === 'function') {
        this.emit('gc:suggest', { heapUsedMB });
      }
    }
  }

  /**
   * الحصول على تقرير الأداء
   */
  getReport(timeRange = 60000) {
    const now = Date.now();
    const startTime = now - timeRange;

    const recentOps = this.metrics.operations.filter((op) => op.timestamp > startTime);
    const recentMem = this.metrics.memory.filter((m) => m.timestamp > startTime);
    const recentCPU = this.metrics.cpu.filter((c) => c.timestamp > startTime);

    return {
      operations: this.analyzeOperations(recentOps),
      memory: this.analyzeMemory(recentMem),
      cpu: this.analyzeCPU(recentCPU),
      activeOperations: this.activeOperations.size,
      uptime: process.uptime(),
    };
  }

  /**
   * تحليل العمليات
   */
  analyzeOperations(operations: OperationMetric[]) {
    if (operations.length === 0) {
      return { count: 0, avgDuration: 0, totalDuration: 0 };
    }

    const durations = operations.map((op) => op.duration);
    const byName: Record<string, number[]> = {};

    operations.forEach((op) => {
      if (!byName[op.name]) {
        byName[op.name] = [];
      }
      byName[op.name].push(op.duration);
    });

    const byNameStats: Record<string, unknown> = {};
    for (const name in byName) {
      const nameDurations = byName[name];
      byNameStats[name] = {
        count: nameDurations.length,
        avg: Math.round(nameDurations.reduce((a, b) => a + b, 0) / nameDurations.length),
        min: Math.min(...nameDurations),
        max: Math.max(...nameDurations),
        total: nameDurations.reduce((a, b) => a + b, 0),
      };
    }

    return {
      count: operations.length,
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / operations.length),
      totalDuration: durations.reduce((a, b) => a + b, 0),
      byName: byNameStats,
      errors: operations.filter((op) => op.error).length,
    };
  }

  /**
   * تحليل الذاكرة
   */
  analyzeMemory(metrics: MemoryMetric[]) {
    if (metrics.length === 0) {
      return { current: null, average: null };
    }

    const current = metrics[metrics.length - 1];
    const avgHeap = metrics.reduce((sum, m) => sum + m.process.heapUsed, 0) / metrics.length;
    const avgSystem = metrics.reduce((sum, m) => sum + m.system.usagePercent, 0) / metrics.length;

    return {
      current: {
        heapUsed: current.process.heapUsed,
        heapTotal: current.process.heapTotal,
        systemPercent: current.system.usagePercent,
      },
      average: {
        heapUsed: Math.round(avgHeap * 100) / 100,
        systemPercent: Math.round(avgSystem),
      },
      peak: {
        heapUsed: Math.max(...metrics.map((m) => m.process.heapUsed)),
      },
    };
  }

  /**
   * تحليل CPU
   */
  analyzeCPU(metrics: CPUMetric[]) {
    if (metrics.length === 0) {
      return { current: null, average: null };
    }

    const current = metrics[metrics.length - 1];
    const avgUsage = metrics.reduce((sum, m) => sum + m.usage, 0) / metrics.length;

    return {
      current: {
        usage: current.usage,
        loadAverage: current.loadAverage,
      },
      average: {
        usage: Math.round(avgUsage),
      },
      peak: {
        usage: Math.max(...metrics.map((m) => m.usage)),
      },
    };
  }

  /**
   * الحصول على ملخص الأداء
   */
  getSummary() {
    return {
      operationsCount: this.metrics.operations.length,
      activeOperations: this.activeOperations.size,
      memory: this.collectMemoryMetrics(),
      cpu: this.collectCPUMetrics(),
      v8HeapStats: v8.getHeapStatistics(),
    };
  }

  /**
   * تصدير البيانات
   */
  export() {
    return {
      metrics: {
        operations: this.metrics.operations,
        memory: this.metrics.memory,
        cpu: this.metrics.cpu,
        gc: this.metrics.gc,
        custom: Object.fromEntries(this.metrics.custom),
      },
      summary: this.getSummary(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * تحويل bytes إلى MB
   */
  bytesToMB(bytes: number) {
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
  }

  /**
   * إعادة تعيين البيانات
   */
  reset() {
    this.metrics.operations = [];
    this.metrics.memory = [];
    this.metrics.cpu = [];
    this.metrics.gc = [];
    this.metrics.custom.clear();
    this.activeOperations.clear();
    this.emit('reset');
  }
}

/**
 * Singleton instance
 */
let monitorInstance: PerformanceMonitor | null = null;

PerformanceMonitor.getInstance = function (options?: PerformanceMonitorOptions) {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor(options);
  }
  return monitorInstance;
};

export default PerformanceMonitor;
