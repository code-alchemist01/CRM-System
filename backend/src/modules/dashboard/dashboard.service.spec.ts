import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { Customer } from '../customers/entities/customer.entity';
import { Opportunity } from '../opportunities/entities/opportunity.entity';
import { Task } from '../tasks/entities/task.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Activity } from '../activities/entities/activity.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockCustomerRepository: any;
  let mockOpportunityRepository: any;
  let mockTaskRepository: any;
  let mockInvoiceRepository: any;
  let mockActivityRepository: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockCustomerRepository = {
      count: jest.fn(),
    };
    mockOpportunityRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockTaskRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockInvoiceRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    mockActivityRepository = {
      find: jest.fn(),
    };
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: mockOpportunityRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return stats from cache if available', async () => {
      const tenantId = 'test-tenant-id';
      const cachedStats = {
        customers: 10,
        opportunities: 5,
        tasks: 8,
        invoices: 3,
      };

      mockCacheManager.get.mockResolvedValue(cachedStats);

      const result = await service.getStats(tenantId);

      expect(result).toEqual(cachedStats);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `dashboard:stats:${tenantId}`,
      );
      expect(mockCustomerRepository.count).not.toHaveBeenCalled();
    });

    it('should fetch stats from database if not cached', async () => {
      const tenantId = 'test-tenant-id';
      const stats = {
        customers: 10,
        opportunities: 5,
        tasks: 8,
        invoices: 3,
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockCustomerRepository.count.mockResolvedValue(10);
      mockOpportunityRepository.count.mockResolvedValue(5);
      mockTaskRepository.count.mockResolvedValue(8);
      mockInvoiceRepository.count.mockResolvedValue(3);

      const result = await service.getStats(tenantId);

      expect(result).toEqual(stats);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `dashboard:stats:${tenantId}`,
        stats,
        30000,
      );
    });
  });
});

