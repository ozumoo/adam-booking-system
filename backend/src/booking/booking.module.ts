import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { Booking } from './booking.entity';
import { CustomerModule } from '../customer/customer.module';
import { PainterModule } from '../painter/painter.module';
import { AvailabilityModule } from '../availability/availability.module';
import { Painter } from '../painter/painter.entity';
import { Availability } from '../availability/availability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Painter, Availability]),
    CustomerModule,
    PainterModule,
    AvailabilityModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
