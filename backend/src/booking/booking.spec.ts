import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { CustomerService } from '../customer/customer.service';
import { PainterService } from '../painter/painter.service';
import { AvailabilityService } from '../availability/availability.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('BookingService', () => {
  let service: BookingService;
  let repository: BookingRepository;
  let customerService: CustomerService;
  let painterService: PainterService;
  let availabilityService: AvailabilityService;

  const mockBookingRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByPainterId: jest.fn(),
    findByCustomerId: jest.fn(),
    findConflictingBookings: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockCustomerService = {
    findOne: jest.fn(),
    findByUserId: jest.fn(),
  };

  const mockPainterService = {
    findOne: jest.fn(),
    findByUserId: jest.fn(),
  };

  const mockAvailabilityService = {
    findByPainterId: jest.fn(),
    findByPainterUserIdAndDay: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: mockBookingRepository,
        },
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
        {
          provide: PainterService,
          useValue: mockPainterService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    repository = module.get<BookingRepository>(BookingRepository);
    customerService = module.get<CustomerService>(CustomerService);
    painterService = module.get<PainterService>(PainterService);
    availabilityService = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create booking successfully', async () => {
      const createBookingDto = {
        painterUserId: 1,
        customerUserId: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '12:00',
      };

      const expectedBooking = {
        id: 1,
        ...createBookingDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAvailability = {
        id: 1,
        painterUserId: 1,
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '17:00',
      };

      mockCustomerService.findByUserId.mockResolvedValue({ id: 1, name: 'Test Customer' });
      mockPainterService.findByUserId.mockResolvedValue({ id: 1, name: 'Test Painter' });
      mockAvailabilityService.findByPainterUserIdAndDay.mockResolvedValue(mockAvailability);
      mockBookingRepository.findAll.mockResolvedValue([]);
      mockBookingRepository.create.mockResolvedValue(expectedBooking);

      const result = await service.create(createBookingDto);

      expect(mockCustomerService.findByUserId).toHaveBeenCalledWith(1);
      expect(mockPainterService.findByUserId).toHaveBeenCalledWith(1);
      expect(mockAvailabilityService.findByPainterUserIdAndDay).toHaveBeenCalledWith(1, 'monday');
      expect(mockBookingRepository.findAll).toHaveBeenCalled();
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...createBookingDto,
        date: new Date(createBookingDto.date),
      });
      expect(result).toEqual(expectedBooking);
    });

    it('should throw ConflictException for conflicting bookings', async () => {
      const createBookingDto = {
        painterUserId: 1,
        customerUserId: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '12:00',
      };

      const conflictingBooking = {
        id: 1,
        painterUserId: 1,
        customerUserId: 2,
        date: new Date('2024-01-15'),
        startTime: '10:00',
        endTime: '14:00',
      };

      const mockAvailability = {
        id: 1,
        painterUserId: 1,
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '17:00',
      };

      mockCustomerService.findByUserId.mockResolvedValue({ id: 1, name: 'Test Customer' });
      mockPainterService.findByUserId.mockResolvedValue({ id: 1, name: 'Test Painter' });
      mockAvailabilityService.findByPainterUserIdAndDay.mockResolvedValue(mockAvailability);
      mockBookingRepository.findAll.mockResolvedValue([conflictingBooking]);

      await expect(service.create(createBookingDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return booking if found', async () => {
      const booking = {
        id: 1,
        painterUserId: 1,
        customerUserId: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingRepository.findOne.mockResolvedValue(booking);

      const result = await service.findOne(1);

      expect(mockBookingRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(booking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
