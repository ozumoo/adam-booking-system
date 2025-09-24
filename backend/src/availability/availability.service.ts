import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Availability } from './availability.entity';
import { PainterService } from '../painter/painter.service';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly painterService: PainterService,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto): Promise<Availability> {
    // Verify painter exists
    await this.painterService.findOne(createAvailabilityDto.painterId);

    // Validate time format and logic
    this.validateTimeSlot(createAvailabilityDto.startTime, createAvailabilityDto.endTime);

    return this.availabilityRepository.create(createAvailabilityDto);
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
    await this.painterService.findOne(painterId); // Verify painter exists
    return this.availabilityRepository.findByPainterId(painterId);
  }

  async update(id: number, updateData: Partial<Availability>): Promise<Availability> {
    const availability = await this.findOne(id);

    if (updateData.startTime && updateData.endTime) {
      this.validateTimeSlot(updateData.startTime, updateData.endTime);
    }

    return this.availabilityRepository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // This will throw NotFoundException if availability doesn't exist
    await this.availabilityRepository.delete(id);
  }

  async removeByPainterId(painterId: number): Promise<void> {
    await this.painterService.findOne(painterId); // Verify painter exists
    await this.availabilityRepository.deleteByPainterId(painterId);
  }

  private validateTimeSlot(startTime: string, endTime: string): void {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check if time slot is at least 1 hour
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) {
      throw new BadRequestException('Time slot must be at least 1 hour long');
    }
  }
}
