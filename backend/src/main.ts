import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SimpleSeederService } from './seeders/simple-seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
    try {
      await seederService.seed();
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
