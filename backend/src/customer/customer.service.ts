import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if customer profile already exists for this user
    const existingCustomer = await this.customerRepository.findByUserId(createCustomerDto.userId);
    if (existingCustomer) {
      throw new ConflictException('Customer profile already exists for this user');
    }

    return this.customerRepository.create(createCustomerDto);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    const updatedCustomer = await this.customerRepository.update(id, updateCustomerDto);
    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return updatedCustomer;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // This will throw NotFoundException if customer doesn't exist
    await this.customerRepository.delete(id);
  }

  async findByUserId(userId: number): Promise<Customer> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException(`Customer profile not found for user ID ${userId}`);
    }
    return customer;
  }
}
