import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
    tenantId: string,
  ): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      tenantId,
    });
    return this.customerRepository.save(customer);
  }

  async findAll(tenantId: string, search?: string): Promise<Customer[]> {
    const where: any = { tenantId };
    if (search) {
      where.name = Like(`%${search}%`);
    }
    return this.customerRepository.find({
      where,
      relations: ['contacts', 'opportunities'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, tenantId },
      relations: ['contacts', 'opportunities', 'activities', 'documents'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    tenantId: string,
  ): Promise<Customer> {
    const customer = await this.findOne(id, tenantId);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const customer = await this.findOne(id, tenantId);

    // Check for related opportunities
    const opportunitiesCount = await this.opportunityRepository.count({
      where: { customerId: id, tenantId },
    });

    // Check for related invoices
    const invoicesCount = await this.invoiceRepository.count({
      where: { customerId: id, tenantId },
    });

    // Build error message if there are related records
    const relatedRecords: string[] = [];
    if (opportunitiesCount > 0) {
      relatedRecords.push(`${opportunitiesCount} satış fırsatı`);
    }
    if (invoicesCount > 0) {
      relatedRecords.push(`${invoicesCount} fatura`);
    }

    if (relatedRecords.length > 0) {
      throw new BadRequestException(
        `Bu müşteri silinemez çünkü bağlı kayıtlar var: ${relatedRecords.join(', ')}. ` +
        `Lütfen önce bağlı kayıtları silin veya başka bir müşteriye atayın.`,
      );
    }

    await this.customerRepository.remove(customer);
  }
}

