import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SimpleSeederService } from './simple-seeder.service';

async function runSeed() {
  console.log('Starting seeder...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SimpleSeederService);
  
  try {
    await seederService.seed();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();
