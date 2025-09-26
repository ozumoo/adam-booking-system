import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { SimpleSeederService } from './seeders/simple-seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Run seeders if in development mode and SEED_DB is true
  if (process.env.NODE_ENV === 'development' && process.env.SEED_DB === 'true') {
    const seederService = app.get(SimpleSeederService);
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    
    try {
      logger.log('Starting database seeding', { context: 'Bootstrap' });
      await seederService.seed();
      logger.log('Database seeding completed successfully', { context: 'Bootstrap' });
    } catch (error) {
      logger.error('Failed to seed database', {
        context: 'Bootstrap',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: http://localhost:${port}`, {
    context: 'Bootstrap',
    port,
    environment: process.env.NODE_ENV || 'development',
  });
}
bootstrap();
