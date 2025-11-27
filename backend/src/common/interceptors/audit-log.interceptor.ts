import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';
import { AuditAction } from '../../modules/audit-logs/entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => AuditLogsService))
    private readonly auditLogsService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;

    // Skip if no user (not authenticated)
    if (!user) {
      return next.handle();
    }

    // Determine action and resource from method and URL
    let action: AuditAction;
    let resource: string;
    let resourceId: string | undefined;

    if (method === 'POST') {
      action = AuditAction.CREATE;
    } else if (method === 'PATCH' || method === 'PUT') {
      action = AuditAction.UPDATE;
    } else if (method === 'DELETE') {
      action = AuditAction.DELETE;
    } else if (method === 'GET') {
      action = AuditAction.VIEW;
    } else {
      return next.handle();
    }

    // Extract resource name from URL (e.g., /customers -> customers)
    const urlParts = url.split('/').filter(Boolean);
    if (urlParts.length > 0 && urlParts[0] !== 'api') {
      resource = urlParts[0];
      resourceId = params?.id || body?.id;
    } else {
      return next.handle();
    }

    // Skip audit logs for certain endpoints
    const skipEndpoints = ['audit-logs', 'reports', 'dashboard', 'notifications'];
    if (skipEndpoints.includes(resource)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Get resource ID from response if not in params/body
          const finalResourceId = resourceId || response?.id || response?.data?.id;

          if (finalResourceId) {
            await this.auditLogsService.create(
              action,
              resource,
              finalResourceId,
              user.id,
              user.tenantId,
              method === 'PATCH' || method === 'PUT' ? undefined : undefined, // oldValues
              method === 'POST' || method === 'PATCH' || method === 'PUT' ? body : undefined, // newValues
              request.ip,
              request.headers['user-agent'],
            );
          }
        } catch (error) {
          // Don't fail the request if audit log creation fails
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }
}

