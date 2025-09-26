import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request, Logger } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    this.logger.log(`Booking creation attempt`, {
      context: 'BookingController.create',
      customerUserId: req.user.id,
      painterUserId: createBookingDto.painterUserId,
      date: createBookingDto.date,
    });

    // Set the customerUserId from the authenticated user
    createBookingDto.customerUserId = req.user.id;
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyBookings(@Request() req: any) {
    this.logger.log(`User requesting their bookings`, {
      context: 'BookingController.findMyBookings',
      userId: req.user.id,
      userRole: req.user.role,
    });

    const user = req.user;
    if (user.role === UserRole.CUSTOMER) {
      return this.bookingService.findByCustomerUserId(user.id);
    } else if (user.role === UserRole.PAINTER) {
      return this.bookingService.findByPainterUserId(user.id);
    }
  }

  @Get('customer/:customerId')
  findByCustomerId(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.bookingService.findByCustomerId(customerId);
  }

  @Get('painter/:painterId')
  findByPainterId(@Param('painterId', ParseIntPipe) painterId: number) {
    return this.bookingService.findByPainterId(painterId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: BookingStatus,
  ) {
    this.logger.log(`Booking status update attempt`, {
      context: 'BookingController.updateStatus',
      bookingId: id,
      newStatus: status,
    });

    return this.bookingService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }
}