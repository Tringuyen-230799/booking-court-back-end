# Booking Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [Booking Flow](#booking-flow)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Anti-Spam Strategy](#anti-spam-strategy)
6. [Implementation Phases](#implementation-phases)
7. [Technical Decisions](#technical-decisions)

---

## Overview

### Feature Description
An authenticated booking system that allows registered users to book courts. Users must sign in to their account before making a booking and completing payment.

### Key Characteristics
- **Authentication Required**: Users must be signed in to book
- **Secure**: User authentication prevents fake bookings and spam
- **Payment-gated**: Bookings confirmed only after payment
- **User History**: Track all bookings per user account

### Business Goals
- Build user relationships through accounts
- Prevent spam through authentication barrier
- Ensure payment before slot confirmation
- Enable personalized features (booking history, favorites, loyalty)
- Maintain high conversion rate (booking → payment)

---

## Booking Flow

### Complete User Journey

```
1. USER AUTHENTICATION
   ↓
   User signs in or creates account
   Receives JWT token
   ↓
   
2. CREATE BOOKING
   ↓
   User fills form: court, time slot, notes
   Backend validates JWT token
   ↓
   Backend creates booking
   Status: PENDING_PAYMENT
   ↓
   
3. PAYMENT
   ↓
   User redirects to payment gateway
   Completes payment
   ↓
   Webhook confirms payment
   Status: CONFIRMED
   ↓
   
4. BOOKING COMPLETE
   ↓
   Confirmation sent to user
   Slot is locked and reserved
   ↓
   
5. AFTER BOOKING TIME
   ↓
   Status: COMPLETED
```

### State Machine

```
States:
- PENDING_VERIFICATION → Initial state after booking creation
- PENDING_PAYMENT → OTP verified, waiting for payment
- CONFIRMED → Payment completed, booking active
- COMPLETED → Booking time has passed
- CANCELLED → User or admin cancelled
- EXPIRED → Timeout (didn't verify/pay in time)

Valid Transitions:
PENDING_VEPAYMENT → Initial state after booking creation, waiting for payment
- CONFIRMED → Payment completed, booking active
- COMPLETED → Booking time has passed
- CANCELLED → User or admin cancelled
- EXPIRED → Timeout (didn't pay in time)

Valid Transitions:
PENDING_PAYMENT → CONFIRMED (payment success)
PENDING_PAYMENT → EXPIRED (timeout)
PENDING_PAYMENT → CANCELLED (user action)

CONFIRMED → COMPLETED (time passed)
CONFIRMED → CANCELLED (user action + refund)

COMPLETED → (terminal state)
CANCELLED → (terminal state)
EXPIRED → (terminal state)
```

### Timeout Rules

| State | Timeout | Action |
|-------|---------|--------|
| PENDING_PAYMENT | 30 minutes | Auto-expire, free slot
model Booking {
  // Identity
  id                String   @id @default(uuid())
  bookingReference  String   @unique // Human-readable: BK20260127001
  User Model (Required)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String    // Hashed
  name          String
  phoneNumber   String?
  
  // Authentication
  isEmailVerified Boolean   @default(false)
  emailVerifiedAt DateTime?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  bookings      Booking[]
  
  @@index([email])
}
```

### Booking Model

```prisma
model Booking {
  // Identity
  id                String   @id @default(uuid())
  bookingReference  String   @unique // Human-readable: BK20260128001
  
  // User Relationship (Required)
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Court & Time Slot
  courtId           String
  court             Court    @relation(fields: [courtId], references: [id], onDelete: Cascade)
  startTime         DateTime
  endTime           DateTime
  duration          Int      // Duration in minutes
  
  // Status Management
  status            BookingStatus @default(PENDING_PAYMENT)
  expiresAt         DateTime      // Auto-cancel if not paid in time
  
  // Payment Information
  totalPrice        Decimal       @db.Decimal(10, 2)
  paymentStatus     PaymentStatus @default(UNPAID)
  paymentMethod     String?       // e.g., "credit_card", "bank_transfer"
  paymentId         String?       // Payment gateway transaction ID
  paidAt            DateTime?
  
  // Additional Details
  playerCount       Int?
  notes             String?       @db.Text
  
  // Timestamps
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  // Indexes for Performance
  @@index([courtId, startTime, endTime])
  @@index([userId, createdAt])
  @@index([status, expiresAt])
  
  // Prevent Double Booking
  @@unique([courtId, startTime, endTime], name: "unique_court_time_slot")
}

enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  COMPLETED
  CANCELLED
  EXPIRED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}
```

### Relationships

```prisma
model Court {
  // ...existing fields...
  bookings      Booking[]  // One-to-many relationship
}

model User {
  Authentication**: Required (JWT Bearer token)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "courtId": "uuid",
  "startTime": "2026-01-28T10:00:00Z",
  "endTime": "2026-01-28T12:00:00Z",
  "playerCount": 4,
  "notes": "Need extra equipment"
}
```

**Response**:
```json
{
  "bookingId": "uuid",
  "bookingReference": "BK20260128001",
  "status": "PENDING_PAYMENT",
  "courtId": "uuid",
  "startTime": "2026-01-28T10:00:00Z",
  "endTime": "2026-01-28T12:00:00Z",
  "totalPrice": 100.00,
  "expiresAt": "2026-01-28T10:30:00Z",
  "message": "Booking created. Please complete payment within 30 minutes."
}
```

**Business Logic**:
1. Validate JWT token and extract userId
2. Validate court exists and is available
3. Check for overlapping CONFIRMED bookings
4. Calculate total price (hourlyPrice × duration)
5. Check user's pending payment limit (max 3 unpaid bookings)
6. Create booking with status PENDING_PAYMENT
7. Set expiry time (30 minutes from now)
8. Lock time slot immediately

**Error Cases**:
- 401: Unauthorized (invalid/missing token)
- 400: Invalid input (validation failed)
- 409: Time slot already booked
- 404: Court not found
- 429: Too many pending bookings (max 3 unpaid)

---

### 2nerate new OTP
5. Update expiry time
6. Send via requested method

---

### 4. Initiate Payment

**Endpoint**: `POST /bookings/:id/payment`

**Request Body**:
```json
{
  "paymentMethod": "credit_card" | "bank_transfer" | "e-wallet"
}
```

**Response**:
```json
{
  "paymentUrl": "https://payment-gateway.com/checkout/token123",
  "paymentId": "pay_12345",
  "amount": 100.00,
  "expiresAt": "2026-01-27T15:30:00Z"
}
```

**Business Logic**:
1. Verify booking status is PENDING_PAYMENT
2. Check booking hasn't expired
3. Create payment session with gateway (Stripe/PayPal/VNPay)
4. Store paymentId in booking
5. Return payment URL for redirect

---

### 5. Payment Webhook (Internal)

**Endpoint**: `POST /webhooks/payment`

**Request Body** (from payment gateway):
```json
{
  "paymentId": "pay_12345",
  "status": "success" | "failed",
  "bookingId": "uuid",
  "amount": 100.00,
  "transactionId": "txn_67890",
  "signature": "webhook_signature"
}
```

**Business Logic**:
1. Verify webhook signature (security)
2. Find booking by paymentId
3. Check idempotency (handle duplicate webhooks)
4. If status = success:
   - Update: status = CONFIRMED, paymentStatus = PAID, paidAt = now
   - Final overlap check (race condition safety)
   - Send confirmation SMS/Email
5.Authentication**: Required (JWT Bearer token)

**Request Body**:
```json
{
  "paymentMethod": "credit_card" | "bank_transfer" | "e-wallet"
}
```

**Response**:
```json
{
  "paymentUrl": "https://payment-gateway.com/checkout/token123",
  "paymentId": "pay_12345",
  "amount": 100.00,
  "expiresAt": "2026-01-28T10:30:00Z"
}
```

**Business Logic**:
1. Validate JWT token and extract userId
2. Verify booking belongs to user
3. Verify booking status is PENDING_PAYMENT
4. Check booking hasn't expired
5. Create payment session with gateway (Stripe/PayPal/VNPay)
6. Store paymentId in booking
7. Return payment URL for redirect

---

### 3oneNumber": "+84901234567",
  "email": "user@example.com",
  "startTime": "2026-01-28T10:00:00Z",
  "endTime": "2026-01-28T12:00:00Z",
  "totalPrice": 100.00,
  "paymentStatus": "PAID",
  "playerCount": 4,
  "notes": "Need extra equipment",
  "createdAt": "2026-01-27T15:00:00Z"
}
```

---

### 7. List User's Bookings

**Endpoint**: `GET /bookings`

**Query Parameters**:
- `phoneNumber`: Required (acts as authentication)
- `status`: Optional filter (e.g., "CONFIRMED", "COMPLETED")
- `page`: Pagination
- `limit`: Items per page

**Response**:
```json
{4. Get Booking Details

**Endpoint**: `GET /bookings/:id`

**Authentication**: Required (JWT Bearer toke
  "page": 1,
  "limit": 10
}
```

---

### 8. Cancel Booking

**Endpoint**: `POST /bookings/:id/cancel`

**Request Body**:
```json
{
  "phoneNumber": "+84901234567",
  "reason": "User requested cancellation"
}
```

**Response**:8001",
  "status": "CONFIRMED",
  "court": {
    "id": "uuid",
    "name": "Court A",
    "address": "123 Main St",
    "hourlyPrice": 50.00
  },
  "user": {
    alidate JWT token and extract userId
2. Verify booking belongs to user
3. Check cancellation policy:
   - >24h before booking: Full refund (100%)
   - 12-24h: Partial refund (50%)
   - <12h: No refund (0%)
4. Update status to CANCELLED
5. Initiate refund if applicable
6 "totalPrice": 100.00,
  "paymentStatus": "PAID",
  "playerCount": 4,
  "notes": "Need extra equipment",
  "createdAt": "2026-01-28T09:00:00Z"
}Authentication as Primary Defense

**Key Advantage**: Requiring user accounts eliminates most spam automatically

**Why Authentication Prevents Spam**:
- Users must provide valid email
- Email verification required (one-time setup)
- Each user linked to bookings (accountability)
- Easy to ban abusive accounts
- Difficult to create mass fake accounts

---

### Additional Protection Layers

#### Layer 1: Rate Limiting (Per User)

**Implementation**: @nestjs/throttler

**Rules**:
```typescript
// User-based
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 per hour per user
POST /bookings

// Prevent multiple pending payments
const pendingCount = await prisma.booking.count({
  where: {
    userId,
    status: 'PENDING_PAYMENT'
  }
});

if (pendingCount >= 3) {
  throw new TooManyRequestsException('Max 3 pending bookings. Please complete or cancel existing bookings.');
}
```

**Effectiveness**: Prevents individual users from abusing the system

---

#### Layer 2: Email Verification Requirement

**Implementation**: Users must verify email before booking

**Logic**:
```typescript
// In create booking endpoint
if (!user.isEmailVerified) {
  throw new ForbiddenException('Please verify your email before booking');
}
```

**Effectiveness**: Ensures real users with valid email addresses

---

#### Layer 3: Account Reputation System (Optional)

**Concept**: Track user behavior and apply restrictions

**Metrics**:
- Cancellation rate
- Failed payment attempts
- Completed bookings
- Account age

**Logic**:
```typescript
const userStats = await calculateUserStats(userId);

if (userStats.cancellationRate > 50 && userStats.totalBookings > 5) {
  // Require deposit for suspicious users
  requireDeposit = true;
}

if (userStats.failedPayments > 3) {
  throw new ForbiddenException('Account restricted. Please contact support.');
}
```

**Effectiveness**: Penalizes abusive behavior over time
const deviceFingerprint = result.visitorId;

// Backend stores in booking
booking.deviceFingerprint = deviceFingerprint;

// Check for suspicious patterns
const recentBookings = await prisma.booking.count({
  where: {
    deviceFingerprint,
    createdAt: { gte: new Date(Date.now() - 3600000) } // Last hour
  }
});

if (recentBookings > 5) {
  booking.suspiciousFlags.push('MULTIPLE_DEVICE_BOOKINGS');
  // Flag for admin review or reject
}
```

**Effectiveness**: Detects sophisticated attacks across IPs

---

### Monitoring & Alerts

**Key Metrics**:
```typescript
// Track in real-time
- bookings_created_total
- bookings_verified_total
- bookings_paid_total
- bookings_expired_total
- captcha_rejections_total
- rate_limit_hits_total
- suspicious_bookings_total

// Conversion rates
- verification_rate = verified / created
- payment_rate = paid / verified
- completion_rate = paid / created

// Spam indicators
- expired_rate = expired / created
- rejection_rate = rejected / attempts
```

**Alerts**:
```
IF bookings_created_total > 10x normal THEN alert("Possible spam attack")
IF expired_rate > 50% THEN alert("High abandonment rate")
IF captcha_rejections > 100/hour THEN alert("Bot attack")
IF verification_rate < 20% THEN alert("OTP delivery issues")
```

---

## Implementation Phases

### Phase 1: Core Booking Flow (Week 1-2)

**Deliverables**:
- [ ] Prisma schema for Booking model
- [ ] Database migration
- [ ] Create booking endpoint (without anti-spam)
- [ ] OTP generation and verification
- [ ] Basic email/SMS service integration
- [ ] Payment gateway integration (sandbox)
- [ ] Webhook handler
- [ ] Status transitions logic

**Testing**:
- Unit tests for BookingService
- E2E tests for happy path
- Manual testing with sandbox payment

---

### Phase 2: Anti-Spam Protection (Week 3)

**Deliverabpaid_total
- bookings_expired_total
- rate_limit_hits_total
- new_users_total

// Conversion rates
- payment_rate = paid / created
- completion_rate = paid / created

// User behavior
- average_bookings_per_user
- cancellation_rate_per_user
- payment_failure_rate
```

**Alerts**:
```
IF bookings_created_total > 10x normal THEN alert("Unusual activity")
IF expired_rate > 50% THEN alert("High abandonment rate")
IF payment_failure_rate > 20% THEN alert("Payment gateway issues")
IF cancellation_rate > 30% THEN alert("Check booking polici

**Testing**:
- Security audit
- Performance testing
- User acceptance testing

---

### Phase 4: User Authentication System (Week 1)

**Deliverables**:
- [ ] Prisma schema for User model
- [ ] User registration endpoint
- [ ] User login endpoint (JWT)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] JWT authentication guards

**Testing**:
- Unit tests for AuthService
- E2E tests for registration/login
- JWT token validation tests

---

### Phase 2: Core Booking Flow (Week 2)

**Deliverables**:
- [ ] Prisma schema for Booking model
- [ ] Database migration
- [ ] Create booking endpoint (authenticated)
- [ ] Payment gateway integration (sandbox)
- [ ] Webhook handler
- [ ] Status transitions logic
- [ ] User rate limiting (max 3 pending bookings)

**Testing**:
- Unit tests for BookingService
- E2E tests for happy path
- Manual testing with sandbox payment
**Mitigation**: Fast OTP delivery (<30 seconds)

---

### Decision 2: OTP Delivery Method

**Options**:
1. SMS onlyUser Features & Polish (Week 3-4)

**Deliverables**:
- [ ] User booking history
- [ ] Booking cancellation with refund logic
- [ ] User profile management
- [ ] Email notifications (booking confirmation, reminders)
- [ ] Automated cleanup cron jobs
- [ ] Account reputation system (optional)

**Testing**:
- Security audit
- Performance testing
- User acceptance testing

---

### Phase 4: Production Ready (Week 4-5)

**Deliverables**:
- [ ] Admin dashboard for user management
- [ ] Error handling improvements
- [ ] API documentation (Swagger)
- [ ] Production environment setup
- [ ] Monitoring & alerts configuration
- [ ] Load testing (1000+ concurrent users)
- Stripe: Easy integration, good docs, international support
- Local gateways: Better UX for Vietnamese users, lower fees
- Support multiple gateways for flexibility

---

### Decision 4: Booking Expiry Times

**Decision**:
- PENDING_VERIFIAuthentication Requirement

**Options**:
1. **Guest Booking**: Users can book without account
2. **Authenticated Booking**: Users must sign in

**Decision**: **Authenticated Booking**

**Reasoning**:
- Natural spam prevention (email verification barrier)
- Better user experience (booking history, easy rebooking)
- Easier to manage refunds and cancellations
- Enables loyalty programs and personalization
- Clearer accountability

**Trade-off**: Slightly higher friction for first-time users, but better long-term

---

### Decision 2: Slot Reservation

**Decision**: **Hard Reservation (PENDING_PAYMENT locks slot)**

**Reasoning**:
- User is authenticated, spam risk is minimal
- Better UX: User's slot is guaranteed after booking
- Simpler logic than soft reservation
- 30-minute payment window balances availabilityositive rate
- < 0.3: Very likely bot → Auto-reject
- 0.3-0.5: Suspicious → Require v2 challenge
- > 0.5: Likely human → Allow

---

### Decision 7: Cleanup Strategy

**Decision**: **Scheduled cron job every 5 minutes**

**Task**:
```typescript
@Cron('*/5 * * * *') // Every 5 minutes
async cleanupExpiredBookings() {
  await prisma.booking.updateMany({
    where: {
      status: { in: ['PENDING_VERIFICATION', 'PENDING_PAYMENT'] },
      expiresAt: { lte: new Date() }
    },
    data: { status: 'EXPIRED' }
  });
}
```

**Reasoning**:
- Frequent cleanup keeps slots available
- Prevents database bloat
- 5-minutePAYMENT: **30 minutes**

**Reasoning**:
- 30 min is enough time to complete payment
- Balances user convenience and slot availability
- Can adjust based on user behavior metrics

---

### Decision 5: Rate Limiting Strategy

**Decision**: **User-based limits**
- Max 10 bookings per user per hour
- Max 3 pending (unpaid) bookings per user at once

**Reasoning**:
- User-based is more accurate than IP-based (authenticated users)
- 3 pending limit prevents slot hoarding
- Can increase limit for trusted/VIP users

---

### Decision 6: Email Verification Requirement

**Decision**: **Required before first booking**

**Reasoning**:
- Ensures valid contact info
- Natural spam barrier
- One-time friction (only affects new users)
- Enables reliable communication890"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis (for rate limiting)
REDIS_URL="redis://localhost:6379"

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

---

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": f'PENDING_PAYMENT'
  "error": {
    "code": "BOOKING_EXPIRED",
    "message": "Your booking has expired. Please create a new booking.",
    "details": {
      "bookingId": "uuid",
      "expiredAt": "2026-01-27T15:10:00Z"
    }
  },
  "statusCode": 409
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| BOOKING_NOT_FOUND | 404 | Booking ID not found |
| SLOT_UNAVAILABLE | 409 | Time slot already booked |
| OTP_EXPIRED | 400 | Verification code expired |
| OTP_INVALID | 400 | Incorrect verification code |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| PAYMAuthentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Booking Timeouts
PAYMENT_TIMEOUT_MINUTES=30

# Rate Limiting
RATE_LIMIT_USER_MAX=10
RATE_LIMIT_USER_TTL_HOURS=1
MAX_PENDING_BOOKINGS_PER_USER=3

# Email (SendGrid for verification & notifications)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Email Verification
EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS=24
EMAIL_VERIFICATION_REQUIRED=true
---

### Integration Tests

**Booking Flow**:
```typescript
describe('Complete Booking Flow', () => {
  it('should create, verify, and pay for booking', async () => {
    // 1. Create booking
    const booking = await request(app)
      .post('/bookings')
      .send({ /* booking data */ });
    
    expect(booking.status).toBe('PENDING_VERIFICATION');
    
    // 2. Verify OTP
    const verified = await request(app)
      .post(`/bookings/${booking.id}/verify`)
      .send({ verificationCode: '123456' });
    
    expect(verified.status).toBe('PENDING_PAYMENT');
    
    // 3. Mock payment webhook
    const confirmed = await request(app)
      .post('/webhooks/payment')
      .send({ /* webhook payload */ });
    
    expect(confirmed.status).toBe('CONFIRMED');
  });
});
```

---

### E2E Tests

**Anti-Spam Protection**:
```typescript
describe('Rate Limiting', () => {
  it('should reject after 5 requests from same IP', async () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await request(app).post('/bookings').send({ /* data */ });
    }
    
    // 6th request should fail
    const response = await request(app)
      .post('/bookings')
      .send({ /* data */ });
    
    expect(response.statusCode).toBe(429);
  });
});
```

---

## Security Considerations

### 1. OTP Security
- Never store OTPs in plain text (always hash)
- Use cryptographically se3 pending bookings', async () => {
    const token = await getAuthToken();
    
    // Create 3 pending bookings
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ /* different time slots */ });
    }
    
    // 4th booking should fail
    const response = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* data */ });
    
    expect(response.statusCode).toBe(429);
    expAuthentication Security
- Hash passwords with bcrypt (cost factor 10+)
- Use JWT with short expiry (7 days)
- Implement refresh tokens
- Require email verification before booking
- Rate limit login attempts (prevent brute force)
- `resetPassword()` - password reset flow

**BookingService**:
- `createBooking()` - success and validation errors
- `checkOverlap()` - detect overlapping bookings
- `calculatePrice()` - price calculation logic
- `expireBookings()` - cleanup logic
- `checkUserPendingLimit()` - max 3 pending bookings ORM handles this)

---sensitive user data
- Mask emails in logs (e.g., t***@example.com)
- Implement data retention policy (delete old bookings)
- GDPR compliance: Allow users to request data deletion

### 4. API Security
- JWT authentication on all booking endpoints
- Rate limiting on all endpoints
- CORS configuration (whitelist frontend domain)
- Input validation (DTO validation with class-validator)
- SQL injection prevention (Prisma ORM handles this)
- Implement guards to verify booking ownershiping
```
register, login, create booking, and pay', async () => {
    // 1. Register user
    const user = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
    
    // 2. Verify email (mock)
    awaituserId, createdAt])           // User booking history
@@index([status, expiresAt])           // Cleanup queries
@@index([userId, status])              // User pending bookings count
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    const token = login.body.accessToken;
    
    // 4. Create booking
    const booking = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ courtId: 'uuid', startTime: '...', endTime: '...' });
    
    expect(booking.body.status).toBe('PENDING_PAYMENT');
    
    // 5. Mock payment webhook
    const confirmed = await request(app)
      .post('/webhooks/payment')
      .send({ /* webhook payload */ });
    
    expect(confirmed.body
    status: true,
    startTime: true,
    endTime: true,
    court: {
      select: { name: true, address: true }
    }
  }
});
```

---

## Deployment Checklist

### Pre-Production
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Security audit completed
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Payment gateway in production mode
- [ ] SMS/Email services configured
- [ ] CAPTCHA keys configured
- [ ] Monitoring & alerts set up
- [ ] Error tracking (Sentry/Rollbar) configured
- [ ] Database backups automated

### Production Launch
- [ ] Environment variables set
- [ ] HTTPS configured
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled
- [ ] Cron jobs scheduled
- [ ] Webhook endpoints registered with payment gateway
- [ ] DNS configured
- [ ] Load balancer configured (if applicable)

### Post-Launch
- [ ] Monitor error rates
- [ ] Monitor booking conversion rates
- [ ] Monitor spam indicators
- [ ] Set up on-call rotation
- [ ] Document runbooks for common issues

---

## Maintenance & Operations

### Daily Tasks
- Check error logs for anomalies
- Monitor booking conversion rates
- Review suspicious bookings flagged by system

### Weekly Tasks
- Review spam metrics
- Analyze user feedback
- Check rate limit effectiveness
- Review payment processing reports

### Monthly Tasks
- Database cleanup (delete old EXPIRED/CANCELLED bookings)
- Review and adjust CAPTCHA threshold
- Analyze peak booking times
- Update documentation

---

## Future Enhancements

### Phase 5+
- [ ] User accounts (optional, for repeat customers)
- [ ] Loyalty program (discounts for frequent bookers)
- [ ] Recurring bookings (weekly court rentals)
- [ ] Calendar integration (iCal, Google Calendar)
- [ ] Push notifications
- [ ] In-app messaging (contact court owner)
- [ ] Dynamic pricing (peak hours, holidays)
- [ ] Group bookings (book multiple courts at once)
- [ ] Waitlist (notify when slot becomes available)
- [ ] Review system (rate courts after booking)

---

## Support & Troubleshooting

### Common Issues

**Issue 1: OTP not received**
- Check SMS/email service status
- Verify phUser can't login**
- Check if email is verified
- Verify password is correct
- Check if account is blocked
- Offer password resett confirmed**
- Check webhook delivery
- Verify webhook signature
- Check payment gateway dashboard
- Manually confirm if needed

**Issue 3: Booking expired unexpectedly**
- Check expiry times configuration
- Verify cron job is running
- Check if user took too long

**Issue 4: Rate limit blocking legitimate users**
- Review rate limit rules
- WhitelistUser has too many pending bookings**
- Check if user has 3+ unpaid bookings
- Remind user to complete or cancel existing bookings
- Offer quick payment link

## Contact & Resources

### Development Team
- Backend Lead: [Name]
- Frontend Lead: [Name]
- DevOps: [Name]

### External Services
- Payment Gateway: Stripe Support
- SMS Provider: Twilio Support
- Email Provider: SendGrid Support
- Email Provider: SendGrid
- Prisma Docs: https://www.prisma.io/docs
- NestJS Docs: https://docs.nestjs.com
- Stripe API: https://stripe.com/docs
- reCAPTCHA: https://developers.google.com/recaptcha

---

## Changelog

### v1.0.0 (2026-01-27)
- Initial documentation created
- Core booking flow defined
- Anti-spam strategy designed
- Imp2.0.0 (2026-01-28)
- **BREAKING CHANGE**: Switched from guest booking to authenticated booking
- Removed OTP verification flow
- Added User model and authentication system
- Simplified booking flow (2 steps instead of 4)
- Updated anti-spam strategy to leverage authentication
- Updated all API endpoints to require JWT authentication

### v1.0.0 (2026-01-27)
- Initial documentation created (guest booking approach)