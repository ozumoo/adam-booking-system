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
  };

  const mockPainterService = {
    findOne: jest.fn(),
  };

  const mockAvailabilityService = {
    findByPainterId: jest.fn(),
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
        painterId: 1,
        customerId: 1,
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
        painterId: 1,
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '17:00',
      };

      mockCustomerService.findOne.mockResolvedValue({ id: 1, name: 'Test Customer' });
      mockPainterService.findOne.mockResolvedValue({ id: 1, name: 'Test Painter' });
      mockAvailabilityService.findByPainterId.mockResolvedValue([mockAvailability]);
      mockBookingRepository.findConflictingBookings.mockResolvedValue([]);
      mockBookingRepository.create.mockResolvedValue(expectedBooking);

      const result = await service.create(createBookingDto);

      expect(mockCustomerService.findOne).toHaveBeenCalledWith(1);
      expect(mockPainterService.findOne).toHaveBeenCalledWith(1);
      expect(mockAvailabilityService.findByPainterId).toHaveBeenCalledWith(1);
      expect(mockBookingRepository.findConflictingBookings).toHaveBeenCalled();
      expect(mockBookingRepository.create).toHaveBeenCalledWith(createBookingDto);
      expect(result).toEqual(expectedBooking);
    });

    it('should throw ConflictException for conflicting bookings', async () => {
      const createBookingDto = {
        painterId: 1,
        customerId: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '12:00',
      };

      const conflictingBooking = {
        id: 1,
        painterId: 1,
        customerId: 2,
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '14:00',
      };

      const mockAvailability = {
        id: 1,
        painterId: 1,
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '17:00',
      };

      mockCustomerService.findOne.mockResolvedValue({ id: 1, name: 'Test Customer' });
      mockPainterService.findOne.mockResolvedValue({ id: 1, name: 'Test Painter' });
      mockAvailabilityService.findByPainterId.mockResolvedValue([mockAvailability]);
      mockBookingRepository.findConflictingBookings.mockResolvedValue([conflictingBooking]);

      await expect(service.create(createBookingDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return booking if found', async () => {
      const booking = {
        id: 1,
        painterId: 1,
        customerId: 1,
        date: '2024-01-15',
        startTime: '09:00',
        endTime: '12:00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingRepository.findById.mockResolvedValue(booking);

      const result = await service.findOne(1);

      expect(mockBookingRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(booking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
