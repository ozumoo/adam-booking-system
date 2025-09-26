import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['painter', 'customer'],
    });
  }

  async findById(id: number): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id },
      relations: ['painter', 'customer'],
    });
  }

  async findByPainterId(painterId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { painterUserId: painterId },
      relations: ['painter', 'customer'],
    });
  }

  async findByCustomerId(customerId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { customerUserId: customerId },
      relations: ['painter', 'customer'],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['painter', 'customer'],
    });
  }

  async findConflictingBookings(
    painterUserId: number,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.painterUserId = :painterUserId', { painterUserId })
      .andWhere('booking.date = :date', { date })
      .andWhere('booking.status != :cancelledStatus', { cancelledStatus: BookingStatus.CANCELLED })
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeId) {
      query.andWhere('booking.id != :excludeId', { excludeId });
    }

    return query.getMany();
  }

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingRepository.create(bookingData);
    return this.bookingRepository.save(booking);
  }

  async update(id: number, bookingData: Partial<Booking>): Promise<Booking | null> {
    await this.bookingRepository.update(id, bookingData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.bookingRepository.delete(id);
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking | null> {
    await this.bookingRepository.update(id, { status });
    return this.findById(id);
  }

  async save(booking: Booking): Promise<Booking> {
    return this.bookingRepository.save(booking);
  }

  async remove(booking: Booking): Promise<void> {
    await this.bookingRepository.remove(booking);
  }

  async findOne(id: number): Promise<Booking | null> {
    return this.findById(id);
  }

  async findByCustomerUserId(customerUserId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { customerUserId },
      relations: ['painter', 'customer'],
    });
  }

  async findByPainterUserId(painterUserId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { painterUserId },
      relations: ['painter', 'customer'],
    });
  }
}
