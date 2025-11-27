import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/export')
  @ApiOperation({ summary: 'Export sales report to Excel' })
  async exportSalesReport(
    @Request() req,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const buffer = await this.reportsService.exportSalesReportToExcel(
      req.user.tenantId,
      start,
      end,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  getSalesReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getSalesReport(req.user.tenantId, start, end);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer report' })
  getCustomerReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getCustomerReport(req.user.tenantId, start, end);
  }

  @Get('tasks/export')
  @ApiOperation({ summary: 'Export task report to Excel' })
  async exportTaskReport(
    @Request() req,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const buffer = await this.reportsService.exportTaskReportToExcel(
      req.user.tenantId,
      start,
      end,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=task-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get task report' })
  getTaskReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getTaskReport(req.user.tenantId, start, end);
  }

  @Get('invoices/export')
  @ApiOperation({ summary: 'Export invoice report to Excel' })
  async exportInvoiceReport(
    @Request() req,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const buffer = await this.reportsService.exportInvoiceReportToExcel(
      req.user.tenantId,
      start,
      end,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-report-${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoice report' })
  getInvoiceReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getInvoiceReport(req.user.tenantId, start, end);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get activity report' })
  getActivityReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.getActivityReport(req.user.tenantId, start, end);
  }

}

