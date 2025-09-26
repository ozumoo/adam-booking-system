import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Painter } from './painter.entity';

@Injectable()
export class PainterRepository {
  constructor(
    @InjectRepository(Painter)
    private readonly painterRepository: Repository<Painter>,
  ) {}

  async findAll(): Promise<Painter[]> {
    return this.painterRepository.find({
      relations: ['availabilities', 'bookings'],
    });
  }

  async findById(id: number): Promise<Painter | null> {
    return this.painterRepository.findOne({
      where: { id },
      relations: ['availabilities', 'bookings'],
    });
  }

  async create(painterData: Partial<Painter>): Promise<Painter> {
    const painter = this.painterRepository.create(painterData);
    return this.painterRepository.save(painter);
  }

  async update(id: number, painterData: Partial<Painter>): Promise<Painter | null> {
    await this.painterRepository.update(id, painterData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.painterRepository.delete(id);
  }

  async findBySpecialization(specialization: string): Promise<Painter[]> {
    return this.painterRepository.find({
      where: { specialization },
      relations: ['availabilities', 'bookings'],
    });
  }

  async findByUserId(userId: number): Promise<Painter | null> {
    return this.painterRepository.findOne({
      where: { userId },
      relations: ['availabilities', 'bookings', 'user'],
    });
  }
}
