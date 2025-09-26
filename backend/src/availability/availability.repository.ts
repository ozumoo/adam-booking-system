import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Availability } from './availability.entity';

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
      where: { painterUserId: painterId },
      relations: ['painter'],
    });
  }

  async findByPainterUserId(painterUserId: number): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { painterUserId },
      relations: ['painter'],
      order: { startTime: 'ASC' }
    });
  }

  async findAvailableInTimeRange(startTime: Date, endTime: Date): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: {
        startTime: Between(startTime, endTime)
      },
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
    await this.availabilityRepository.delete({ painterUserId: painterId });
  }

  async save(availability: Availability): Promise<Availability> {
    return this.availabilityRepository.save(availability);
  }

  async remove(availability: Availability): Promise<void> {
    await this.availabilityRepository.remove(availability);
  }

  async removeByPainterId(painterId: number): Promise<void> {
    await this.availabilityRepository.delete({ painterUserId: painterId });
  }

}
