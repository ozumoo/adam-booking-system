import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
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
    return this.bookingService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }
}