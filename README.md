# Restaurant Reservation & Management System - Backend

A production-ready Node.js backend for a full-featured restaurant management platform with customer reservations, food ordering, and feedback systems.

## 🎯 Project Objectives

### Functional Requirements (Implemented)
- **FR1**: User Authentication (Registration, Login, Profile Management)
- **FR2**: Menu Management (View, Create, Update, Delete)
- **FR3**: Reservation System (Customer Booking)
- **FR4**: Admin Booking Management (Manage All Reservations)
- **FR5**: Feedback System (Customer Reviews & Ratings)
- **FR6**: Order Management (Food Orders & Fulfillment)

### Non-Functional Requirements
- **NFR1**: Performance (Database indexing, lean queries)
- **NFR2**: Scalability (Modular architecture)
- **NFR3**: Security (JWT auth, password hashing)
- **NFR4**: Usability (Clear API responses)

## 🏗️ Architecture

### Architectural Pattern: MVC + Factory Pattern
```
Input (Request)
    ↓
Routes (Routing)
    ↓
Validators (Input Validation)
    ↓
Controllers (Business Logic)
    ↓
Models (Data Layer)
    ↓
Output (Response)
```

### Separation of Concerns
- **Routes**: URL mapping and HTTP method handling
- **Controllers**: Business logic and orchestration
- **Models**: Database schema and validation
- **Validators**: Input validation rules
- **Factories**: Object creation and DTOs
- **Middleware**: Authentication, error handling

## 📁 Project Structure

```
Testing2/
│
├── config/
│   └── db.js                    # MongoDB connection setup
│
├── Controller/
│   ├── authController.js         # Authentication logic
│   ├── menuController.js         # Menu management
│   ├── reservationController.js  # Reservation CRUD
│   ├── feedbackController.js     # Feedback management
│   └── orderController.js        # Order management
│
├── Model/
│   ├── User.js                   # User schema
│   ├── MenuItem.js               # Menu item schema
│   ├── Reservation.js            # Reservation schema
│   ├── Feedback.js               # Feedback schema
│   └── Order.js                  # Order schema
│
├── Routes/
│   ├── authRoutes.js             # Auth endpoints
│   ├── menuRoutes.js             # Menu endpoints
│   ├── reservationRoutes.js      # Reservation endpoints
│   ├── feedbackRoutes.js         # Feedback endpoints
│   ├── orderRoutes.js            # Order endpoints
│   └── adminRoutes.js            # Admin analytics
│
├── middlewares/
│   ├── authMiddleware.js         # JWT verification
│   ├── errorMiddleware.js        # Error handling
│   └── validators/
│       ├── authValidators.js     # Auth validation rules
│       ├── menuValidators.js     # Menu validation rules
│       ├── reservationValidators.js
│       ├── feedbackValidators.js
│       └── orderValidators.js
│
├── utils/
│   ├── dtoFactory.js             # User DTO
│   ├── menuFactory.js            # Menu factory
│   ├── userFactory.js            # User factory
│   ├── reservationFactory.js     # Reservation factory
│   ├── feedbackFactory.js        # Feedback factory
│   └── orderFactory.js           # Order factory
│
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── server.js                     # Application entry point
├── API_DOCUMENTATION.md          # Full API docs
└── README.md                     # This file
```

## 🎨 Design Patterns

### 1. Factory Pattern
**Purpose**: Centralize object creation logic
```javascript
// Example: reservationFactory.js
const createReservation = (...args) => ({ ... })
const makeReservationDTO = (doc) => ({ ... })
```
**Benefits**:
- Consistent object structure
- Centralized validation
- Easy to test and modify
- Separation of construction from logic

### 2. Data Transfer Object (DTO) Pattern
**Purpose**: Secure API responses
```javascript
// Never expose passwords, sensitive data
makeUserDTO(user) → { id, name, email, role }
```
**Benefits**:
- Prevents accidental data leaks
- Consistent API contract
- Easy schema evolution
- Clear input/output boundaries

### 3. Middleware Chain Pattern
**Purpose**: Composable request processing
```javascript
Router.post(endpoint, validator, authMiddleware, controller)
```
**Benefits**:
- Concerns are isolated
- Reusable middleware
- Clear execution flow
- Easy debugging

### 4. Repository Pattern (Implicit)
**Purpose**: Abstract database operations
- Controllers use Models directly
- Models handle all DB queries
- Easy to swap database

## 🔐 Security Implementation

### Authentication (FR1)
- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Secure Storage**: Never store plain passwords
- **Token Validation**: Verified on each protected route

### Authorization
- **Role-Based Access Control**: user vs admin
- **Resource Ownership**: Users only access own data
- **Route Protection**: requireAdmin middleware

### Input Validation
- **express-validator**: All inputs validated
- **Sanitization**: String trimming, lowercase emails
- **Type Checking**: Enum validation for statuses
- **Custom Rules**: Phone number format, date validation

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  timestamps
}
```

### Reservation Model
```javascript
{
  userId: ObjectId (ref: User),
  customerName, Email, Phone: String,
  tableNumber: Number,
  guestCount: Number,
  reservationDate, reservationTime: Date/String,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  specialRequests: String,
  timestamps,
  indexes: [tableNumber + date, status]
}
```

### Order Model
```javascript
{
  userId: ObjectId,
  orderNumber: String (unique),
  tableNumber: Number,
  items: [{
    menuItemId, quantity, price, subtotal, specialInstructions
  }],
  total, tax, discount: Number,
  status, paymentStatus, paymentMethod: String,
  preparedBy, servedBy: ObjectId,
  timestamps,
  indexes: [status + date, paymentStatus]
}
```

### Feedback Model
```javascript
{
  userId: ObjectId,
  customerName, Email: String,
  rating: 1-5,
  category: 'service' | 'food_quality' | 'ambiance' | 'value' | 'cleanliness' | 'overall',
  comment: String,
  isPublic: Boolean,
  status: 'pending' | 'approved' | 'rejected',
  adminResponse: String,
  timestamps,
  indexes: [category + rating, status + date]
}
```

### MenuItem Model
```javascript
{
  name, category: String,
  price: Number,
  timestamps,
  indexes: [name, category]
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- npm or yarn

### Installation

1. **Clone and Install**
```bash
cd Testing2
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Start Server**
```bash
npm start
# Server runs on http://localhost:5000
```

### Environment Variables
```
PORT=5000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/restaurantDB
JWT_SECRET=your_super_secret_key
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
```

## 🧪 API Testing

### Quick Test with cURL

**1. Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'
```

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

**3. Create Reservation** (Use token from login)
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "customerName":"John Doe",
    "customerEmail":"john@test.com",
    "customerPhone":"+1234567890",
    "tableNumber":5,
    "guestCount":4,
    "reservationDate":"2024-12-25",
    "reservationTime":"19:30"
  }'
```

## 📈 Performance Optimization

### Database Indexing
```javascript
// Compound indexes for efficient queries
reservationSchema.index({ tableNumber: 1, reservationDate: 1, status: 1 })
orderSchema.index({ status: 1, createdAt: -1 })
feedbackSchema.index({ category: 1, rating: 1, createdAt: -1 })
```

### Lean Queries
```javascript
// Omit mongoose overhead for read operations
await MenuItem.find().lean()
```

### Query Optimization
- Pagination on list endpoints
- Population only necessary references
- Select specific fields when possible

## 🔄 SOLID Principles Implementation

### Single Responsibility (S)
Each file handles one aspect:
- `authController.js` → Authentication only
- `reservationController.js` → Reservations only

### Open/Closed (O)
Validators are extensible without modification:
```javascript
// Add new validation rule without changing existing code
const newValidator = body('field').custom(...)
```

### Liskov Substitution (L)
All controllers follow same pattern:
- Same error handling
- Same response format
- Same pagination approach

### Interface Segregation (I)
Validators only validate required fields:
```javascript
// Each validator only knows about its own fields
createOrderValidators // validates order fields only
```

### Dependency Inversion (D)
Controllers depend on abstractions (Models), not implementations:
```javascript
// Not creating connections directly
// Using Models which abstract MongoDB
const order = await Order.findById(id)
```

## 📝 Imperative vs Declarative Programming

### Imperative (How to do it)
```javascript
// Controllers: Step-by-step instructions
async function createReservation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors })
  
  const { ...data } = req.body
  const existing = await Reservation.findOne({ ... })
  if (existing) return res.status(409)...
  
  const reservation = await Reservation.create(data)
  res.status(201).json({ reservation })
}
```

### Declarative (What to do)
```javascript
// Validators: Declare rules, framework applies them
const validators = [
  body('email').isEmail(),
  body('phone').isMobilePhone(),
  param('id').isMongoId()
]
// apply via: router.post(endpoint, validators, controller)
```

## 🧩 Frontend Integration Checklist

- [ ] Setup CORS headers (already configured)
- [ ] Implement JWT token storage
- [ ] Add authorization header to requests
- [ ] Handle 401 errors (redirect to login)
- [ ] Display validation errors
- [ ] Implement pagination UI
- [ ] Add loading states
- [ ] Handle network errors
- [ ] Refresh token on expiration
- [ ] Setup environment variables

## 📚 Key Code Examples

### Creating a Reservation (Happy Path)
```javascript
// 1. Client sends data
POST /api/reservations
{
  "customerName": "John",
  "customerEmail": "john@test.com",
  "customerPhone": "+1234567890",
  "tableNumber": 5,
  "guestCount": 4,
  "reservationDate": "2024-12-25",
  "reservationTime": "19:30"
}

// 2. Validators check data
// 3. Controller checks if table available
// 4. Factory creates reservation object
// 5. Saves to database
// 6. Returns DTO (safe response)
```

### Admin Dashboard Analytics (Complex Query)
```javascript
GET /api/admin/dashboard/stats

Response:
{
  "dashboard": {
    "reservations": {"total": 150, "thisMonth": 45},
    "orders": {"total": 500, "completed": 450},
    "revenue": {"total": 12500.50, "currency": "USD"},
    "feedback": {"pending": 5, "averageRating": 4.3},
    "users": 120
  }
}
```

## 🐛 Error Handling

All errors return consistent format:
```json
{
  "message": "User-friendly message",
  "errors": [
    {"field": "email", "message": "Invalid email"}
  ]
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Server Error

## 📋 Testing Scenarios (Happy Path)

### 1. User Registration & Booking
1. Register account
2. View menu
3. Check available tables
4. Create reservation
5. View my reservations
6. Submit feedback

### 2. Admin Operations
1. Login as admin
2. View all reservations
3. Update reservation status
4. View all orders
5. Update order status
6. View analytics dashboard
7. Approve pending feedback

### 3. Order Processing
1. Create order for table
2. Kitchen marks as preparing
3. Mark as ready
4. Server marks as served
5. Update payment
6. Complete order

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] MongoDB Atlas connection
- [ ] CORS origins configured
- [ ] Error logging setup
- [ ] Performance monitoring
- [ ] Database backups
- [ ] SSL/TLS certificates
- [ ] Rate limiting
- [ ] Security headers

## 📞 Support & Maintenance

### Common Issues

**Port Already in Use**
```bash
# Change PORT in .env or kill process
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
mongod
# Verify connection string in .env
```

**JWT Token Errors**
```bash
# Ensure token is in Authorization header
# Format: "Bearer <token>"
# Check JWT_SECRET matches
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Authentication](https://jwt.io)
- [Express-validator](https://express-validator.github.io/docs)

## ✅ Milestone 2 Requirements Met

✅ **Working Beta Code**: All endpoints tested and working
✅ **No Syntax Errors**: Code passes linting
✅ **Happy Path Demonstration**: Full reservation → order → feedback flow
✅ **SOLID Principles**: Demonstrated in architecture
✅ **Separation of Concerns**: Routes, Controllers, Models, Validators
✅ **Clean Code**: Modular, well-documented, followable
✅ **Imperative & Declarative**: Controllers vs Validators
✅ **Design Patterns**: Factory, DTO, Middleware Chain
✅ **Frontend Ready**: Clear API contract, proper responses
✅ **Admin Features**: Comprehensive dashboard & analytics

## 🎓 Learning Outcomes

This project demonstrates:
- RESTful API design principles
- MVC architecture pattern
- Database design and indexing
- Authentication and security
- Error handling and validation
- Modular code organization
- Design patterns (Factory, DTO)
- SOLID principles
- Code documentation
- API documentation standards

---

**Version**: 1.0.0
**Status**: Beta Release Ready
**Last Updated**: January 2025
