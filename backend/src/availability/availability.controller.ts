import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PAINTER)
  create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Request() req: any) {
    // Set the painterUserId from the authenticated user
    createAvailabilityDto.painterUserId = req.user.id;
    return this.availabilityService.create(createAvailabilityDto);
  }

  @Get()
  findAll() {
    return this.availabilityService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PAINTER)
  findMyAvailability(@Request() req: any) {
    return this.availabilityService.findByPainterUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.availabilityService.findOne(id);
  }

  @Get('painter/:painterId')
  findByPainterId(@Param('painterId', ParseIntPipe) painterId: number) {
    return this.availabilityService.findByPainterId(painterId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
    return this.availabilityService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.availabilityService.remove(id);
  }

  @Delete('painter/:painterId')
  removeByPainterId(@Param('painterId', ParseIntPipe) painterId: number) {
    return this.availabilityService.removeByPainterId(painterId);
  }
}
