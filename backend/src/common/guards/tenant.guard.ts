import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'] || request.body?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Check if user has access to this tenant
    if (user && user.tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    request.tenant = { id: tenantId };
    return true;
  }
}

