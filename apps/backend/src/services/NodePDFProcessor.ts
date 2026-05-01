import { promises as fs } from 'fs';
import pdfParse from 'pdf-parse';
import logger from '../config/logger';

export interface NodePDFProcessorOptions {
  batchSize?: number;
  enableTableDetection?: boolean;
  enableOCR?: boolean;
  minPartLength?: number;
  maxTextLength?: number;
  confidenceThreshold?: number;
}

export class NodePDFProcessor {
  private options: Required<NodePDFProcessorOptions>;

  constructor(options: NodePDFProcessorOptions = {}) {
    this.options = {
      batchSize: options.batchSize || 50,
      enableTableDetection: options.enableTableDetection !== false,
      enableOCR: options.enableOCR !== false,
      minPartLength: options.minPartLength || 3,
      maxTextLength: options.maxTextLength || 100000,
      confidenceThreshold: options.confidenceThreshold || 50,
    };
  }

  static async process(filePath: string, options: NodePDFProcessorOptions = {}): Promise<any> {
    const processor = new NodePDFProcessor(options);
    return await processor.processFile(filePath);
  }

  static async processBatch(
    filePaths: string[],
    options: NodePDFProcessorOptions = {}
  ): Promise<any> {
    const processor = new NodePDFProcessor(options);
    const results = [];

    for (let i = 0; i < filePaths.length; i++) {
      try {
        const result = await processor.processFile(filePaths[i]);
        results.push({
          path: filePaths[i],
          success: true,
          result,
          index: i,
          total: filePaths.length,
        });
      } catch (error: any) {
        results.push({
          path: filePaths[i],
          success: false,
          error: error.message,
          index: i,
          total: filePaths.length,
        });
      }
    }

    return {
      results,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  async processFile(filePath: string): Promise<any> {
    const startTime = Date.now();
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;
    const lines = text.split('\n').filter((line: string) => line.trim().length > 0);

    const parts: any[] = [];
    const rawRows: any[] = [];
    let skippedLines = 0;

    for (let i = 0; i < lines.length; i += this.options.batchSize) {
      const batch = lines.slice(i, i + this.options.batchSize);

      for (const line of batch) {
        const part = NodePDFProcessor.parseLine(line);
        if (part && part.partCode && part.partName) {
          part.confidence = this.calculateConfidence(part, line);

          if (part.confidence >= this.options.confidenceThreshold) {
            parts.push(part);
            rawRows.push({ line, parsed: part });
          } else {
            skippedLines++;
          }
        } else {
          skippedLines++;
        }
      }
    }

    let tables: any[] = [];
    if (this.options.enableTableDetection) {
      tables = this.detectTables(lines);
    }

    const processingTime = Date.now() - startTime;

    logger.info(
      `NodePDFProcessor: Extracted ${parts.length} parts from ${lines.length} lines (${skippedLines} skipped)`
    );

    return {
      parts,
      pageCount: pdfData.numpages,
      rawData: {
        fullText: text.substring(0, this.options.maxTextLength),
        totalLines: lines.length,
        rawRows: rawRows.slice(0, 1000),
        skippedLines,
      },
      supplierName: NodePDFProcessor.extractSupplierName(text),
      tables,
      metadata: {
        processingTime,
        batchSize: this.options.batchSize,
        confidence: this.calculateOverallConfidence(parts),
      },
    };
  }

  calculateConfidence(part: any, _line: string): number {
    let score = 50;

    if (/^[A-Z0-9-.]+$/.test(part.partCode)) {
      score += 20;
    }

    if (part.partName && part.partName.length >= 3 && part.partName.length <= 200) {
      score += 15;
    }

    if (part.price !== undefined && part.price > 0 && part.price < 10000000) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  calculateOverallConfidence(parts: any[]): number {
    if (parts.length === 0) return 0;
    const total = parts.reduce((sum, p) => sum + (p.confidence || 0), 0);
    return Math.round(total / parts.length);
  }

  detectTables(lines: string[]): any[] {
    const tables: any[] = [];
    let currentTable: string[] = [];
    let inTable = false;

    for (const line of lines) {
      const isTableLine = this.isTableRow(line);

      if (isTableLine) {
        inTable = true;
        currentTable.push(line);
      } else if (inTable) {
        if (currentTable.length >= 3) {
          tables.push({
            rows: currentTable,
            rowCount: currentTable.length,
            columns: this.detectColumns(currentTable),
          });
        }
        currentTable = [];
        inTable = false;
      }
    }

    if (currentTable.length >= 3) {
      tables.push({
        rows: currentTable,
        rowCount: currentTable.length,
        columns: this.detectColumns(currentTable),
      });
    }

    return tables;
  }

  isTableRow(line: string): boolean {
    if (line.includes('\t') && line.split('\t').length >= 2) return true;
    if (line.includes('|') && line.split('|').length >= 3) return true;
    if (/^[\d\s\-.,]+$/.test(line.trim())) return true;
    return false;
  }

  detectColumns(rows: string[]): number {
    if (rows.length === 0) return 0;

    const firstRow = rows[0];
    if (firstRow.includes('\t')) {
      return firstRow.split('\t').length;
    }
    if (firstRow.includes('|')) {
      return firstRow.split('|').length - 1;
    }

    return 0;
  }

  static parseLine(line: string): any {
    const codeNamePricePattern = /^([A-Z0-9-.]+)\s+[-\s]+(.+?)\s+[-\s]+([\d,]+\.?\d*)\s*$/;
    const match1 = line.match(codeNamePricePattern);
    if (match1) {
      return {
        partCode: match1[1].trim(),
        partName: match1[2].trim(),
        price: parseFloat(match1[3].replace(/,/g, '')),
      };
    }

    const tabParts = line.split('\t').filter((p) => p.trim().length > 0);
    if (tabParts.length >= 2) {
      const part: any = {
        partCode: tabParts[0].trim(),
        partName: tabParts.slice(1, -1).join(' ').trim() || tabParts[1].trim(),
      };
      const lastCol = tabParts[tabParts.length - 1].trim();
      const priceVal = parseFloat(lastCol.replace(/,/g, ''));
      if (!isNaN(priceVal) && priceVal > 0) {
        part.price = priceVal;
      }
      if (part.partCode && part.partName) {
        return part;
      }
    }

    const pipeParts = line.split('|').filter((p) => p.trim().length > 0);
    if (pipeParts.length >= 2) {
      const part: any = {
        partCode: pipeParts[0].trim(),
        partName: pipeParts[1].trim(),
      };
      if (pipeParts.length >= 3) {
        const priceVal = parseFloat(pipeParts[2].trim().replace(/,/g, ''));
        if (!isNaN(priceVal)) part.price = priceVal;
      }
      if (part.partCode && part.partName) {
        return part;
      }
    }

    const semiParts = line.split(';').filter((p) => p.trim().length > 0);
    if (semiParts.length >= 2) {
      const part: any = {
        partCode: semiParts[0].trim(),
        partName: semiParts[1].trim(),
      };
      if (semiParts.length >= 3) {
        const priceVal = parseFloat(semiParts[2].trim().replace(/,/g, ''));
        if (!isNaN(priceVal)) part.price = priceVal;
      }
      if (part.partCode && part.partName) {
        return part;
      }
    }

    return null;
  }

  static extractSupplierName(text: string): string | null {
    const patterns = [
      /شركة\s+(.+?)[\n\r]/,
      /Company\s*:\s*(.+?)[\n\r]/i,
      /المورد\s*:\s*(.+?)[\n\r]/,
      /Supplier\s*:\s*(.+?)[\n\r]/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }
}
