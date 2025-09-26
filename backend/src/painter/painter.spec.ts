import { Test, TestingModule } from '@nestjs/testing';
import { PainterService } from './painter.service';
import { PainterRepository } from './painter.repository';
import { NotFoundException } from '@nestjs/common';

describe('PainterService', () => {
  let service: PainterService;
  let repository: PainterRepository;

  const mockPainterRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findBySpecialization: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PainterService,
        {
          provide: PainterRepository,
          useValue: mockPainterRepository,
        },
      ],
    }).compile();

    service = module.get<PainterService>(PainterService);
    repository = module.get<PainterRepository>(PainterRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a painter successfully', async () => {
      const createPainterDto = {
        userId: 1,
        rating: 4.5,
        specialization: 'Interior Painting',
      };

      const expectedPainter = {
        id: 1,
        ...createPainterDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPainterRepository.create.mockResolvedValue(expectedPainter);

      const result = await service.create(createPainterDto);

      expect(mockPainterRepository.create).toHaveBeenCalledWith(createPainterDto);
      expect(result).toEqual(expectedPainter);
    });
  });

  describe('findOne', () => {
    it('should return a painter if found', async () => {
      const painter = {
        id: 1,
        name: 'John Painter',
        rating: 4.5,
        specialization: 'Interior Painting',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPainterRepository.findById.mockResolvedValue(painter);

      const result = await service.findOne(1);

      expect(mockPainterRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(painter);
    });

    it('should throw NotFoundException if painter not found', async () => {
      mockPainterRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
