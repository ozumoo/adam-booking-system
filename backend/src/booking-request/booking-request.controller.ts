import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BookingRequestService } from '../booking-request/booking-request.service';
import { CreateBookingRequestDto } from '../booking-request/dto/create-booking-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('booking-request')
export class BookingRequestController {
  constructor(private readonly bookingRequestService: BookingRequestService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Body() createBookingRequestDto: CreateBookingRequestDto, @Request() req: any) {
    // Set the customerUserId from the authenticated user
    createBookingRequestDto.customerUserId = req.user.id;
    return this.bookingRequestService.create(createBookingRequestDto);
  }
}
