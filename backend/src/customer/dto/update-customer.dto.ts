import { IsOptional, IsNumber } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsNumber()
  userId?: number;
}
