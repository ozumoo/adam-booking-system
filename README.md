# Adam Painter Booking System

A full-stack scheduling system that allows customers to request painting services for specific time windows, with automatic painter assignment based on availability. Built with NestJS, React, TypeScript, and PostgreSQL.

## Architecture

- **Backend**: NestJS with TypeORM and PostgreSQL
- **Frontend**: React with Vite and TailwindCSS  
- **Database**: PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Containerization**: Docker & Docker Compose

## Features

### Core Features
- **Automatic Painter Assignment**: System automatically assigns the best available painter
- **Role-based Authentication**: Separate interfaces for painters and customers
- **Real-time Availability**: Painters can set specific datetime availability slots
- **Smart Booking System**: Customers request time slots, system finds best painter
- **Conflict Prevention**: Prevents double-booking and scheduling conflicts

### Bonus Features Implemented

#### 1. **Smart Painter Prioritization** ⭐
When multiple painters are available for a requested time slot, the system chooses the best painter using:
- **Rating-based selection**: Higher-rated painters get priority
- **Automatic assignment**: No manual selection needed
- **Quality assurance**: Ensures customers get the best available service

#### 2. **Recommendation System** 🔍
If no painters are available for the requested time slot:
- **Closest available slots**: Suggests alternative times
- **Multiple options**: Shows up to 5 alternative recommendations
- **Time filtering**: Finds slots within reasonable timeframes
- **Clear explanations**: Shows why each slot is recommended

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### One-Command Setup
```bash
# Clone and start everything
git clone <repository-url>
cd task-implementation
docker-compose up --build
```

### Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

## Development Setup

### Backend Development

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start PostgreSQL database:**
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=painter_booking_db -p 5432:5432 -d postgres:15-alpine
```

5. **Run the application:**
```bash
# Development mode with auto-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Frontend Development

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application at http://localhost:5173**

## 📁 Project Structure

```
task-implementation/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── user/           # User management
│   │   ├── customer/       # Customer module
│   │   ├── painter/        # Painter module
│   │   ├── availability/   # Availability management
│   │   ├── booking/        # Booking system
│   │   ├── booking-request/ # Booking request processing
│   │   └── seeders/        # Database seeding
│   ├── migrations/         # Database migrations
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── init.sql               # Database initialization
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user (painter/customer)
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user

### Availability (Painters)
- `POST /availability` - Add availability slot (datetime format)
- `GET /availability/me` - Get my availability slots
- `GET /availability` - Get all availability slots
- `DELETE /availability/:id` - Remove availability slot

### Booking Requests (Customers)
- `POST /booking-request` - Request booking (auto-assigns painter)
- `GET /bookings/me` - Get my bookings (painters & customers)

### Bookings Management
- `GET /bookings` - Get all bookings
- `GET /bookings/painter/:painterId` - Get painter bookings
- `GET /bookings/customer/:customerId` - Get customer bookings
- `PATCH /bookings/:id/status` - Update booking status

## API Request/Response Examples

### Add Availability (Painter)
```bash
POST /availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "2025-05-18T10:00:00Z",
  "endTime": "2025-05-18T14:00:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "painterId": "uuid",
  "startTime": "2025-05-18T10:00:00Z",
  "endTime": "2025-05-18T14:00:00Z"
}
```

### Request Booking (Customer)
```bash
POST /booking-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "2025-05-18T11:00:00Z",
  "endTime": "2025-05-18T13:00:00Z"
}
```

**Success Response:**
```json
{
  "bookingId": "uuid",
  "painter": {
    "id": "uuid",
    "name": "Best Painter"
  },
  "startTime": "2025-05-18T11:00:00Z",
  "endTime": "2025-05-18T13:00:00Z",
  "status": "confirmed"
}
```

**No Availability Response:**
```json
{
  "error": "No painters are available for the requested time slot.",
  "recommendations": [
    {
      "painterId": "uuid",
      "painterName": "Available Painter",
      "date": "2025-05-19",
      "startTime": "10:00",
      "endTime": "14:00",
      "reason": "Alternative time slot available"
    }
  ]
}
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db

# Stop all services
docker-compose down

# Remove volumes (database data)
docker-compose down -v

# Rebuild specific service
docker-compose up --build api
docker-compose up --build frontend

# Clean up everything
docker-compose down -v
docker system prune -a
```

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

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=painter_booking_db

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key

# Seeding
SEED_DB=true
```

### Frontend
The frontend automatically connects to the backend API at `http://localhost:3000`.

## 🗄️ Database Schema

### Users
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (ENUM: painter, customer)
- `createdAt`, `updatedAt` (Timestamps)

### Painters
- `id` (Primary Key)
- `userId` (Foreign Key to Users)
- `rating` (DECIMAL, 3,2)
- `specialization` (VARCHAR)
- `createdAt`, `updatedAt` (Timestamps)

### Customers
- `id` (Primary Key)
- `userId` (Foreign Key to Users)
- `createdAt`, `updatedAt` (Timestamps)

### Availability
- `id` (Primary Key)
- `painterUserId` (Foreign Key to Users)
- `startTime` (TIMESTAMP)
- `endTime` (TIMESTAMP)
- `createdAt`, `updatedAt` (Timestamps)

### Bookings
- `id` (Primary Key)
- `painterUserId` (Foreign Key to Users)
- `customerUserId` (Foreign Key to Users)
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
- **Development**: Uses local database and hot reload
- **Production**: Uses optimized builds and production database

## 🎨 Frontend Features

### Painter Dashboard
- **Add Availability**: Set specific datetime slots
- **View Bookings**: See assigned bookings
- **Manage Schedule**: Update availability

### Customer Dashboard  
- **Request Booking**: Submit time slot requests
- **View Bookings**: See upcoming appointments
- **Get Recommendations**: Alternative slots when unavailable

### Authentication
- **Role-based Access**: Different interfaces for painters/customers
- **Secure Login**: JWT-based authentication
- **User Registration**: Separate flows for painters and customers

## 🔄 Frontend Application Lifecycle

### Component Structure
```
src/
├── components/
│   ├── AuthModal.tsx          # Login/Register modal
│   ├── Dashboard.tsx         # Main dashboard component
│   ├── LoginForm.tsx         # Login form
│   └── RegisterForm.tsx      # Registration form
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── hooks/
│   └── useAuth.ts           # Custom authentication hook
├── pages/
│   ├── AssignmentFlow.tsx   # Booking flow page
│   ├── BookPainter.tsx      # Booking interface
│   ├── PainterSchedule.tsx  # Painter schedule view
│   └── RegisterPainter.tsx  # Painter registration
├── services/
│   └── api.ts              # API service layer
└── App.tsx                 # Main application component
```

### State Management Flow
1. **Authentication Context**: Manages user login state globally
2. **Role-based Routing**: Redirects users based on their role (painter/customer)
3. **API Integration**: Centralized service layer for backend communication
4. **Real-time Updates**: Automatic refresh of bookings and availability

### User Journey
1. **Landing Page**: Welcome screen with login/register options
2. **Authentication**: JWT-based login with role detection
3. **Dashboard**: Role-specific interface (painter vs customer)
4. **Feature Access**: Role-based feature availability
5. **Data Persistence**: Local storage for authentication state

## 🌱 Database Seeding

### Seeder Service
The application includes a comprehensive seeder service that populates the database with sample data:

```typescript
// SimpleSeederService creates:
- 3 Painter users with profiles
- 2 Customer users  
- 14 Availability slots (7 days × 2 slots per painter)
- 3 Sample bookings
```

### Seeder Data Structure
```typescript
// Users created:
- John Painter (rating: 4.5, specialization: Interior Painting)
- Jane Painter (rating: 4.5, specialization: Interior Painting)  
- Bob Painter (rating: 4.5, specialization: Interior Painting)
- Alice Customer
- Charlie Customer

// Availability slots:
- Morning slots: 9:00 AM - 12:00 PM
- Afternoon slots: 1:00 PM - 5:00 PM
- 7 days of availability per painter
- Total: 42 availability slots

// Sample bookings:
- 3 confirmed bookings across different dates
- Mixed painter-customer assignments
```

### Running the Seeder
```bash
# Automatic seeding (development)
NODE_ENV=development SEED_DB=true npm run start:dev

# Manual seeding
cd backend
npm run seed

# Using Docker
docker-compose exec api npm run seed
```

### Seeder Configuration
The seeder runs automatically when:
- `NODE_ENV=development`
- `SEED_DB=true` environment variable is set
- Database is empty or needs sample data

### Customizing Seeder Data
Edit `backend/src/seeders/simple-seeder.service.ts` to modify:
- Number of users created
- Availability patterns
- Booking samples
- User roles and permissions

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running: `docker-compose logs db`
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

5. **Authentication Issues**
   - Check JWT_SECRET in environment variables
   - Verify token expiration
   - Clear browser storage if needed

### Getting Help
- Check the logs: `docker-compose logs [service-name]`
- Review the API documentation above
- Check the browser console for frontend errors
- Verify database migrations are applied

## Bonus Features Implementation

### Smart Painter Prioritization
```typescript
// Sort painters by rating (highest first)
const sortedPainters = availablePainters.sort((a, b) => {
  const ratingA = Number(a.rating) || 0;
  const ratingB = Number(b.rating) || 0;
  return ratingB - ratingA;  // Highest rating first
});
const assignedPainter = sortedPainters[0]; // Best painter gets the job
```

### Recommendation System
- **Closest Available Slots**: Finds alternative times when requested slot unavailable
- **Time Filtering**: Searches within reasonable timeframes
- **Multiple Options**: Provides up to 5 alternative recommendations
- **Clear Explanations**: Explains why each slot is recommended

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

---
