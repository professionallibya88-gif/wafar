import { promises as fs } from 'fs';
import logger from '../config/logger';
import { NodePDFProcessor, type NodePDFProcessResult, type ParsedPart } from './NodePDFProcessor';

type TextractBlock = {
  BlockType?: string;
  Text?: string;
};

type TextractResponse = {
  Blocks?: TextractBlock[];
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export class AWSTextractProcessor {
  static async process(filePath: string): Promise<NodePDFProcessResult> {
    const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';

    if (!awsAccessKey || !awsSecretKey) {
      logger.warn('AWS credentials not configured, falling back to Node.js processor');
      return await NodePDFProcessor.process(filePath);
    }

    try {
      // محاولة استخدام AWS SDK إذا كان متاحاً
      let TextractClientClass;
      let DetectDocumentTextCommandClass;
      try {
        // @aws-sdk/client-textract
        const sdk = await import('@aws-sdk/client-textract');
        TextractClientClass = sdk.TextractClient;
        DetectDocumentTextCommandClass = sdk.DetectDocumentTextCommand;
      } catch {
        logger.warn('AWS SDK not installed, using fallback to Node.js processor');
        return await NodePDFProcessor.process(filePath);
      }

      const fileBuffer = await fs.readFile(filePath);

      // إعداد عميل Textract
      const client = new TextractClientClass({
        region: awsRegion,
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
        },
      });

      const command = new DetectDocumentTextCommandClass({
        Document: {
          Bytes: fileBuffer,
        },
        FeatureTypes: ['TABLES', 'FORMS'],
      });

      const response = await client.send(command);

      return AWSTextractProcessor.parseTextractResponse(response as TextractResponse);
    } catch (error) {
      logger.error('AWS Textract processing failed:', getErrorMessage(error));
      logger.warn('Falling back to Node.js processor');
      return await NodePDFProcessor.process(filePath);
    }
  }

  static parseTextractResponse(data: TextractResponse): NodePDFProcessResult {
    const blocks = data.Blocks || [];
    const parts: ParsedPart[] = [];

    const lines = blocks
      .filter((block) => block.BlockType === 'LINE')
      .map((block) => block.Text)
      .filter((text): text is string => typeof text === 'string');

    for (const line of lines) {
      if (!line || line.trim().length === 0) continue;

      const tabParts = line.split('\t').filter((part) => part.trim());
      if (tabParts.length >= 2) {
        const part: ParsedPart = {
          partCode: tabParts[0].trim(),
          partName: tabParts[1].trim(),
        };
        if (tabParts.length >= 3) {
          const price = parseFloat(tabParts[2].replace(/,/g, ''));
          if (!isNaN(price)) part.price = price;
        }
        parts.push(part);
      }
    }

    return {
      parts,
      pageCount: Math.ceil(blocks.filter((block) => block.BlockType === 'PAGE').length) || 1,
      rawData: {
        fullText: lines.join('\n'),
        totalLines: lines.length,
        rawRows: [],
        skippedLines: 0,
      },
      supplierName: null,
      tables: [],
      metadata: {
        processingTime: 0,
        batchSize: 0,
        confidence: 0,
      },
    };
  }
}
