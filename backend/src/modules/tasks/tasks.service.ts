import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, tenantId: string): Promise<Task> {
    const task = this.taskRepository.create({ ...createTaskDto, tenantId });
    return this.taskRepository.save(task);
  }

  async findAll(tenantId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { tenantId },
      relations: ['assignedTo', 'customer', 'opportunity'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, tenantId },
      relations: ['assignedTo', 'customer', 'opportunity'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    tenantId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, tenantId);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const task = await this.findOne(id, tenantId);
    await this.taskRepository.remove(task);
  }
}

