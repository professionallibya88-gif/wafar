import { supportChannelRepository } from '../repositories';
import { NotFoundError } from '../errors';
import { SupportChannelAttributes } from '../database/models/SupportChannel';

export class SupportChannelService {
  async getAllChannels(): Promise<SupportChannelAttributes[]> {
    const channels = await supportChannelRepository.findAllChannels();
    return channels.map((c) => c.toJSON() as SupportChannelAttributes);
  }

  async getActiveChannels(): Promise<SupportChannelAttributes[]> {
    const channels = await supportChannelRepository.findAllActive();
    return channels.map((c) => c.toJSON() as SupportChannelAttributes);
  }

  async createChannel(data: {
    name: string;
    type: 'whatsapp' | 'phone' | 'link';
    value: string;
    is_active?: boolean;
    icon?: string;
  }): Promise<SupportChannelAttributes> {
    const channel = await supportChannelRepository.create(data);
    return channel.toJSON() as SupportChannelAttributes;
  }

  async updateChannel(
    id: string,
    data: Partial<{
      name: string;
      type: 'whatsapp' | 'phone' | 'link';
      value: string;
      is_active: boolean;
      icon: string;
    }>
  ): Promise<SupportChannelAttributes> {
    const channel = await supportChannelRepository.findById(id);
    if (!channel) {
      throw new NotFoundError('قناة الدعم غير موجودة');
    }

    const updatedChannel = await supportChannelRepository.updateById(id, data);
    if (!updatedChannel) {
      throw new NotFoundError('قناة الدعم غير موجودة');
    }
    return updatedChannel.toJSON() as SupportChannelAttributes;
  }

  async deleteChannel(id: string): Promise<void> {
    const channel = await supportChannelRepository.findById(id);
    if (!channel) {
      throw new NotFoundError('قناة الدعم غير موجودة');
    }

    await supportChannelRepository.deleteById(id);
  }

  async toggleActive(id: string): Promise<SupportChannelAttributes> {
    const channel = await supportChannelRepository.findById(id);
    if (!channel) {
      throw new NotFoundError('قناة الدعم غير موجودة');
    }

    const newStatus = !channel.is_active;
    const updatedChannel = await supportChannelRepository.updateById(id, { is_active: newStatus });
    if (!updatedChannel) {
      throw new NotFoundError('قناة الدعم غير موجودة');
    }
    return updatedChannel.toJSON() as SupportChannelAttributes;
  }
}

export const supportChannelService = new SupportChannelService();
