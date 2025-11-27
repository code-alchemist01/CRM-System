import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Customer } from '../customers/entities/customer.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Task } from '../tasks/entities/task.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Activity } from '../activities/entities/activity.entity';

export interface SalesReport {
  totalRevenue: number;
  totalOpportunities: number;
  wonOpportunities: number;
  averageDealSize: number;
  conversionRate: number;
  opportunitiesByStage: Array<{ stage: string; count: number; value: number }>;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customersByStatus: Array<{ status: string; count: number }>;
}

export interface TaskReport {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: Array<{ status: string; count: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
}

export interface InvoiceReport {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  invoicesByStatus: Array<{ status: string; count: number; amount: number }>;
}

@Injectable()
export class ReportsService {
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
  ) {}

  async getSalesReport(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SalesReport> {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const opportunities = await this.opportunityRepository.find({
      where,
      relations: ['stage'],
    });

    const totalRevenue = opportunities.reduce(
      (sum, opp) => sum + Number(opp.value || 0),
      0,
    );
    const totalOpportunities = opportunities.length;
    const wonOpportunities = opportunities.filter(
      (opp) => opp.stage?.name?.toLowerCase().includes('won') || false,
    ).length;

    const averageDealSize =
      totalOpportunities > 0 ? totalRevenue / totalOpportunities : 0;
    const conversionRate =
      totalOpportunities > 0
        ? (wonOpportunities / totalOpportunities) * 100
        : 0;

    const stageMap = new Map<string, { count: number; value: number }>();
    opportunities.forEach((opp) => {
      const stageName = opp.stage?.name || 'Unknown';
      const existing = stageMap.get(stageName) || { count: 0, value: 0 };
      stageMap.set(stageName, {
        count: existing.count + 1,
        value: existing.value + Number(opp.value || 0),
      });
    });

    const opportunitiesByStage = Array.from(stageMap.entries()).map(
      ([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
      }),
    );

    return {
      totalRevenue,
      totalOpportunities,
      wonOpportunities,
      averageDealSize,
      conversionRate,
      opportunitiesByStage,
    };
  }

  async getCustomerReport(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CustomerReport> {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const customers = await this.customerRepository.find({ where });

    const totalCustomers = customers.length;
    const newCustomers = startDate && endDate
      ? customers.filter(
          (c) =>
            c.createdAt >= startDate && c.createdAt <= endDate,
        ).length
      : 0;
    const activeCustomers = customers.length;

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      customersByStatus: [],
    };
  }

  async getTaskReport(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TaskReport> {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const tasks = await this.taskRepository.find({ where });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== 'completed',
    ).length;

    const statusMap = new Map<string, number>();
    const priorityMap = new Map<string, number>();

    tasks.forEach((task) => {
      statusMap.set(
        task.status,
        (statusMap.get(task.status) || 0) + 1,
      );
      if (task.priority) {
        priorityMap.set(
          task.priority,
          (priorityMap.get(task.priority) || 0) + 1,
        );
      }
    });

    const tasksByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    const tasksByPriority = Array.from(priorityMap.entries()).map(
      ([priority, count]) => ({
        priority,
        count,
      }),
    );

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
    };
  }

  async getInvoiceReport(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InvoiceReport> {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const invoices = await this.invoiceRepository.find({ where });

    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === 'sent' || inv.status === 'draft',
    ).length;

    const statusMap = new Map<string, { count: number; amount: number }>();
    invoices.forEach((inv) => {
      const existing = statusMap.get(inv.status) || { count: 0, amount: 0 };
      statusMap.set(inv.status, {
        count: existing.count + 1,
        amount: existing.amount + Number(inv.total || 0),
      });
    });

    const invoicesByStatus = Array.from(statusMap.entries()).map(
      ([status, data]) => ({
        status,
        count: data.count,
        amount: data.amount,
      }),
    );

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      invoicesByStatus,
    };
  }

  async getActivityReport(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { tenantId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const activities = await this.activityRepository.find({
      where,
      relations: ['user', 'customer'],
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return activities;
  }

  async exportSalesReportToExcel(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Buffer> {
    const report = await this.getSalesReport(tenantId, startDate, endDate);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Header
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Summary data
    worksheet.addRow({ metric: 'Total Revenue', value: report.totalRevenue });
    worksheet.addRow({ metric: 'Total Opportunities', value: report.totalOpportunities });
    worksheet.addRow({ metric: 'Won Opportunities', value: report.wonOpportunities });
    worksheet.addRow({ metric: 'Average Deal Size', value: report.averageDealSize.toFixed(2) });
    worksheet.addRow({ metric: 'Conversion Rate (%)', value: report.conversionRate.toFixed(2) });

    worksheet.addRow({}); // Empty row

    // Opportunities by stage
    worksheet.addRow({ metric: 'Stage', value: 'Count / Value' });
    report.opportunitiesByStage.forEach((stage) => {
      worksheet.addRow({
        metric: stage.stage,
        value: `${stage.count} / ${stage.value}`,
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(7).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportTaskReportToExcel(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Buffer> {
    const report = await this.getTaskReport(tenantId, startDate, endDate);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Task Report');

    // Header
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    worksheet.addRow({ metric: 'Total Tasks', value: report.totalTasks });
    worksheet.addRow({ metric: 'Completed Tasks', value: report.completedTasks });
    worksheet.addRow({ metric: 'Overdue Tasks', value: report.overdueTasks });

    worksheet.addRow({});

    worksheet.addRow({ metric: 'Status', value: 'Count' });
    report.tasksByStatus.forEach((status) => {
      worksheet.addRow({ metric: status.status, value: status.count });
    });

    worksheet.addRow({});

    worksheet.addRow({ metric: 'Priority', value: 'Count' });
    report.tasksByPriority.forEach((priority) => {
      worksheet.addRow({ metric: priority.priority, value: priority.count });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5 + report.tasksByStatus.length + 1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportInvoiceReportToExcel(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Buffer> {
    const report = await this.getInvoiceReport(tenantId, startDate, endDate);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice Report');

    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    worksheet.addRow({ metric: 'Total Invoices', value: report.totalInvoices });
    worksheet.addRow({ metric: 'Total Revenue', value: report.totalRevenue });
    worksheet.addRow({ metric: 'Paid Invoices', value: report.paidInvoices });
    worksheet.addRow({ metric: 'Pending Invoices', value: report.pendingInvoices });

    worksheet.addRow({});

    worksheet.addRow({ metric: 'Status', value: 'Count / Amount' });
    report.invoicesByStatus.forEach((status) => {
      worksheet.addRow({
        metric: status.status,
        value: `${status.count} / ${status.amount}`,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(6).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

