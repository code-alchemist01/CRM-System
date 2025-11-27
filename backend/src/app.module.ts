import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailsModule } from './modules/emails/emails.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, appConfig, jwtConfig, emailConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get('redis');
        return {
          store: redisStore,
          host: redis.host,
          port: redis.port,
          ttl: redis.ttl,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    TenantsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CustomersModule,
    ContactsModule,
    OpportunitiesModule,
    TasksModule,
    ActivitiesModule,
    NotificationsModule,
    DocumentsModule,
    InvoicesModule,
    DashboardModule,
    EmailsModule,
    AuditLogsModule,
    ReportsModule,
    EmailTemplatesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
