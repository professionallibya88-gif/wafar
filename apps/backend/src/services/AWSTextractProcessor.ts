import { promises as fs } from 'fs';
import logger from '../config/logger';
import { NodePDFProcessor } from './NodePDFProcessor';

export class AWSTextractProcessor {
  static async process(filePath: any) {
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
      } catch (e) {
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

      return AWSTextractProcessor.parseTextractResponse(response);
    } catch (error: any) {
      logger.error('AWS Textract processing failed:', error.message);
      logger.warn('Falling back to Node.js processor');
      return await NodePDFProcessor.process(filePath);
    }
  }

  static parseTextractResponse(data: any) {
    const blocks = data.Blocks || [];
    const parts = [];

    const lines = blocks.filter((b: any) => b.BlockType === 'LINE').map((b: any) => b.Text);

    for (const line of lines) {
      if (!line || line.trim().length === 0) continue;

      const tabParts = line.split('\t').filter((p: any) => p.trim());
      if (tabParts.length >= 2) {
        const part = {
          partCode: tabParts[0].trim(),
          partName: tabParts[1].trim(),
        };
        if (tabParts.length >= 3) {
          const price = parseFloat(tabParts[2].replace(/,/g, ''));
          if (!isNaN(price)) (part as any).price = price;
        }
        parts.push(part);
      }
    }

    return {
      parts,
      pageCount: Math.ceil(blocks.filter((b: any) => b.BlockType === 'PAGE').length),
      rawData: { textractBlocks: blocks.length },
    };
  }
}
