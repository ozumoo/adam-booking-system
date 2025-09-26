import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingStatus } from './booking.entity';
import { CustomerService } from '../customer/customer.service';
import { PainterService } from '../painter/painter.service';
import { AvailabilityService } from '../availability/availability.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly customerService: CustomerService,
    private readonly painterService: PainterService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    this.logger.log(`Booking creation started`, {
      context: 'BookingService.create',
      customerUserId: createBookingDto.customerUserId,
      painterUserId: createBookingDto.painterUserId,
      date: createBookingDto.date,
      startTime: createBookingDto.startTime,
      endTime: createBookingDto.endTime,
    });

    try {
      // Verify customer and painter users exist
      if (createBookingDto.customerUserId) {
        await this.customerService.findByUserId(createBookingDto.customerUserId);
      }
      await this.painterService.findByUserId(createBookingDto.painterUserId);

    const bookingDate = new Date(createBookingDto.date);
    
    // Validate time slot - check if painter has availability for the requested time
    const availabilities = await this.availabilityService.findByPainterUserId(createBookingDto.painterUserId);
    
    // For now, we'll assume the booking is valid if the painter has any availability
    // In a real implementation, you'd check if the specific time slot is available
    const availability = availabilities.length > 0;

    if (!availability) {
      throw new BadRequestException(`Painter is not available for the requested time slot`);
    }

    // Check if time slot is within availability
    if (!this.isTimeSlotWithinAvailability(
      createBookingDto.startTime,
      createBookingDto.endTime,
      availability
    )) {
      throw new BadRequestException('Requested time slot is outside painter availability');
    }

    // Check for conflicts
    const hasConflict = await this.hasBookingConflict(
      createBookingDto.painterUserId,
      createBookingDto.date,
      createBookingDto.startTime,
      createBookingDto.endTime
    );

    if (hasConflict) {
      throw new ConflictException('Painter is already booked for this time slot');
    }

      const bookingData = {
        ...createBookingDto,
        date: new Date(createBookingDto.date)
      };
      
      const booking = await this.bookingRepository.create(bookingData);
      
      this.logger.log(`Booking created successfully`, {
        context: 'BookingService.create',
        bookingId: booking.id,
        customerUserId: booking.customerUserId,
        painterUserId: booking.painterUserId,
        date: booking.date,
        status: booking.status,
      });

      return booking;
    } catch (error) {
      this.logger.error(`Booking creation failed`, {
        context: 'BookingService.create',
        customerUserId: createBookingDto.customerUserId,
        painterUserId: createBookingDto.painterUserId,
        date: createBookingDto.date,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }

  async findByCustomerId(customerId: number): Promise<Booking[]> {
    return this.bookingRepository.findByCustomerUserId(customerId);
  }

  async findByPainterId(painterId: number): Promise<Booking[]> {
    return this.bookingRepository.findByPainterUserId(painterId);
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
    this.logger.log(`Booking status update started`, {
      context: 'BookingService.updateStatus',
      bookingId: id,
      newStatus: status,
    });

    try {
      const booking = await this.findOne(id);
      const oldStatus = booking.status;
      booking.status = status;
      const updatedBooking = await this.bookingRepository.save(booking);

      this.logger.log(`Booking status updated successfully`, {
        context: 'BookingService.updateStatus',
        bookingId: id,
        oldStatus,
        newStatus: status,
        customerUserId: booking.customerUserId,
        painterUserId: booking.painterUserId,
      });

      return updatedBooking;
    } catch (error) {
      this.logger.error(`Booking status update failed`, {
        context: 'BookingService.updateStatus',
        bookingId: id,
        newStatus: status,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async findByCustomerUserId(customerUserId: number): Promise<Booking[]> {
    return this.bookingRepository.findByCustomerUserId(customerUserId);
  }

  async findByPainterUserId(painterUserId: number): Promise<Booking[]> {
    return this.bookingRepository.findByPainterUserId(painterUserId);
  }

  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private isTimeSlotWithinAvailability(
    startTime: string,
    endTime: string,
    availability: any
  ): boolean {
    const availStart = this.parseTime(availability.startTime);
    const availEnd = this.parseTime(availability.endTime);
    const reqStart = this.parseTime(startTime);
    const reqEnd = this.parseTime(endTime);

    return reqStart >= availStart && reqEnd <= availEnd;
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async hasBookingConflict(
    painterId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const bookings = await this.bookingRepository.findAll();
    
    return bookings.some(booking => {
      if (booking.painterUserId !== painterId || booking.date.toISOString().split('T')[0] !== date) {
        return false;
      }

      const requestedStart = this.parseTime(startTime);
      const requestedEnd = this.parseTime(endTime);
      const bookingStart = this.parseTime(booking.startTime);
      const bookingEnd = this.parseTime(booking.endTime);

      return booking.status !== 'cancelled' && 
             requestedStart < bookingEnd && 
             requestedEnd > bookingStart;
    });
  }
}