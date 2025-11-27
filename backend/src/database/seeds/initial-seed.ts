import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/roles/entities/permission.entity';
import { RolePermission } from '../../modules/roles/entities/role-permission.entity';
import { OpportunityStage } from '../../modules/opportunities/entities/opportunity-stage.entity';

export async function seedDatabase(dataSource: DataSource) {
  const tenantRepository = dataSource.getRepository(Tenant);
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);
  const stageRepository = dataSource.getRepository(OpportunityStage);

  // Create default tenant
  let tenant = await tenantRepository.findOne({ where: { name: 'Default Company' } });
  if (!tenant) {
    tenant = tenantRepository.create({
      name: 'Default Company',
      domain: 'default',
      isActive: true,
    });
    tenant = await tenantRepository.save(tenant);
    console.log('✓ Default tenant created');
  }

  // Create permissions
  const permissions = [
    { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
    { name: 'users.write', description: 'Write users', resource: 'users', action: 'write' },
    { name: 'customers.read', description: 'Read customers', resource: 'customers', action: 'read' },
    { name: 'customers.write', description: 'Write customers', resource: 'customers', action: 'write' },
    { name: 'opportunities.read', description: 'Read opportunities', resource: 'opportunities', action: 'read' },
    { name: 'opportunities.write', description: 'Write opportunities', resource: 'opportunities', action: 'write' },
    { name: 'invoices.read', description: 'Read invoices', resource: 'invoices', action: 'read' },
    { name: 'invoices.write', description: 'Write invoices', resource: 'invoices', action: 'write' },
  ];

  const savedPermissions: Permission[] = [];
  for (const perm of permissions) {
    let permission = await permissionRepository.findOne({ where: { name: perm.name } });
    if (!permission) {
      permission = permissionRepository.create(perm);
      permission = await permissionRepository.save(permission);
    }
    savedPermissions.push(permission);
  }
  console.log('✓ Permissions created');

  // Create roles
  let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = roleRepository.create({
      name: 'admin',
      description: 'Administrator role',
      tenantId: tenant.id,
      isActive: true,
    });
    adminRole = await roleRepository.save(adminRole);

    // Assign all permissions to admin
    for (const permission of savedPermissions) {
      const rolePermission = rolePermissionRepository.create({
        roleId: adminRole.id,
        permissionId: permission.id,
      });
      await rolePermissionRepository.save(rolePermission);
    }
    console.log('✓ Admin role created');
  }

  let managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
  if (!managerRole) {
    managerRole = roleRepository.create({
      name: 'manager',
      description: 'Manager role',
      tenantId: tenant.id,
      isActive: true,
    });
    managerRole = await roleRepository.save(managerRole);
    console.log('✓ Manager role created');
  }

  let salesRole = await roleRepository.findOne({ where: { name: 'sales' } });
  if (!salesRole) {
    salesRole = roleRepository.create({
      name: 'sales',
      description: 'Sales role',
      tenantId: tenant.id,
      isActive: true,
    });
    salesRole = await roleRepository.save(salesRole);
    console.log('✓ Sales role created');
  }

  // Create default admin user
  let adminUser = await userRepository.findOne({ where: { email: 'admin@example.com' } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      tenantId: tenant.id,
      isActive: true,
      roles: [adminRole],
    });
    adminUser = await userRepository.save(adminUser);
    console.log('✓ Default admin user created (admin@example.com / admin123)');
  }

  // Create default opportunity stages
  const stages = [
    { name: 'Lead', description: 'New lead', order: 1 },
    { name: 'Qualified', description: 'Qualified lead', order: 2 },
    { name: 'Proposal', description: 'Proposal sent', order: 3 },
    { name: 'Negotiation', description: 'In negotiation', order: 4 },
    { name: 'Closed Won', description: 'Deal won', order: 5 },
    { name: 'Closed Lost', description: 'Deal lost', order: 6 },
  ];

  for (const stage of stages) {
    let existingStage = await stageRepository.findOne({
      where: { name: stage.name, tenantId: tenant.id },
    });
    if (!existingStage) {
      existingStage = stageRepository.create({
        ...stage,
        tenantId: tenant.id,
      });
      await stageRepository.save(existingStage);
    }
  }
  console.log('✓ Default opportunity stages created');

  console.log('\n✅ Database seeding completed!');
}

