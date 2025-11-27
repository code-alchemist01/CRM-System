import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
    tenantId: string,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      ...createActivityDto,
      userId,
      tenantId,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(tenantId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { tenantId },
      relations: ['user', 'customer', 'opportunity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id, tenantId },
      relations: ['user', 'customer', 'opportunity'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    tenantId: string,
  ): Promise<Activity> {
    const activity = await this.findOne(id, tenantId);
    Object.assign(activity, updateActivityDto);
    return this.activityRepository.save(activity);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const activity = await this.findOne(id, tenantId);
    await this.activityRepository.remove(activity);
  }
}

