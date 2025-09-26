import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/user.entity';
import { Painter } from '../painter/painter.entity';
import { Customer } from '../customer/customer.entity';
import { Availability } from '../availability/availability.entity';
import { Booking, BookingStatus } from '../booking/booking.entity';

@Injectable()
export class SimpleSeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Painter)
    private readonly painterRepository: Repository<Painter>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async seed(): Promise<void> {
    console.log('Starting database seeding...');
    
    try {
      await this.seedUsers();
      const painters = await this.seedPainters();
      const customers = await this.seedCustomers();
      await this.seedAvailabilities(painters);
      await this.seedBookings(painters, customers);
      
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<void> {
    console.log('Seeding users...');
    
    const users = [
      { name: 'John Painter', email: 'john@example.com', password: 'password123', role: UserRole.PAINTER },
      { name: 'Jane Painter', email: 'jane@example.com', password: 'password123', role: UserRole.PAINTER },
      { name: 'Bob Painter', email: 'bob@example.com', password: 'password123', role: UserRole.PAINTER },
      { name: 'Alice Customer', email: 'alice@example.com', password: 'password123', role: UserRole.CUSTOMER },
      { name: 'Charlie Customer', email: 'charlie@example.com', password: 'password123', role: UserRole.CUSTOMER },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      }
    }
    
    console.log('Users seeded successfully');
  }

  private async seedPainters(): Promise<Painter[]> {
    console.log('Seeding painters...');
    
    const painters: Painter[] = [];
    const users = await this.userRepository.find({ where: { role: UserRole.PAINTER } });
    
    for (const user of users) {
      const existingPainter = await this.painterRepository.findOne({ where: { userId: user.id } });
      if (!existingPainter) {
        const painter = this.painterRepository.create({
          userId: user.id,
          specialization: 'Interior Painting',
          rating: 4.5,
        });
        await this.painterRepository.save(painter);
        painters.push(painter);
      }
    }
    
    console.log(`Created ${painters.length} painters`);
    return painters;
  }

  private async seedCustomers(): Promise<Customer[]> {
    console.log('Seeding customers...');
    
    const customers: Customer[] = [];
    const users = await this.userRepository.find({ where: { role: UserRole.CUSTOMER } });
    
    for (const user of users) {
      const existingCustomer = await this.customerRepository.findOne({ where: { userId: user.id } });
      if (!existingCustomer) {
        const customer = this.customerRepository.create({
          userId: user.id,
        });
        await this.customerRepository.save(customer);
        customers.push(customer);
      }
    }
    
    console.log(`Created ${customers.length} customers`);
    return customers;
  }

  private async seedAvailabilities(painters: Painter[]): Promise<void> {
    console.log('Seeding availabilities...');
    
    const availabilities: any[] = [];
    const today = new Date();
    
    for (const painter of painters) {
      // Create availability slots for the next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        
        // Create morning slot: 9 AM to 12 PM
        const morningStart = new Date(date);
        morningStart.setHours(9, 0, 0, 0);
        const morningEnd = new Date(date);
        morningEnd.setHours(12, 0, 0, 0);
        
        availabilities.push({
          painterUserId: painter.userId,
          startTime: morningStart,
          endTime: morningEnd,
        });
        
        // Create afternoon slot: 1 PM to 5 PM
        const afternoonStart = new Date(date);
        afternoonStart.setHours(13, 0, 0, 0);
        const afternoonEnd = new Date(date);
        afternoonEnd.setHours(17, 0, 0, 0);
        
        availabilities.push({
          painterUserId: painter.userId,
          startTime: afternoonStart,
          endTime: afternoonEnd,
        });
      }
    }

    // Save all availabilities
    for (const availability of availabilities) {
      await this.availabilityRepository.save(availability);
    }
    
    console.log(`Created ${availabilities.length} availability records`);
  }

  private async seedBookings(painters: Painter[], customers: Customer[]): Promise<void> {
    console.log('Seeding bookings...');
    
    if (painters.length === 0 || customers.length === 0) {
      console.log('No painters or customers available for booking creation');
      return;
    }

    const bookings: Booking[] = [];
    const today = new Date();
    
    // Create a few sample bookings
    for (let i = 0; i < 3; i++) {
      const painter = painters[i % painters.length];
      const customer = customers[i % customers.length];
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() + i + 1);
      
      const booking = this.bookingRepository.create({
        painterUserId: painter.userId,
        customerUserId: customer.userId,
        date: bookingDate,
        startTime: '10:00',
        endTime: '14:00',
        status: BookingStatus.CONFIRMED,
      });
      
      await this.bookingRepository.save(booking);
      bookings.push(booking);
    }
    
    console.log(`Created ${bookings.length} bookings`);
  }
}
