#  Painter Booking System - Mermaid Diagrams

This document contains comprehensive Mermaid diagrams showcasing the architecture, data flow, and system design of the Painter Booking Application.

##  Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Database Entity Relationship Diagram](#database-entity-relationship-diagram)
3. [User Authentication Flow](#user-authentication-flow)
4. [Booking Process Flow](#booking-process-flow)
5. [API Endpoints Structure](#api-endpoints-structure)
6. [Logging System Architecture](#logging-system-architecture)
7. [Application Module Structure](#application-module-structure)
8. [User Journey Flow](#user-journey-flow)
9. [Data Flow Diagram](#data-flow-diagram)
10. [Security & Authorization Flow](#security--authorization-flow)

---

##  System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend]
        UI[User Interface Components]
    end
    
    subgraph "Backend Layer"
        API[NestJS API Server]
        AUTH[Authentication Service]
        BOOKING[Booking Service]
        AVAIL[Availability Service]
        USER[User Management]
    end
    
    subgraph "Database Layer"
        DB[(PostgreSQL Database)]
        TABLES[Users, Painters, Customers, Bookings, Availability]
    end
    
    subgraph "External Services"
        LOGS[Winston Logging]
        JWT[JWT Tokens]
    end
    
    FE --> API
    API --> AUTH
    API --> BOOKING
    API --> AVAIL
    API --> USER
    
    AUTH --> DB
    BOOKING --> DB
    AVAIL --> DB
    USER --> DB
    
    API --> LOGS
    AUTH --> JWT
    
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class FE,UI frontend
    class API,AUTH,BOOKING,AVAIL,USER backend
    class DB,TABLES database
    class LOGS,JWT external
```

---

##  Database Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string email UK
        string password
        string name
        string phone
        enum role
        datetime createdAt
        datetime updatedAt
    }
    
    PAINTER {
        int id PK
        int userId FK
        decimal rating
        string specialization
        datetime createdAt
        datetime updatedAt
    }
    
    CUSTOMER {
        int id PK
        int userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    AVAILABILITY {
        int id PK
        int painterUserId FK
        timestamp startTime
        timestamp endTime
        datetime createdAt
        datetime updatedAt
    }
    
    BOOKING {
        int id PK
        int painterUserId FK
        int customerUserId FK
        date date
        time startTime
        time endTime
        enum status
        datetime createdAt
        datetime updatedAt
    }
    
    USER ||--o| PAINTER : "has profile"
    USER ||--o| CUSTOMER : "has profile"
    USER ||--o{ AVAILABILITY : "sets availability"
    USER ||--o{ BOOKING : "as painter"
    USER ||--o{ BOOKING : "as customer"
    PAINTER ||--o{ AVAILABILITY : "manages"
    PAINTER ||--o{ BOOKING : "receives"
    CUSTOMER ||--o{ BOOKING : "makes"
```

---

## User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as NestJS API
    participant AUTH as AuthService
    participant JWT as JWT Service
    participant DB as Database
    participant LOG as Winston Logger
    
    U->>FE: Enter credentials
    FE->>API: POST /auth/login
    API->>AUTH: login(credentials)
    AUTH->>LOG: Log login attempt
    AUTH->>DB: validateUser(email, password)
    
    alt Valid credentials
        DB-->>AUTH: User data
        AUTH->>JWT: generateToken(user)
        JWT-->>AUTH: JWT token
        AUTH->>LOG: Log successful login
        AUTH-->>API: {user, token}
        API-->>FE: Success response
        FE-->>U: Login successful
    else Invalid credentials
        DB-->>AUTH: null
        AUTH->>LOG: Log failed login
        AUTH-->>API: UnauthorizedException
        API-->>FE: 401 Unauthorized
        FE-->>U: Login failed
    end
```

---

## Booking Process Flow

```mermaid
flowchart TD
    A[Customer wants to book] --> B[Search for Painters]
    B --> C[View Painter Availability]
    C --> D[Select Time Slot]
    D --> E[Create Booking Request]
    E --> F{Validate Availability}
    
    F -->|Available| G[Check for Conflicts]
    F -->|Not Available| H[Show Error Message]
    
    G --> I{No Conflicts?}
    I -->|Yes| J[Create Booking]
    I -->|No| K[Show Conflict Error]
    
    J --> L[Set Status: PENDING]
    L --> M[Notify Painter]
    M --> N[Painter Reviews Booking]
    
    N --> O{Painter Decision}
    O -->|Accept| P[Status: CONFIRMED]
    O -->|Reject| Q[Status: CANCELLED]
    
    P --> R[Booking Confirmed]
    Q --> S[Booking Cancelled]
    
    R --> T[Service Day]
    T --> U[Status: COMPLETED]
    
    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef success fill:#e8f5e8
    classDef error fill:#ffebee
    
    class A,B,C,D,E,G,J,L,M,N,R,T,U process
    class F,I,O decision
    class P,R success
    class H,K,Q,S error
```

---

## API Endpoints Structure

```mermaid
graph TB
    subgraph "Authentication Endpoints"
        AUTH_REG[POST /auth/register]
        AUTH_LOGIN[POST /auth/login]
        AUTH_PROFILE[GET /auth/profile]
        AUTH_LOGOUT[POST /auth/logout]
    end
    
    subgraph "User Management"
        USER_GET[GET /users]
        USER_UPDATE[PATCH /users/:id]
    end
    
    subgraph "Painter Endpoints"
        PAINTER_GET[GET /painters]
        PAINTER_CREATE[POST /painters]
        PAINTER_UPDATE[PATCH /painters/:id]
        PAINTER_DELETE[DELETE /painters/:id]
    end
    
    subgraph "Customer Endpoints"
        CUSTOMER_GET[GET /customers]
        CUSTOMER_CREATE[POST /customers]
        CUSTOMER_UPDATE[PATCH /customers/:id]
    end
    
    subgraph "Availability Management"
        AVAIL_GET[GET /availability]
        AVAIL_CREATE[POST /availability]
        AVAIL_UPDATE[PATCH /availability/:id]
        AVAIL_DELETE[DELETE /availability/:id]
    end
    
    subgraph "Booking Management"
        BOOKING_GET[GET /bookings]
        BOOKING_CREATE[POST /bookings]
        BOOKING_ME[GET /bookings/me]
        BOOKING_STATUS[PATCH /bookings/:id/status]
        BOOKING_DELETE[DELETE /bookings/:id]
    end
    
    subgraph "Booking Requests"
        REQ_GET[GET /booking-requests]
        REQ_CREATE[POST /booking-requests]
        REQ_UPDATE[PATCH /booking-requests/:id]
    end
    
    classDef auth fill:#ffcdd2
    classDef user fill:#e1f5fe
    classDef painter fill:#f3e5f5
    classDef customer fill:#e8f5e8
    classDef availability fill:#fff3e0
    classDef booking fill:#e0f2f1
    classDef request fill:#fce4ec
    
    class AUTH_REG,AUTH_LOGIN,AUTH_PROFILE,AUTH_LOGOUT auth
    class USER_GET,USER_UPDATE user
    class PAINTER_GET,PAINTER_CREATE,PAINTER_UPDATE,PAINTER_DELETE painter
    class CUSTOMER_GET,CUSTOMER_CREATE,CUSTOMER_UPDATE customer
    class AVAIL_GET,AVAIL_CREATE,AVAIL_UPDATE,AVAIL_DELETE availability
    class BOOKING_GET,BOOKING_CREATE,BOOKING_ME,BOOKING_STATUS,BOOKING_DELETE booking
    class REQ_GET,REQ_CREATE,REQ_UPDATE request
```

---

##  Logging System Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        APP[NestJS Application]
        CONTROLLERS[Controllers]
        SERVICES[Services]
        GUARDS[Auth Guards]
    end
    
    subgraph "Logging Layer"
        WINSTON[Winston Logger]
        CONSOLE[Console Transport]
        FILE_ERROR[File: error.log]
        FILE_COMBINED[File: combined.log]
    end
    
    subgraph "Log Categories"
        AUTH_LOGS[Authentication Logs]
        BUSINESS_LOGS[Business Operation Logs]
        ERROR_LOGS[Error Logs]
        SYSTEM_LOGS[System Logs]
    end
    
    APP --> WINSTON
    CONTROLLERS --> WINSTON
    SERVICES --> WINSTON
    GUARDS --> WINSTON
    
    WINSTON --> CONSOLE
    WINSTON --> FILE_ERROR
    WINSTON --> FILE_COMBINED
    
    WINSTON --> AUTH_LOGS
    WINSTON --> BUSINESS_LOGS
    WINSTON --> ERROR_LOGS
    WINSTON --> SYSTEM_LOGS
    
    classDef app fill:#e3f2fd
    classDef logging fill:#f3e5f5
    classDef categories fill:#e8f5e8
    
    class APP,CONTROLLERS,SERVICES,GUARDS app
    class WINSTON,CONSOLE,FILE_ERROR,FILE_COMBINED logging
    class AUTH_LOGS,BUSINESS_LOGS,ERROR_LOGS,SYSTEM_LOGS categories
```

---

## Application Module Structure

```mermaid
graph TB
    subgraph "Core Modules"
        APP[AppModule]
        CONFIG[ConfigModule]
        TYPEORM[TypeOrmModule]
        WINSTON[WinstonModule]
    end
    
    subgraph "Feature Modules"
        AUTH[AuthModule]
        USER[UserModule]
        PAINTER[PainterModule]
        CUSTOMER[CustomerModule]
        AVAILABILITY[AvailabilityModule]
        BOOKING[BookingModule]
        BOOKING_REQ[BookingRequestModule]
    end
    
    subgraph "Utility Modules"
        SEEDER[SeederModule]
    end
    
    APP --> CONFIG
    APP --> TYPEORM
    APP --> WINSTON
    APP --> AUTH
    APP --> USER
    APP --> PAINTER
    APP --> CUSTOMER
    APP --> AVAILABILITY
    APP --> BOOKING
    APP --> BOOKING_REQ
    APP --> SEEDER
    
    AUTH --> USER
    PAINTER --> USER
    CUSTOMER --> USER
    BOOKING --> PAINTER
    BOOKING --> CUSTOMER
    BOOKING --> AVAILABILITY
    
    classDef core fill:#e3f2fd
    classDef feature fill:#f3e5f5
    classDef utility fill:#e8f5e8
    
    class APP,CONFIG,TYPEORM,WINSTON core
    class AUTH,USER,PAINTER,CUSTOMER,AVAILABILITY,BOOKING,BOOKING_REQ feature
    class SEEDER utility
```

---

##  User Journey Flow

```mermaid
journey
    title User Journey in Painter Booking System
    
    section Registration
      Visit Website: 5: User
      Register Account: 4: User
      Choose Role: 3: User
      Complete Profile: 4: User
      
    section Painter Journey
      Set Availability: 5: Painter
      View Bookings: 4: Painter
      Accept/Reject: 3: Painter
      Complete Service: 5: Painter
      
    section Customer Journey
      Search Painters: 5: Customer
      View Availability: 4: Customer
      Create Booking: 3: Customer
      Track Booking: 4: Customer
      Receive Service: 5: Customer
      
    section System
      Authentication: 5: System
      Logging: 5: System
      Database: 5: System
      API Response: 4: System
```

---

##  Data Flow Diagram

```mermaid
flowchart LR
    subgraph "Client Side"
        UI[User Interface]
        STATE[Application State]
    end
    
    subgraph "API Layer"
        ROUTES[API Routes]
        MIDDLEWARE[Middleware]
        VALIDATION[Validation]
    end
    
    subgraph "Business Logic"
        SERVICES[Business Services]
        REPOSITORIES[Data Repositories]
    end
    
    subgraph "Data Layer"
        ENTITIES[Database Entities]
        RELATIONS[Entity Relations]
    end
    
    subgraph "External"
        LOGS[Logging System]
        AUTH[JWT Authentication]
    end
    
    UI --> ROUTES
    STATE --> ROUTES
    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> VALIDATION
    VALIDATION --> SERVICES
    SERVICES --> REPOSITORIES
    REPOSITORIES --> ENTITIES
    ENTITIES --> RELATIONS
    
    SERVICES --> LOGS
    MIDDLEWARE --> AUTH
    
    classDef client fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef business fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef external fill:#ffebee
    
    class UI,STATE client
    class ROUTES,MIDDLEWARE,VALIDATION api
    class SERVICES,REPOSITORIES business
    class ENTITIES,RELATIONS data
    class LOGS,AUTH external
```

---

## 🔒 Security & Authorization Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant GUARD as JWT Guard
    participant AUTH as Auth Service
    participant DB as Database
    participant LOG as Logger
    
    C->>API: Request with JWT Token
    API->>GUARD: Validate Token
    GUARD->>LOG: Log auth attempt
    
    alt Valid Token
        GUARD->>AUTH: Extract user from token
        AUTH->>DB: Get user details
        DB-->>AUTH: User data
        AUTH->>LOG: Log successful auth
        AUTH-->>GUARD: User object
        GUARD-->>API: Authorized request
        API-->>C: Protected resource
    else Invalid/Expired Token
        GUARD->>LOG: Log failed auth
        GUARD-->>API: Unauthorized
        API-->>C: 401 Unauthorized
    end
    
    Note over C,LOG: All authentication events are logged with context
```

---

## 📈 System Performance Monitoring

```mermaid
graph TB
    subgraph "Monitoring Layer"
        METRICS[Performance Metrics]
        ALERTS[Alert System]
        DASHBOARD[Monitoring Dashboard]
    end
    
    subgraph "Log Analysis"
        LOG_AGGREGATION[Log Aggregation]
        PATTERN_DETECTION[Pattern Detection]
        ANOMALY_DETECTION[Anomaly Detection]
    end
    
    subgraph "Winston Logs"
        AUTH_LOGS[Authentication Logs]
        BUSINESS_LOGS[Business Logs]
        ERROR_LOGS[Error Logs]
        SYSTEM_LOGS[System Logs]
    end
    
    AUTH_LOGS --> LOG_AGGREGATION
    BUSINESS_LOGS --> LOG_AGGREGATION
    ERROR_LOGS --> LOG_AGGREGATION
    SYSTEM_LOGS --> LOG_AGGREGATION
    
    LOG_AGGREGATION --> PATTERN_DETECTION
    PATTERN_DETECTION --> ANOMALY_DETECTION
    ANOMALY_DETECTION --> ALERTS
    
    METRICS --> DASHBOARD
    ALERTS --> DASHBOARD
    
    classDef monitoring fill:#e3f2fd
    classDef analysis fill:#f3e5f5
    classDef logs fill:#e8f5e8
    
    class METRICS,ALERTS,DASHBOARD monitoring
    class LOG_AGGREGATION,PATTERN_DETECTION,ANOMALY_DETECTION analysis
    class AUTH_LOGS,BUSINESS_LOGS,ERROR_LOGS,SYSTEM_LOGS logs
```

---

## Key Features Highlighted

###  **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Painter/Customer)
- Secure password hashing with bcrypt

### **Booking Management**
- Real-time availability checking
- Conflict detection and prevention
- Status tracking (Pending → Confirmed → Completed)

###  **Structured Logging**
- Winston logger with multiple transports
- Contextual logging with user information
- Error tracking and monitoring

###  **Database Design**
- Normalized entity relationships
- Proper foreign key constraints
- Optimized queries with TypeORM

###  **API Architecture**
- RESTful API design
- Input validation with class-validator
- Comprehensive error handling

---

##  Usage Instructions

1. **Copy the Mermaid code** from any diagram above
2. **Paste into your README.md** or documentation
3. **Use Mermaid Live Editor** (https://mermaid.live) to preview
4. **Customize colors and styling** as needed
5. **Export as SVG/PNG** for presentations

These diagrams provide a comprehensive visual representation of your Painter Booking System architecture, data flow, and key processes! 
