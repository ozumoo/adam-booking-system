# Painter Booking System

A full-stack application for booking professional painters, built with NestJS, React, TypeScript, and PostgreSQL.

## 🏗️ Architecture

- **Backend**: NestJS with TypeORM and PostgreSQL
- **Frontend**: React with Vite and TailwindCSS
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## 📋 Features

### Backend Features
- **Customer Management**: CRUD operations for customers
- **Painter Management**: CRUD operations for painters with specializations
- **Availability Management**: Set painter availability by day and time
- **Booking System**: Create, update, and manage bookings with conflict validation
- **Validation**: Comprehensive DTO validation with class-validator
- **Testing**: Unit tests for all services

### Frontend Features
- **Painter Registration**: Register painters with availability schedules
- **Customer Registration**: Simple customer registration
- **Booking Flow**: Multi-step booking process
- **Schedule Management**: View and manage painter schedules
- **Responsive Design**: Mobile-friendly interface with TailwindCSS

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd task-implementation
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432

## 🛠️ Development Setup

### Backend Development

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Start PostgreSQL database:
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=painter_booking_db -p 5432:5432 -d postgres:15-alpine
```

5. Run the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Frontend Development

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Access the application at http://localhost:5173

## 📁 Project Structure

```
task-implementation/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── customer/       # Customer module
│   │   ├── painter/        # Painter module
│   │   ├── availability/   # Availability module
│   │   ├── booking/        # Booking module
│   │   └── app.module.ts   # Main app module
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── init.sql               # Database initialization
└── README.md
```

## 🔧 API Endpoints

### Customers
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Painters
- `GET /painters` - Get all painters
- `GET /painters/:id` - Get painter by ID
- `GET /painters?specialization=value` - Filter by specialization
- `POST /painters` - Create new painter
- `PATCH /painters/:id` - Update painter
- `DELETE /painters/:id` - Delete painter

### Availability
- `GET /availabilities` - Get all availabilities
- `GET /availabilities/painter/:painterId` - Get painter availability
- `POST /availabilities` - Create availability
- `PATCH /availabilities/:id` - Update availability
- `DELETE /availabilities/:id` - Delete availability

### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/painter/:painterId` - Get painter bookings
- `GET /bookings/customer/:customerId` - Get customer bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id/status` - Update booking status
- `DELETE /bookings/:id` - Delete booking

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Test coverage
```

### Frontend Tests
```bash
cd frontend
npm run test          # Run tests
npm run test:coverage # Test coverage
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (database data)
docker-compose down -v

# Rebuild specific service
docker-compose up --build api
```

## 🔒 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=painter_booking_db
PORT=3000
NODE_ENV=development
```

### Frontend
The frontend uses the backend API URL from the services/api.ts file.

## 📝 Database Schema

### Customers
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR)
- `createdAt`, `updatedAt` (Timestamps)

### Painters
- `id` (Primary Key)
- `name` (VARCHAR)
- `rating` (DECIMAL)
- `specialization` (VARCHAR)
- `createdAt`, `updatedAt` (Timestamps)

### Availability
- `id` (Primary Key)
- `painterId` (Foreign Key)
- `dayOfWeek` (ENUM)
- `startTime` (TIME)
- `endTime` (TIME)
- `createdAt`, `updatedAt` (Timestamps)

### Bookings
- `id` (Primary Key)
- `painterId` (Foreign Key)
- `customerId` (Foreign Key)
- `date` (DATE)
- `startTime` (TIME)
- `endTime` (TIME)
- `status` (ENUM: pending, confirmed, completed, cancelled)
- `createdAt`, `updatedAt` (Timestamps)

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Build and deploy using Docker:
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Environment-specific configurations
- Development: Uses local database and hot reload
- Production: Uses optimized builds and production database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check environment variables
   - Verify database credentials

2. **Port Conflicts**
   - Change ports in docker-compose.yml if needed
   - Ensure no other services are using the same ports

3. **Build Issues**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

4. **Frontend API Connection**
   - Ensure backend is running on port 3000
   - Check CORS configuration
   - Verify API base URL in services/api.ts

### Getting Help
- Check the logs: `docker-compose logs [service-name]`
- Review the API documentation
- Check the browser console for frontend errors
