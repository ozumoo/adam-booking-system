import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../booking/booking.entity';
import { Availability } from '../availability/availability.entity';
import { Painter } from '../painter/painter.entity';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { RecommendationService } from '../booking/recommendation.service';

@Injectable()
export class BookingRequestService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Painter)
    private readonly painterRepository: Repository<Painter>,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(createBookingRequestDto: CreateBookingRequestDto) {
    const { startTime, endTime } = createBookingRequestDto;
    
    // Validate date format
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format for startTime or endTime');
    }
    
    if (startDate >= endDate) {
      throw new BadRequestException('startTime must be before endTime');
    }
    
    const availablePainters = await this.findAvailablePainters(startTime, endTime);
    
    if (availablePainters.length === 0) {
      const requestedDate = new Date(startTime).toISOString().split('T')[0];
      const requestedStartTime = new Date(startTime).toTimeString().split(' ')[0].substring(0, 5);
      const requestedEndTime = new Date(endTime).toTimeString().split(' ')[0].substring(0, 5);
      
      try {
        const recommendations = await this.recommendationService.findClosestAvailableSlots(
          requestedDate,
          requestedStartTime,
          requestedEndTime,
          undefined,
          5
        );

        return {
          error: "No painters are available for the requested time slot.",
          recommendations: recommendations
        };
      } catch (error) {
        console.error('Error getting recommendations:', error);
        return {
          error: "No painters are available for the requested time slot.",
          recommendations: []
        };
      }
    }

    // Sort painters by rating (highest first) for smart selection
    const sortedPainters = availablePainters.sort((a, b) => {
      const ratingA = Number(a.rating) || 0;
      const ratingB = Number(b.rating) || 0;
      return ratingB - ratingA;
    });
    
    const assignedPainter = sortedPainters[0];
    
    const booking = this.bookingRepository.create({
      painterUserId: assignedPainter.userId,
      customerUserId: createBookingRequestDto.customerUserId || 1, // Use authenticated customer ID
      date: new Date(startTime).toISOString().split('T')[0],
      startTime: new Date(startTime).toTimeString().split(' ')[0].substring(0, 5),
      endTime: new Date(endTime).toTimeString().split(' ')[0].substring(0, 5),
      status: BookingStatus.CONFIRMED
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Get painter name safely
    let painterName = 'Unknown Painter';
    if (assignedPainter.user && assignedPainter.user.name) {
      painterName = assignedPainter.user.name;
    } else {
      painterName = `Painter ${assignedPainter.userId}`;
    }

    return {
      bookingId: savedBooking.id,
      painter: {
        id: assignedPainter.userId,
        name: painterName
      },
      startTime: startTime,
      endTime: endTime,
      status: BookingStatus.CONFIRMED
    };
  }

  private async findAvailablePainters(startTime: string, endTime: string): Promise<Painter[]> {
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);
    
    const availabilities = await this.availabilityRepository.find();
    
    const availablePainters: Painter[] = [];
    
    for (const availability of availabilities) {
      if (this.isTimeSlotWithinAvailability(requestedStart, requestedEnd, availability)) {
        const hasConflict = await this.hasBookingConflict(
          availability.painterUserId,
          requestedStart.toISOString().split('T')[0],
          requestedStart.toTimeString().substring(0, 5),
          requestedEnd.toTimeString().substring(0, 5)
        );

        if (!hasConflict) {
          const painter = await this.painterRepository.findOne({ 
            where: { userId: availability.painterUserId },
            relations: ['user']
          });
          if (painter) {
            availablePainters.push(painter);
          } else {
            // Skip painters without profiles - they can't be assigned
            console.log(`Skipping painter with userId ${availability.painterUserId} - no painter profile found`);
          }
        }
      }
    }
    return availablePainters;
  }

  private isTimeSlotWithinAvailability(
    requestedStart: Date,
    requestedEnd: Date,
    availability: Availability,
  ): boolean {
    const availStart = new Date(availability.startTime);
    const availEnd = new Date(availability.endTime);

    // Check if the requested time slot is within the availability window
    return requestedStart >= availStart && requestedEnd <= availEnd;
  }

  private async hasBookingConflict(painterUserId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
    const bookings = await this.bookingRepository.find({
      where: {
        painterUserId,
        date: new Date(date),
        status: BookingStatus.CONFIRMED
      }
    });
    
    return bookings.some(booking => {
      const bookingStart = this.parseTime(booking.startTime);
      const bookingEnd = this.parseTime(booking.endTime);
      const requestedStart = this.parseTime(startTime);
      const requestedEnd = this.parseTime(endTime);

      return requestedStart < bookingEnd && requestedEnd > bookingStart;
    });
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}