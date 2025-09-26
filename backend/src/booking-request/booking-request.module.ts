import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRequestController } from './booking-request.controller';
import { BookingRequestService } from './booking-request.service';
import { Booking } from '../booking/booking.entity';
import { Availability } from '../availability/availability.entity';
import { Painter } from '../painter/painter.entity';
import { RecommendationService } from '../booking/recommendation.service';
import { AvailabilityRepository } from '../availability/availability.repository';
import { BookingRepository } from '../booking/booking.repository';
import { PainterService } from '../painter/painter.service';
import { PainterRepository } from '../painter/painter.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Availability, Painter])
  ],
  controllers: [BookingRequestController],
  providers: [BookingRequestService, RecommendationService, AvailabilityRepository, BookingRepository, PainterService, PainterRepository],
  exports: [BookingRequestService],
})
export class BookingRequestModule {}
