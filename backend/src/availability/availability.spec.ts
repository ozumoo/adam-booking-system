import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { AvailabilityRepository } from './availability.repository';
import { PainterService } from '../painter/painter.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let repository: AvailabilityRepository;
  let painterService: PainterService;

  const mockAvailabilityRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByPainterId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteByPainterId: jest.fn(),
  };

  const mockPainterService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: AvailabilityRepository,
          useValue: mockAvailabilityRepository,
        },
        {
          provide: PainterService,
          useValue: mockPainterService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    repository = module.get<AvailabilityRepository>(AvailabilityRepository);
    painterService = module.get<PainterService>(PainterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create availability successfully', async () => {
      const createAvailabilityDto = {
        painterId: 1,
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      };

      const expectedAvailability = {
        id: 1,
        ...createAvailabilityDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPainterService.findOne.mockResolvedValue({ id: 1, name: 'Test Painter' });
      mockAvailabilityRepository.create.mockResolvedValue(expectedAvailability);

      const result = await service.create(createAvailabilityDto);

      expect(mockPainterService.findOne).toHaveBeenCalledWith(1);
      expect(mockAvailabilityRepository.create).toHaveBeenCalledWith(createAvailabilityDto);
      expect(result).toEqual(expectedAvailability);
    });

    it('should throw BadRequestException for invalid time slot', async () => {
      const createAvailabilityDto = {
        painterId: 1,
        dayOfWeek: 'monday',
        startTime: '17:00',
        endTime: '09:00',
      };

      mockPainterService.findOne.mockResolvedValue({ id: 1, name: 'Test Painter' });

      await expect(service.create(createAvailabilityDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return availability if found', async () => {
      const availability = {
        id: 1,
        painterId: 1,
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailabilityRepository.findById.mockResolvedValue(availability);

      const result = await service.findOne(1);

      expect(mockAvailabilityRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(availability);
    });

    it('should throw NotFoundException if availability not found', async () => {
      mockAvailabilityRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
