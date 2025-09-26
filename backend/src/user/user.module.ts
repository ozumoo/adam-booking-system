import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserProfileService } from './user-profile.service';
import { Painter } from '../painter/painter.entity';
import { Customer } from '../customer/customer.entity';
import { PainterRepository } from '../painter/painter.repository';
import { CustomerRepository } from '../customer/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Painter, Customer])],
  providers: [UserService, UserRepository, UserProfileService, PainterRepository, CustomerRepository],
  exports: [UserService, UserRepository, UserProfileService],
})
export class UserModule {}
