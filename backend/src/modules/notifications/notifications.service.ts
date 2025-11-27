import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from '../../common/gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    tenantId: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      tenantId,
    });
    const saved = await this.notificationRepository.save(notification);
    
    // Send real-time notification
    this.notificationsGateway.sendToUser(
      saved.userId,
      'notification',
      saved,
    );
    
    return saved;
  }

  async findAll(userId: string, tenantId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnread(userId: string, tenantId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, tenantId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string, tenantId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId, tenantId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, tenantId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async remove(id: string, userId: string, tenantId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId, tenantId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await this.notificationRepository.remove(notification);
  }
}

