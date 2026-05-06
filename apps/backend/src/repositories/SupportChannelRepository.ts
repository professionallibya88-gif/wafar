import { BaseRepository } from './BaseRepository';
import {
  SupportChannel,
  SupportChannelAttributes,
  SupportChannelCreationAttributes,
} from '../database/models/SupportChannel';

export type { SupportChannelAttributes, SupportChannelCreationAttributes };

export class SupportChannelRepository extends BaseRepository<SupportChannel> {
  constructor() {
    super(SupportChannel);
  }

  async findAllActive(): Promise<SupportChannel[]> {
    return this.model.findAll({
      where: { is_active: true },
      order: [['created_at', 'ASC']],
    });
  }

  async findAllChannels(): Promise<SupportChannel[]> {
    return this.model.findAll({
      order: [['created_at', 'DESC']],
    });
  }
}

export const supportChannelRepository = new SupportChannelRepository();
