import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { PainterRepository } from '../painter/painter.repository';
import { CustomerRepository } from '../customer/customer.repository';
import { User, UserRole } from './user.entity';
import { Painter } from '../painter/painter.entity';
import { Customer } from '../customer/customer.entity';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly painterRepository: PainterRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  async createPainterProfile(userId: number, specialization: string): Promise<Painter> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PAINTER) {
      throw new BadRequestException('User is not a painter');
    }

    // Check if painter profile already exists
    const existingPainter = await this.painterRepository.findByUserId(userId);
    if (existingPainter) {
      throw new BadRequestException('Painter profile already exists for this user');
    }

    return this.painterRepository.create({
      userId,
      specialization,
      rating: 0,
    });
  }

  async createCustomerProfile(userId: number): Promise<Customer> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.CUSTOMER) {
      throw new BadRequestException('User is not a customer');
    }

    // Check if customer profile already exists
    const existingCustomer = await this.customerRepository.findByUserId(userId);
    if (existingCustomer) {
      throw new BadRequestException('Customer profile already exists for this user');
    }

    return this.customerRepository.create({
      userId,
    });
  }

  async getUserWithProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPainterByUserId(userId: number): Promise<Painter> {
    const painter = await this.painterRepository.findByUserId(userId);

    if (!painter) {
      throw new NotFoundException('Painter profile not found for this user');
    }

    return painter;
  }

  async getCustomerByUserId(userId: number): Promise<Customer> {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    return customer;
  }

  async ensureProfileExists(userId: number, role: UserRole): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (role === UserRole.PAINTER) {
      const painter = await this.painterRepository.findByUserId(userId);
      if (!painter) {
        await this.createPainterProfile(userId, 'General'); // Default specialization
      }
    } else if (role === UserRole.CUSTOMER) {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer) {
        await this.createCustomerProfile(userId);
      }
    }
  }
}
