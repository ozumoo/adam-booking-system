import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingStatus } from './booking.entity';
import { CustomerService } from '../customer/customer.service';
import { PainterService } from '../painter/painter.service';
import { AvailabilityService } from '../availability/availability.service';
import { DayOfWeek } from '../availability/availability.entity';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly customerService: CustomerService,
    private readonly painterService: PainterService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Verify customer and painter exist
    await this.customerService.findOne(createBookingDto.customerId);
    await this.painterService.findOne(createBookingDto.painterId);

    const bookingDate = new Date(createBookingDto.date);
    
    // Validate time slot
    this.validateTimeSlot(createBookingDto.startTime, createBookingDto.endTime);

    // Check if painter is available on the requested day
    const dayOfWeek = this.getDayOfWeek(bookingDate);
    const availabilities = await this.availabilityService.findByPainterId(createBookingDto.painterId);
    const dayAvailability = availabilities.find(av => av.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability) {
      throw new BadRequestException(`Painter is not available on ${dayOfWeek}`);
    }

    // Check if the requested time slot is within painter's availability
    if (!this.isTimeSlotWithinAvailability(createBookingDto.startTime, createBookingDto.endTime, dayAvailability)) {
      throw new BadRequestException('Requested time slot is outside painter\'s availability');
    }

    // Check for conflicting bookings
    const conflictingBookings = await this.bookingRepository.findConflictingBookings(
      createBookingDto.painterId,
      bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    if (conflictingBookings.length > 0) {
      throw new ConflictException('Painter is already booked for this time slot');
    }

    return this.bookingRepository.create(createBookingDto);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async findByPainterId(painterId: number): Promise<Booking[]> {
    await this.painterService.findOne(painterId); // Verify painter exists
    return this.bookingRepository.findByPainterId(painterId);
  }

  async findByCustomerId(customerId: number): Promise<Booking[]> {
    await this.customerService.findOne(customerId); // Verify customer exists
    return this.bookingRepository.findByCustomerId(customerId);
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    await this.findOne(id); // This will throw NotFoundException if booking doesn't exist
    return this.bookingRepository.updateStatus(id, status);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // This will throw NotFoundException if booking doesn't exist
    await this.bookingRepository.delete(id);
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

  private getDayOfWeek(date: Date): DayOfWeek {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()] as DayOfWeek;
  }

  private isTimeSlotWithinAvailability(
    startTime: string,
    endTime: string,
    availability: any,
  ): boolean {
    const requestedStart = new Date(`2000-01-01T${startTime}`);
    const requestedEnd = new Date(`2000-01-01T${endTime}`);
    const availableStart = new Date(`2000-01-01T${availability.startTime}`);
    const availableEnd = new Date(`2000-01-01T${availability.endTime}`);

    return requestedStart >= availableStart && requestedEnd <= availableEnd;
  }
}
