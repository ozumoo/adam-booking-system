import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability, DayOfWeek } from './availability.entity';

@Injectable()
export class AvailabilityRepository {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async findAll(): Promise<Availability[]> {
    return this.availabilityRepository.find({
      relations: ['painter'],
    });
  }

  async findById(id: number): Promise<Availability | null> {
    return this.availabilityRepository.findOne({
      where: { id },
      relations: ['painter'],
    });
  }

  async findByPainterId(painterId: number): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { painterId },
      relations: ['painter'],
    });
  }

  async findByPainterAndDay(painterId: number, dayOfWeek: DayOfWeek): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { painterId, dayOfWeek },
      relations: ['painter'],
    });
  }

  async create(availabilityData: Partial<Availability>): Promise<Availability> {
    const availability = this.availabilityRepository.create(availabilityData);
    return this.availabilityRepository.save(availability);
  }

  async update(id: number, availabilityData: Partial<Availability>): Promise<Availability | null> {
    await this.availabilityRepository.update(id, availabilityData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.availabilityRepository.delete(id);
  }

  async deleteByPainterId(painterId: number): Promise<void> {
    await this.availabilityRepository.delete({ painterId });
  }
}
