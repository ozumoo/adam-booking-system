import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Availability } from './availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto): Promise<any> {
    const { startTime, endTime } = createAvailabilityDto;
    
    // Validate datetime format
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format for startTime or endTime');
    }
    
    if (startDate >= endDate) {
      throw new BadRequestException('startTime must be before endTime');
    }
    
    const availability = await this.availabilityRepository.create({
      ...createAvailabilityDto,
      startTime: startDate,
      endTime: endDate
    });

    // Format response to match task specification
    return {
      id: availability.id,
      painterId: availability.painterUserId,
      startTime: availability.startTime.toISOString(),
      endTime: availability.endTime.toISOString()
    };
  }

  async findAll(): Promise<Availability[]> {
    return this.availabilityRepository.findAll();
  }

  async findOne(id: number): Promise<Availability> {
    const availability = await this.availabilityRepository.findById(id);
    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }
    return availability;
  }

  async findByPainterId(painterId: number): Promise<Availability[]> {
    return this.availabilityRepository.findByPainterId(painterId);
  }

  async findByPainterUserId(painterUserId: number): Promise<any[]> {
    const availabilities = await this.availabilityRepository.findByPainterUserId(painterUserId);
    
    // Format response to match task specification
    return availabilities.map(availability => ({
      id: availability.id,
      startTime: availability.startTime.toISOString(),
      endTime: availability.endTime.toISOString()
    }));
  }


  async update(id: number, updateData: Partial<Availability>): Promise<Availability> {
    const availability = await this.findOne(id);
    Object.assign(availability, updateData);
    return this.availabilityRepository.save(availability);
  }

  async remove(id: number): Promise<void> {
    const availability = await this.findOne(id);
    await this.availabilityRepository.remove(availability);
  }

  async removeByPainterId(painterId: number): Promise<void> {
    await this.availabilityRepository.removeByPainterId(painterId);
  }
}