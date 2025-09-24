import { IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  painterId: number;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
