import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Customer } from '../customers/entities/customer.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Task } from '../tasks/entities/task.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Opportunity, Task, Invoice, Activity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

