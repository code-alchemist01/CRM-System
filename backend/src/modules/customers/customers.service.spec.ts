import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<Customer>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a customer', async () => {
    const createDto = {
      name: 'Test Customer',
      email: 'test@example.com',
    };
    const mockCustomer = { id: '1', ...createDto, tenantId: 'tenant-1' };

    mockRepository.create.mockReturnValue(mockCustomer);
    mockRepository.save.mockResolvedValue(mockCustomer);

    const result = await service.create(createDto, 'tenant-1');
    expect(result).toEqual(mockCustomer);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should find all customers', async () => {
    const mockCustomers = [
      { id: '1', name: 'Customer 1', tenantId: 'tenant-1' },
      { id: '2', name: 'Customer 2', tenantId: 'tenant-1' },
    ];

    mockRepository.find.mockResolvedValue(mockCustomers);

    const result = await service.findAll('tenant-1');
    expect(result).toEqual(mockCustomers);
    expect(mockRepository.find).toHaveBeenCalled();
  });
});

