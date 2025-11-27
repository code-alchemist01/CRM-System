import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(
    action: AuditAction,
    resource: string,
    resourceId: string,
    userId: string,
    tenantId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      action,
      resource,
      resourceId,
      userId,
      tenantId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
    return this.auditLogRepository.save(log);
  }

  async findAll(tenantId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}

