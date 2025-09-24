import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: CustomerRepository;

  const mockCustomerRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      const createCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const expectedCustomer = {
        id: 1,
        ...createCustomerDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.create.mockResolvedValue(expectedCustomer);

      const result = await service.create(createCustomerDto);

      expect(mockCustomerRepository.findByEmail).toHaveBeenCalledWith(createCustomerDto.email);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith(createCustomerDto);
      expect(result).toEqual(expectedCustomer);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const existingCustomer = {
        id: 1,
        ...createCustomerDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomerRepository.findByEmail.mockResolvedValue(existingCustomer);

      await expect(service.create(createCustomerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a customer if found', async () => {
      const customer = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomerRepository.findById.mockResolvedValue(customer);

      const result = await service.findOne(1);

      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
