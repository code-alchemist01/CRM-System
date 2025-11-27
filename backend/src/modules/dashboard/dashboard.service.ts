import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Customer } from '../customers/entities/customer.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStats(tenantId: string) {
    const cacheKey = `dashboard:stats:${tenantId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [customers, opportunities, tasks, invoices] = await Promise.all([
      this.customerRepository.count({ where: { tenantId } }),
      this.opportunityRepository.count({ where: { tenantId } }),
      this.taskRepository.count({ where: { tenantId } }),
      this.invoiceRepository.count({ where: { tenantId } }),
    ]);

    const result = {
      customers,
      opportunities,
      tasks,
      invoices,
    };

    await this.cacheManager.set(cacheKey, result, 30000); // 30 seconds cache
    return result;
  }

  async getDetailedStats(tenantId: string) {
    const cacheKey = `dashboard:detailed:${tenantId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      customers,
      opportunities,
      tasks,
      invoices,
      totalRevenue,
      monthlyRevenue,
      tasksByStatus,
      opportunitiesByStage,
      recentActivities,
    ] = await Promise.all([
      this.customerRepository.count({ where: { tenantId } }),
      this.opportunityRepository.count({ where: { tenantId } }),
      this.taskRepository.count({ where: { tenantId } }),
      this.invoiceRepository.count({ where: { tenantId } }),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.tenantId = :tenantId', { tenantId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .getRawOne(),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.tenantId = :tenantId', { tenantId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.paidDate >= :startOfMonth', { startOfMonth })
        .getRawOne(),
      this.taskRepository
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(task.id)', 'count')
        .where('task.tenantId = :tenantId', { tenantId })
        .groupBy('task.status')
        .getRawMany(),
      this.opportunityRepository
        .createQueryBuilder('opp')
        .leftJoin('opp.stage', 'stage')
        .select('stage.name', 'stage')
        .addSelect('COUNT(opp.id)', 'count')
        .addSelect('SUM(opp.value)', 'value')
        .where('opp.tenantId = :tenantId', { tenantId })
        .groupBy('stage.name')
        .getRawMany(),
      this.activityRepository.find({
        where: { tenantId },
        relations: ['user', 'customer'],
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    return {
      summary: {
        customers,
        opportunities,
        tasks,
        invoices,
        totalRevenue: parseFloat(totalRevenue?.total || '0'),
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      },
      tasksByStatus: tasksByStatus.map((t: any) => ({
        status: t.status,
        count: parseInt(t.count),
      })),
      opportunitiesByStage: opportunitiesByStage.map((o: any) => ({
        stage: o.stage,
        count: parseInt(o.count),
        value: parseFloat(o.value || '0'),
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt,
        user: a.user
          ? {
              firstName: a.user.firstName,
              lastName: a.user.lastName,
            }
          : null,
        customer: a.customer
          ? {
              name: a.customer.name,
            }
          : null,
      })),
    };

    const result = {
      summary: {
        customers,
        opportunities,
        tasks,
        invoices,
        totalRevenue: parseFloat(totalRevenue?.total || '0'),
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      },
      tasksByStatus: tasksByStatus.map((t: any) => ({
        status: t.status,
        count: parseInt(t.count),
      })),
      opportunitiesByStage: opportunitiesByStage.map((o: any) => ({
        stage: o.stage,
        count: parseInt(o.count),
        value: parseFloat(o.value || '0'),
      })),
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt,
        user: a.user
          ? {
              firstName: a.user.firstName,
              lastName: a.user.lastName,
            }
          : null,
        customer: a.customer
          ? {
              name: a.customer.name,
            }
          : null,
      })),
    };

    await this.cacheManager.set(cacheKey, result, 30000); // 30 seconds cache
    return result;
  }
}

