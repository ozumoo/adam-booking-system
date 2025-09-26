import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
