# 🧪 Postman API Testing Guide

This guide provides comprehensive instructions for testing the Adam Painter Booking API using the provided Postman collection.

## 📋 Prerequisites

1. **Backend Running**: Ensure the backend is running on `http://localhost:3000`
2. **Database Seeded**: Run the seeder to populate sample data
3. **Postman Installed**: Download from [postman.com](https://www.postman.com/)

## 🚀 Quick Setup

### 1. Import Collection and Environment

1. **Import Collection**:
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `Adam-Painter-Booking.postman_collection.json`

2. **Import Environment**:
   - Click "Import" → "Upload Files"
   - Select `Adam-Painter-Booking.postman_environment.json`
   - Select the environment in the top-right dropdown

### 2. Start Backend with Seeding

```bash
# Start backend with automatic seeding
cd backend
NODE_ENV=development SEED_DB=true npm run start:dev
```

## 🔐 Authentication Flow Testing

### Step 1: Register Users

1. **Register Painter**:
   - Use "Authentication → Register Painter"
   - Update email to avoid conflicts
   - Copy the returned `token` to `painter_token` environment variable

2. **Register Customer**:
   - Use "Authentication → Register Customer"  
   - Update email to avoid conflicts
   - Copy the returned `token` to `customer_token` environment variable

### Step 2: Login Testing

1. **Test Login**:
   - Use "Authentication → Login"
   - Test with valid credentials
   - Test with invalid credentials (should return 401)

2. **Get Profile**:
   - Use "Authentication → Get Profile"
   - Should return user information

## 🎨 Availability Management Testing

### Painter Workflow

1. **Add Availability**:
   - Use "Availability Management → Add Availability (Painter)"
   - Set `auth_token` to `painter_token`
   - Test with valid datetime format
   - Test with invalid datetime format (should return 400)

2. **View My Availability**:
   - Use "Availability Management → Get My Availability"
   - Should return painter's availability slots

3. **View All Availability**:
   - Use "Availability Management → Get All Availability"
   - Should return all availability slots with painter info

## 📅 Booking Request Testing

### Customer Workflow

1. **Request Booking - Success**:
   - Use "Booking Requests → Request Booking (Customer)"
   - Set `customer_token` in Authorization header
   - Use a time slot that overlaps with painter availability
   - Should return assigned painter information

2. **Request Booking - No Availability**:
   - Use a time slot with no painter availability
   - Should return error with recommendations

## 📊 Booking Management Testing

1. **View My Bookings**:
   - Use "Bookings Management → Get My Bookings"
   - Test with both painter and customer tokens
   - Should return role-appropriate bookings

2. **Update Booking Status**:
   - Use "Bookings Management → Update Booking Status"
   - Test status changes (pending → confirmed → completed)

## 🧪 Test Scenarios

### Scenario 1: Complete Booking Flow

1. **Setup**:
   - Register painter and customer
   - Login and get tokens

2. **Painter adds availability**:
   - Add availability for tomorrow 10:00-14:00

3. **Customer requests booking**:
   - Request booking for tomorrow 11:00-13:00
   - Should get assigned to the painter

4. **Painter views bookings**:
   - Check assigned bookings
   - Update status to completed

### Scenario 2: No Availability Handling

1. **Customer requests booking**:
   - Request time slot with no painter availability
   - Should receive recommendations for alternative slots

### Scenario 3: Smart Painter Selection

1. **Add multiple painters**:
   - Register 2-3 painters with different ratings
   - Add overlapping availability

2. **Request booking**:
   - Should assign highest-rated painter

## 🔧 Environment Variables

The collection uses these environment variables:

- `base_url`: API base URL (default: http://localhost:3000)
- `auth_token`: Current user's JWT token
- `customer_token`: Customer-specific token
- `painter_token`: Painter-specific token
- `user_id`: Current user ID
- `user_role`: Current user role
- `booking_id`: Latest booking ID
- `availability_id`: Latest availability ID

## 📝 Sample Test Data

### Valid Request Bodies

**Register Painter**:
```json
{
  "name": "John Painter",
  "email": "john@example.com",
  "password": "password123",
  "role": "painter"
}
```

**Register Customer**:
```json
{
  "name": "Alice Customer",
  "email": "alice@example.com",
  "password": "password123",
  "role": "customer"
}
```

**Add Availability**:
```json
{
  "startTime": "2025-05-18T10:00:00Z",
  "endTime": "2025-05-18T14:00:00Z"
}
```

**Request Booking**:
```json
{
  "startTime": "2025-05-18T11:00:00Z",
  "endTime": "2025-05-18T13:00:00Z"
}
```

## 🚨 Common Issues & Solutions

### Issue 1: 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Solution**: Login first and copy token to environment variable

### Issue 2: 400 Bad Request
- **Cause**: Invalid request body or date format
- **Solution**: Check JSON format and use ISO datetime strings

### Issue 3: 500 Internal Server Error
- **Cause**: Database not seeded or backend not running
- **Solution**: Start backend with seeding enabled

### Issue 4: CORS Errors
- **Cause**: Frontend/Postman CORS issues
- **Solution**: Ensure backend CORS is enabled

## 📊 Expected Response Codes

| Endpoint | Success | Error |
|----------|---------|-------|
| POST /auth/register | 201 | 400 (email exists) |
| POST /auth/login | 200 | 401 (invalid credentials) |
| GET /auth/profile | 200 | 401 (unauthorized) |
| POST /availability | 201 | 400 (invalid date) |
| GET /availability/me | 200 | 401 (unauthorized) |
| POST /booking-request | 201/200 | 400 (invalid request) |
| GET /bookings/me | 200 | 401 (unauthorized) |
| PATCH /bookings/:id/status | 200 | 404 (not found) |

## 🎯 Testing Checklist

- [ ] Backend running on localhost:3000
- [ ] Database seeded with sample data
- [ ] Collection and environment imported
- [ ] Authentication flow tested
- [ ] Availability management tested
- [ ] Booking request flow tested
- [ ] Error scenarios tested
- [ ] Smart painter selection verified
- [ ] Recommendation system tested

## 🔄 Automated Testing

You can also run automated tests using the Postman collection:

1. **Newman CLI**:
```bash
npm install -g newman
newman run Adam-Painter-Booking.postman_collection.json -e Adam-Painter-Booking.postman_environment.json
```

2. **Postman Runner**:
   - Open collection in Postman
   - Click "Run" button
   - Select environment
   - Run all requests

This comprehensive testing setup ensures all API endpoints work correctly with proper authentication, error handling, and business logic validation.
