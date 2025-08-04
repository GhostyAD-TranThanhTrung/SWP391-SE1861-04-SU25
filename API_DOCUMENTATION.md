# SWP391 Drug Prevention Platform - Complete API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [Dashboard Routes](#dashboard-routes)
   - [Profile Routes](#profile-routes)
   - [User Management Routes](#user-management-routes)
   - [Consultant & Booking Routes](#consultant--booking-routes)
   - [Assessment Routes](#assessment-routes)
   - [Assessment Question Routes](#assessment-question-routes)
   - [Answer Routes](#answer-routes)
   - [Program Routes](#program-routes)
   - [Content Routes](#content-routes)
   - [Category Routes](#category-routes)
   - [Blog Routes](#blog-routes)
   - [Flag Routes](#flag-routes)
   - [Enrollment Routes](#enrollment-routes)
   - [Survey Routes](#survey-routes)
   - [Survey Response Routes](#survey-response-routes)

---

## Overview

The SWP391 Drug Prevention Platform API is a RESTful API built with Express.js and TypeORM, designed to support a comprehensive drug prevention and counseling platform. The API provides endpoints for user management, assessments, consultations, educational programs, blogging, and more.

**Base URL:** `http://localhost:3000`

**API Documentation (Swagger):** `http://localhost:3000/api-docs`

### Key Features
- JWT-based authentication
- Role-based access control (Admin, Staff, Consultant, Member)
- Google OAuth integration
- File upload support
- Comprehensive assessment system
- Booking and consultation management
- Educational content management
- Blog and community features
- Survey and analytics system

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### JWT Token Structure
```
Authorization: Bearer <jwt_token>
```

### Token Payload
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "member",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### User Roles
- **admin**: Full system access
- **staff**: Administrative functions
- **manager**: Management functions
- **consultant**: Consultation services
- **member**: Regular user access

### Development Bypass
For development and testing, you can bypass authentication by adding:
```
x-swagger-bypass: true
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "message": "Success message",
  "count": <number_of_items> // For array responses
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Error Handling

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Messages
- `"Email và mật khẩu là bắt buộc"` - Email and password required
- `"Thông tin đăng nhập không chính xác"` - Invalid credentials
- `"Tài khoản không hoạt động"` - Account inactive
- `"Không có quyền truy cập"` - Access denied

---

## API Endpoints

## Authentication Routes

### 1. User Login
**POST** `/api/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "member",
    "img_link": "profile.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `403`: Account inactive/banned

---

### 2. User Registration
**POST** `/api/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "member" // Optional, defaults to "member"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 124,
    "email": "newuser@example.com",
    "role": "member",
    "status": "active"
  },
  "message": "User registered successfully"
}
```

---

### 3. Google OAuth Login
**POST** `/api/google-login`

Authenticate user with Google OAuth token.

**Request Body:**
```json
{
  "googleToken": "ya29.a0ARrdaM9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 125,
    "email": "user@gmail.com",
    "role": "member"
  },
  "message": "Google login successful"
}
```

---

### 4. Google OAuth Registration
**POST** `/api/google-register`

Register new user with Google OAuth.

**Request Body:**
```json
{
  "googleToken": "ya29.a0ARrdaM9...",
  "role": "member" // Optional
}
```

---

### 5. Reset Password
**PUT** `/api/reset-password`

Reset user password (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

---

## Dashboard Routes

### 1. Basic Dashboard Statistics
**GET** `/api/dashboard`

Get overview statistics for admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalPrograms": 25,
    "totalEnrollments": 300
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

---

### 2. Detailed Dashboard Data
**GET** `/api/dashboard/detailed`

Get comprehensive dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 140,
      "banned": 2,
      "new_this_month": 25
    },
    "programs": {
      "total": 25,
      "by_category": {
        "Youth Prevention": 8,
        "Adult Recovery": 7
      }
    },
    "enrollments": {
      "total": 300,
      "completed": 120,
      "in_progress": 180
    },
    "charts": {
      "user_growth": [],
      "enrollment_trends": []
    }
  }
}
```

---

## Profile Routes

### 1. Create/Update Profile
**POST** `/api/profile`

Create or update user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio_json": {
    "interests": ["music", "sports"],
    "skills": ["communication"]
  },
  "date_of_birth": "1990-01-15",
  "job": "Teacher"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "name": "John Doe",
    "bio_json": {...},
    "date_of_birth": "1990-01-15",
    "job": "Teacher"
  },
  "message": "Profile created/updated successfully"
}
```

---

### 2. Get User Profile
**GET** `/api/profile`

Retrieve profile information for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 123,
      "email": "user@example.com",
      "role": "member",
      "status": "active"
    },
    "profile": {
      "name": "John Doe",
      "bio_json": {...},
      "date_of_birth": "1990-01-15",
      "job": "Teacher"
    }
  },
  "message": "Profile retrieved successfully"
}
```

---

### 3. Check Profile Status
**GET** `/api/profile/status`

Check if user has completed their profile setup.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "hasProfile": true,
  "profileComplete": true,
  "message": "Profile status checked successfully"
}
```

---

## Combined User+Profile Routes

### 1. Get Combined User and Profile Data
**GET** `/api/user/profile-combined`

Retrieve complete user and profile information using JWT token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": 123,
      "email": "user@example.com",
      "role": "member",
      "status": "active",
      "img_link": "profile.jpg",
      "date_create": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "user_id": 123,
      "name": "John Doe",
      "bio_json": {...},
      "date_of_birth": "1990-01-15",
      "job": "Teacher"
    },
    "hasProfile": true
  },
  "message": "Combined user and profile data retrieved successfully"
}
```

---

### 2. Update Combined User and Profile Data
**PUT** `/api/user/profile-combined`

Update both user and profile information in a single transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "role": "member",
  "status": "active",
  "img_link": "newprofile.jpg",
  "name": "John Smith",
  "bio_json": "{\"skills\": [\"JavaScript\", \"React\"]}",
  "date_of_birth": "1990-01-15",
  "job": "Software Developer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "profile": {...},
    "hasProfile": true
  },
  "message": "User and profile updated successfully"
}
```

---

### 3. Delete User Account
**DELETE** `/api/user/delete-account`

Deactivate user account (soft delete - sets status to 'inactive').

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "deactivatedData": {
    "user": {...},
    "profile": {...},
    "softDeleted": true
  }
}
```

---

## User Management Routes

### Staff Management (Admin Only)

#### 1. Get All Staff
**GET** `/api/staff`

Retrieve list of all staff members.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 45,
      "email": "staff@example.com",
      "role": "staff",
      "status": "active",
      "profile": {
        "name": "Staff Member",
        "job": "Counselor"
      }
    }
  ],
  "count": 1,
  "message": "Staff members retrieved successfully"
}
```

#### 2. Search Staff by Name
**GET** `/api/staff/:staffName`

Find staff members by name.

**Path Parameters:**
- `staffName` (string): Name to search for

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Staff search completed successfully"
}
```

#### 3. Get Staff Details
**GET** `/api/staff/details/:staffId`

Retrieve comprehensive staff information.

**Path Parameters:**
- `staffId` (number): Staff member ID

**Response:**
```json
{
  "success": true,
  "data": {
    "staff_info": {...},
    "blogs": [...],
    "programs": [...],
    "statistics": {
      "total_blogs": 15,
      "total_programs": 5
    }
  },
  "message": "Staff details retrieved successfully"
}
```

#### 4. Create Staff Member
**POST** `/api/staff`

Add new staff member to the system.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newstaff@example.com",
  "password": "password123",
  "name": "New Staff Member",
  "role": "staff",
  "specialization": "Drug Counseling"
}
```

#### 5. Update Staff Member
**PUT** `/api/staff/:staffId`

Modify existing staff member details.

**Path Parameters:**
- `staffId` (number): Staff member ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "manager",
  "status": "active"
}
```

#### 6. Delete Staff Member
**DELETE** `/api/staff/:staffId`

Remove staff member from the system.

**Path Parameters:**
- `staffId` (number): Staff member ID

---

### Member Management (Admin/Staff)

#### 1. Get All Members
**GET** `/api/members`

Retrieve list of all registered members.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 123,
      "email": "member@example.com",
      "role": "member",
      "status": "active",
      "profile": {
        "name": "John Doe",
        "date_of_birth": "1990-01-15"
      }
    }
  ],
  "count": 1,
  "message": "Members retrieved successfully"
}
```

#### 2. Search Members by Name
**GET** `/api/members/search/:memberName`

Find members by name.

**Path Parameters:**
- `memberName` (string): Name to search for

#### 3. Get Member Details
**GET** `/api/members/:memberId`

Retrieve detailed information about a specific member.

**Path Parameters:**
- `memberId` (number): Member ID

#### 4. Get Full Member Details
**GET** `/api/members/detailed/:memberId`

Retrieve detailed member information including assessments.

**Path Parameters:**
- `memberId` (number): Member ID

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "profile": {...},
    "assessments": [...],
    "enrollments": [...],
    "booking_sessions": [...]
  },
  "message": "Full member details retrieved successfully"
}
```

#### 5. Update Member
**PUT** `/api/members/:memberId`

Update member account information.

**Path Parameters:**
- `memberId` (number): Member ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "status": "active",
  "date_of_birth": "1990-01-15",
  "bio_json": {...},
  "password": "newpassword123"
}
```

#### 6. Delete Member
**DELETE** `/api/members/:memberId`

Delete member account from the system.

**Path Parameters:**
- `memberId` (number): Member ID

---

## Consultant & Booking Routes

### Consultant Management

#### 1. Get All Consultants
**GET** `/api/consultants`

Retrieve list of all consultants (public directory).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_consultant": 1,
      "user_id": 45,
      "google_meet_link": "https://meet.google.com/abc-def-ghi",
      "certification": "Licensed Clinical Social Worker",
      "speciality": "Addiction Counseling",
      "user": {
        "email": "consultant@example.com",
        "role": "consultant"
      },
      "profile": {
        "name": "Dr. Jane Smith",
        "bio_json": {...}
      }
    }
  ],
  "count": 1,
  "message": "Consultants retrieved successfully"
}
```

#### 2. Search Consultants
**GET** `/api/consultants/search/:consultantName`

Find consultants by name.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `consultantName` (string): Name to search for

#### 3. Get Consultant Details
**GET** `/api/consultants/:consultantId`

Retrieve detailed consultant information.

**Path Parameters:**
- `consultantId` (number): Consultant ID

#### 4. Create Consultant
**POST** `/api/consultants`

Create new consultant profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 45,
  "google_meet_link": "https://meet.google.com/abc-def-ghi",
  "certification": "Licensed Clinical Social Worker",
  "speciality": "Addiction Counseling"
}
```

#### 5. Update Consultant
**PUT** `/api/consultants/:consultantId`

Modify consultant profile details.

**Path Parameters:**
- `consultantId` (number): Consultant ID

**Request Body:**
```json
{
  "google_meet_link": "https://meet.google.com/new-link",
  "certification": "Updated Certification",
  "speciality": "Updated Speciality"
}
```

#### 6. Delete Consultant
**DELETE** `/api/consultants/:consultantId`

Remove consultant from the system.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `consultantId` (number): Consultant ID

#### 7. Get My Consultant ID
**GET** `/api/consultants/my-id`

Get consultant ID for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consultant_id": 1,
    "user_id": 45
  },
  "message": "Consultant ID retrieved successfully"
}
```

#### 8. Get Consultant ID by Email
**GET** `/api/consultants/email/:email`

Get consultant ID from user email address.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `email` (string): User's email address

---

### Consultant Complete Management

#### 1. Get All Consultants with Complete Data
**GET** `/api/consultants-complete`

Retrieve all consultants with complete profile and availability data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConsultants": 5,
    "consultants": [
      {
        "consultant": {...},
        "user": {...},
        "profile": {...},
        "availability_slots": [...]
      }
    ]
  },
  "message": "Complete consultants data retrieved successfully"
}
```

#### 2. Get Consultant Complete Details
**GET** `/api/consultants-complete/:consultantId`

Retrieve detailed consultant information with all related data.

**Path Parameters:**
- `consultantId` (number): Consultant ID

#### 3. Create Complete Consultant
**POST** `/api/consultants-complete`

Create consultant with all related data.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "consultant",
  "password": "password123",
  "email": "consultant@example.com",
  "google_meet_link": "https://meet.google.com/abc-def-ghi",
  "certification": "Licensed Clinical Social Worker",
  "speciality": "Addiction Counseling",
  "name": "Dr. Jane Smith",
  "bio_json": {...},
  "date_of_birth": "1980-05-15",
  "job": "Clinical Consultant",
  "availability_slots": [
    {
      "day_of_week": "Monday",
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ]
}
```

#### 4. Update Complete Consultant
**PUT** `/api/consultants-complete/:id`

Update consultant with all related data.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Consultant ID

#### 5. Delete Complete Consultant
**DELETE** `/api/consultants-complete/:consultantId`

Remove consultant and all associated data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `consultantId` (number): Consultant ID

#### 6. Get Consultant Availability by Day
**GET** `/api/consultants-complete/:consultantId/availability/:dayOfWeek`

Retrieve availability slots for a consultant on a specific day.

**Path Parameters:**
- `consultantId` (number): Consultant ID
- `dayOfWeek` (string): Day of the week (e.g., "Monday")

**Response:**
```json
{
  "success": true,
  "data": {
    "consultant_id": 1,
    "day_of_week": "Monday",
    "availability_slots": [
      {
        "slot_id": 1,
        "start_time": "09:00",
        "end_time": "10:00"
      }
    ]
  },
  "message": "Consultant availability retrieved successfully"
}
```

---

### Consultant Scheduling

#### 1. Get Consultant Slots
**GET** `/api/consultant-slots/:consultantId`

Retrieve available time slots for a specific consultant.

**Path Parameters:**
- `consultantId` (number): Consultant ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "consultant_id": 1,
      "slot_id": 1,
      "day_of_week": "Monday",
      "start_time": "09:00",
      "end_time": "10:00"
    }
  ],
  "message": "Consultant slots retrieved successfully"
}
```

#### 2. Update Consultant Slots
**PUT** `/api/consultant-slots`

Update consultant availability slots.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultant_id": 1,
  "daysofweek": ["Monday", "Tuesday"],
  "slot": [1, 2, 3]
}
```

#### 3. Delete Consultant Slots
**DELETE** `/api/consultant-slots/consultant/:consultantId`

Delete all slots for a consultant.

**Path Parameters:**
- `consultantId` (number): Consultant ID

#### 4. Create Consultant Slots
**POST** `/api/consultant-slots/consultant/:consultantId`

Create new slots for a consultant.

**Path Parameters:**
- `consultantId` (number): Consultant ID

---

### Slot Management

#### 1. Get All Slots
**GET** `/api/slots`

Retrieve all available time slots in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slot_id": 1,
      "start_time": "09:00",
      "end_time": "10:00"
    },
    {
      "slot_id": 2,
      "start_time": "10:00",
      "end_time": "11:00"
    }
  ],
  "message": "All slots retrieved successfully"
}
```

---

### Booking Session Management

#### 1. Get Scheduled Booking Sessions
**GET** `/api/booking-sessions/scheduled`

Retrieve all scheduled booking sessions for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 1,
      "consultant_id": 1,
      "member_id": 123,
      "slot_id": 1,
      "google_meet_link": "https://meet.google.com/abc-def-ghi",
      "booking_date": "2024-01-15",
      "status": "scheduled",
      "notes": "Initial consultation"
    }
  ],
  "count": 1,
  "message": "Scheduled booking sessions retrieved successfully"
}
```

#### 2. Get My Booking Sessions
**GET** `/api/booking-sessions/member`

Retrieve all booking sessions for authenticated member.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### 3. Get Member Booking Sessions (Admin)
**GET** `/api/booking-sessions/member/:memberId`

Retrieve all booking sessions for specific member (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `memberId` (number): Member ID

#### 4. Create Booking Session
**POST** `/api/booking-sessions`

Book a consultation session with a consultant.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultant_id": 1,
  "slot_id": 1,
  "booking_date": "2024-01-15",
  "notes": "Initial consultation for anxiety issues"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": 15,
    "consultant_id": 1,
    "member_id": 123,
    "slot_id": 1,
    "booking_date": "2024-01-15",
    "status": "scheduled",
    "notes": "Initial consultation for anxiety issues",
    "google_meet_link": null
  },
  "message": "Booking session created successfully"
}
```

#### 5. Get Consultant's Bookings
**GET** `/api/booking-sessions/consultant/:consultantId`

Retrieve all booking sessions for a consultant with detailed information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `consultantId` (number): Consultant ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 1,
      "consultant_id": 1,
      "member_id": 123,
      "slot_id": 1,
      "booking_date": "2024-01-15",
      "status": "scheduled",
      "notes": "Initial consultation",
      "member_profile": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "slot_details": {
        "start_time": "09:00",
        "end_time": "10:00"
      }
    }
  ],
  "count": 1,
  "message": "Consultant bookings retrieved successfully"
}
```

#### 6. Update Booking Session
**PUT** `/api/booking-sessions/:bookingId`

Update booking session details.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `bookingId` (number): Booking session ID

**Request Body:**
```json
{
  "consultant_id": 1,
  "slot_id": 2,
  "booking_date": "2024-01-16",
  "status": "confirmed",
  "notes": "Updated consultation notes",
  "google_meet_link": "https://meet.google.com/new-link"
}
```

#### 7. Update Booking Status and Link
**PUT** `/api/booking-sessions/:bookingId/status-link`

Update booking session status and Google Meet link.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `bookingId` (number): Booking session ID

**Request Body:**
```json
{
  "status": "confirmed",
  "google_meet_link": "https://meet.google.com/abc-def-ghi"
}
```

#### 8. Delete Booking Session
**DELETE** `/api/booking-sessions/:id`

Delete a booking session.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Booking session ID

---

## Assessment Routes

### 1. Get All Assessments
**GET** `/api/assessments`

Retrieve all assessments in the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assessment_id": 1,
      "user_id": 123,
      "type": "ASSIST",
      "result_json": {
        "score": 15,
        "risk_level": "moderate",
        "responses": [...]
      },
      "create_at": "2024-01-15T10:30:00.000Z",
      "action_id": 2
    }
  ],
  "message": "Assessments retrieved successfully"
}
```

#### 2. Get My Assessments
**GET** `/api/assessments/me`

Retrieve all assessments taken by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assessment_id": 1,
      "user_id": 123,
      "type": "ASSIST",
      "result_json": {...},
      "create_at": "2024-01-15T10:30:00.000Z",
      "action": {
        "action_id": 2,
        "description": "Consider seeking professional help",
        "range": "moderate",
        "type": "recommendation"
      }
    }
  ],
  "count": 1,
  "message": "User assessments retrieved successfully"
}
```

#### 3. Get Assessment Details
**GET** `/api/assessments/details/:userId`

Retrieve detailed assessment results for a specific user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID

#### 4. Get Assessments by Type
**GET** `/api/assessments/type/:type`

Filter assessments by type (ASSIST, CRAFFT, etc.).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `type` (string): Assessment type

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "message": "Assessments of type 'ASSIST' retrieved successfully"
}
```

#### 5. Take Assessment Test
**POST** `/api/assessments/take-test`

Submit assessment test responses and get results with recommendations.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "ASSIST",
  "responses": [
    {
      "question": "How often do you use alcohol?",
      "answer": "Weekly"
    },
    {
      "question": "How often do you use tobacco?",
      "answer": "Never"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "assessment_id": 15,
      "type": "ASSIST",
      "score": 12,
      "risk_level": "moderate",
      "result_json": {...}
    },
    "action": {
      "action_id": 2,
      "description": "Consider seeking professional help",
      "range": "moderate",
      "type": "recommendation"
    }
  },
  "message": "Assessment completed successfully"
}
```

#### 6. Delete Assessment
**DELETE** `/api/assessments/:id`

Delete assessment record from the system.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Assessment ID

---

## Assessment Question Routes

The Assessment Question API handles questions for various assessment types (ASSIST, CRAFFT, etc.) along with their answer options.

### 1. Get Questions by Assessment Type
**GET** `/api/assessment-questions/type/:assessment_type`

Main feature - fetch questions and answers by assessment type.

**Path Parameters:**
- `assessment_type` (string): Type of assessment (e.g., "ASSIST", "CRAFFT")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assessment_question_id": 1,
      "question": "How often do you use alcohol?",
      "type": "multiple_choice",
      "assessment_type": "ASSIST",
      "note": "Select the most accurate option",
      "multiSelect": false,
      "allowMultiple": false,
      "category": "substance_use",
      "substance": "alcohol",
      "letter": "a",
      "options": [
        {
          "answer_id": 1,
          "option_id": 0,
          "text": "Never",
          "score": 0,
          "answer_order": 1
        },
        {
          "answer_id": 2,
          "option_id": 1,
          "text": "Once or twice",
          "score": 2,
          "answer_order": 2
        }
      ]
    }
  ],
  "count": 1,
  "assessment_type": "ASSIST",
  "message": "Assessment questions for type 'ASSIST' retrieved successfully"
}
```

### 2. Get All Questions with Options
**GET** `/api/assessment-questions`

Get all assessment questions with their answer options.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 50,
  "message": "Assessment questions with options retrieved successfully"
}
```

### 3. Get Questions by Question Type
**GET** `/api/assessment-questions/question-type/:type`

Get questions by their question type.

**Path Parameters:**
- `type` (string): Question type (e.g., "multiple_choice", "yes_no")

### 4. Get Questions with Filters
**GET** `/api/assessment-questions/filters`

Get questions with multiple filter criteria.

**Query Parameters:**
- `assessment_type` (string): Assessment type
- `type` (string): Question type
- `category` (string): Question category
- `substance` (string): Substance type

### 5. Get Single Question
**GET** `/api/assessment-questions/:id`

Get specific question with its answers.

**Path Parameters:**
- `id` (number): Question ID

### 6. Get Assessment Types
**GET** `/api/assessment-questions/types`

Get all unique assessment types.

**Response:**
```json
{
  "success": true,
  "data": ["ASSIST", "CRAFFT", "CAGE"],
  "count": 3,
  "message": "Assessment types retrieved successfully"
}
```

### 7. Get Question Types
**GET** `/api/assessment-questions/question-types`

Get all unique question types.

### 8. Get Question Count by Type
**GET** `/api/assessment-questions/count-by-type`

Get question counts grouped by assessment type.

### 9. Create Question with Options
**POST** `/api/assessment-questions`

Create new assessment question with multiple choice answers (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "question": "How often do you use marijuana?",
  "type": "multiple_choice",
  "assessment_type": "ASSIST",
  "note": "Select the most accurate option",
  "multiSelect": false,
  "allowMultiple": false,
  "category": "substance_use",
  "substance": "marijuana",
  "letter": "b",
  "answers": [
    {
      "option_id": 0,
      "text": "Never",
      "score": 0,
      "answer_order": 1
    },
    {
      "option_id": 1,
      "text": "Once or twice",
      "score": 2,
      "answer_order": 2
    }
  ]
}
```

### 10. Update Question with Options
**PUT** `/api/assessment-questions/:id`

Update existing assessment question and its answers (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Question ID

### 11. Delete Question
**DELETE** `/api/assessment-questions/:id`

Delete assessment question and all related answers (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Question ID

**Response:**
```json
{
  "success": true,
  "message": "Assessment question deleted successfully",
  "data": {
    "deleted_question_id": 1,
    "deleted_answers_count": 4
  }
}
```

---

## Answer Routes

The Answer API manages answer options for assessment questions.

### 1. Get All Answers
**GET** `/api/answers`

Get all answers with their related questions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "answer_id": 1,
      "assessment_question_id": 1,
      "option_id": 0,
      "text": "Never",
      "score": 0,
      "answer_order": 1,
      "question": {
        "assessment_question_id": 1,
        "question": "How often do you use alcohol?",
        "assessment_type": "ASSIST"
      }
    }
  ],
  "count": 1,
  "message": "All answers retrieved successfully"
}
```

### 2. Get Answer by ID
**GET** `/api/answers/:id`

Get specific answer with question details.

**Path Parameters:**
- `id` (number): Answer ID

### 3. Get Answers by Question ID
**GET** `/api/answers/question/:questionId`

Get all answers for a specific assessment question.

**Path Parameters:**
- `questionId` (number): Assessment question ID

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 4,
  "assessment_question_id": 1,
  "message": "Answers for question ID 1 retrieved successfully"
}
```

### 4. Create Answer
**POST** `/api/answers`

Create a new answer for an assessment question (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assessment_question_id": 1,
  "option_id": 3,
  "text": "Daily",
  "score": 4,
  "answer_order": 5
}
```

### 5. Bulk Create Answers
**POST** `/api/answers/bulk`

Create multiple answers for an assessment question at once (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assessment_question_id": 1,
  "answers": [
    {
      "option_id": 0,
      "text": "Never",
      "score": 0,
      "answer_order": 1
    },
    {
      "option_id": 1,
      "text": "Once or twice",
      "score": 2,
      "answer_order": 2
    }
  ]
}
```

### 6. Update Answer
**PUT** `/api/answers/:id`

Update existing answer details (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Answer ID

**Request Body:**
```json
{
  "text": "Updated answer text",
  "score": 3,
  "answer_order": 2
}
```

### 7. Delete Answer
**DELETE** `/api/answers/:id`

Delete answer by its primary key (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Answer ID

**Response:**
```json
{
  "success": true,
  "message": "Answer deleted successfully",
  "data": {
    "deleted_answer_id": 1,
    "deleted_from_question": 1
  }
}
```

---

## Action Management Routes

### 1. Get All Actions
**GET** `/api/actions`

Retrieve all actions for administrative purposes and chart display.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "action_id": 1,
      "range": "low",
      "description": "Your risk level is low. Continue your current healthy choices.",
      "type": "recommendation"
    },
    {
      "action_id": 2,
      "range": "moderate",
      "description": "Consider seeking professional help",
      "type": "intervention"
    }
  ],
  "message": "All actions retrieved successfully"
}
```

### 2. Get Action by ID
**GET** `/api/actions/:id`

Get detailed information about a specific action.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Action ID

### 3. Get Actions by Type
**GET** `/api/actions/type/:type`

Get actions filtered by type.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `type` (string): Action type

### 4. Get Actions with Assessments
**GET** `/api/actions/with-assessments`

Get actions including their related assessment data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 5. Create Action
**POST** `/api/actions`

Create a new action in the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "range": "high",
  "description": "Immediate professional intervention recommended",
  "type": "urgent_intervention"
}
```

### 6. Update Action
**PUT** `/api/actions/:id`

Update an existing action (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Action ID

### 7. Delete Action
**DELETE** `/api/actions/:id`

Remove an action from the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Action ID

---

## Program Routes

### 1. Get All Programs
**GET** `/api/programs`

List all programs with basic information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "program_id": 1,
      "title": "Youth Drug Prevention Program",
      "description": "Comprehensive prevention program for teenagers",
      "type": "prevention",
      "status": "active",
      "create_at": "2024-01-01T00:00:00.000Z",
      "category": {
        "category_id": 1,
        "name": "Youth Prevention"
      },
      "creator": {
        "user_id": 45,
        "email": "staff@example.com"
      },
      "enrollments": [...],
      "contents": [...]
    }
  ],
  "count": 1,
  "message": "Programs retrieved successfully"
}
```

### 2. Get Programs with Category Details
**GET** `/api/programs/category-details`

Get all programs organized by category with detailed statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "programsByCategory": {
      "Youth Prevention": {
        "category_id": 1,
        "category_name": "Youth Prevention",
        "category_description": "Programs focused on preventing drug use among youth",
        "programs": [...],
        "statistics": {
          "total_programs": 8,
          "active_programs": 7,
          "total_enrollments": 150,
          "total_contents": 45,
          "total_surveys": 16
        }
      }
    },
    "overallStatistics": {
      "total_programs": 25,
      "total_categories": 5,
      "total_enrollments": 500
    }
  },
  "message": "Programs with category details retrieved successfully"
}
```

### 3. Get Community Event Programs
**GET** `/api/programs/community-events`

Get Community Event programs only.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "message": "Community event programs retrieved successfully"
}
```

### 4. Get Program by ID
**GET** `/api/programs/:id`

Get detailed information about a specific program.

**Path Parameters:**
- `id` (number): Program ID

### 5. Get Programs by Category
**GET** `/api/programs/category/:categoryId`

Get programs filtered by category.

**Path Parameters:**
- `categoryId` (number): Category ID

### 6. Get User Programs with Enrollment Status
**GET** `/api/programs/my-enrollment-status`

Get programs with current user's enrollment status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "program_id": 1,
      "title": "Youth Drug Prevention Program",
      "description": "...",
      "enrollment_status": {
        "isEnrolled": true,
        "enrollment_date": "2024-01-10T00:00:00.000Z",
        "progress": 65.5,
        "status": "in_progress"
      }
    }
  ],
  "message": "Programs with enrollment status retrieved successfully"
}
```

### 7. Get User Programs with Enrollment Status (Admin)
**GET** `/api/programs/user/:userId/enrollment-status`

Get programs with specific user's enrollment status (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID

### 8. Get Program Recommendations
**GET** `/api/programs/recommendations`

Get program recommendations based on user's age.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 9. Get Program Survey Analytics
**GET** `/api/programs/:programId/survey-analytics`

Get comprehensive survey analytics for a program.

**Path Parameters:**
- `programId` (number): Program ID

**Response:**
```json
{
  "success": true,
  "data": {
    "program_info": {...},
    "surveys": [...],
    "analytics": {
      "total_responses": 150,
      "response_rate": 75.5,
      "satisfaction_average": 4.2,
      "completion_trends": [...]
    }
  },
  "message": "Program survey analytics retrieved successfully"
}
```

### 10. Create Program
**POST** `/api/programs`

Create a new program (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Prevention Program",
  "description": "Description of the new program",
  "type": "prevention",
  "category_id": 1,
  "status": "active",
  "target_audience": "teenagers",
  "duration_weeks": 12
}
```

### 11. Update Program
**PUT** `/api/programs/:id`

Update existing program (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Program ID

### 12. Delete Program
**DELETE** `/api/programs/:id`

Delete program from the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Program ID

---

*This documentation continues with all remaining endpoints...*

## Content Routes

### 1. Get All Content
**GET** `/api/content`

Retrieve all content in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "content_id": 1,
      "title": "Understanding Drug Addiction",
      "description": "Comprehensive guide to understanding addiction",
      "type": "article",
      "content_type": "markdown",
      "file_path": "/content/articles/addiction-guide.md",
      "program_id": 1,
      "order": 1,
      "metadata_json": {
        "duration": "15 minutes",
        "difficulty": "beginner"
      }
    }
  ],
  "count": 1,
  "message": "All content retrieved successfully"
}
```

### 2. Get Content by Type
**GET** `/api/content/type/:type`

Get content filtered by type (article, video, podcast).

**Path Parameters:**
- `type` (string): Content type

### 3. Get Content by Content Type
**GET** `/api/content/content-type/:contentType`

Get content by content type (markdown, video, audio).

**Path Parameters:**
- `contentType` (string): Content type format

### 4. Get Content by Program ID
**GET** `/api/content/program/:programId`

Get all content for a specific program.

**Path Parameters:**
- `programId` (number): Program ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "content_id": 1,
      "title": "Module 1: Introduction",
      "type": "video",
      "content_type": "video",
      "order": 1,
      "metadata_json": {
        "youtube_id": "dQw4w9WgXcQ",
        "duration": "10:30"
      }
    }
  ],
  "count": 5,
  "message": "Program content retrieved successfully"
}
```

### 5. Get Preview Content
**GET** `/api/content/preview/:program_id`

Get preview content for a program.

**Path Parameters:**
- `program_id` (number): Program ID

### 6. Get Content by ID
**GET** `/api/content/:id`

Get specific content item.

**Path Parameters:**
- `id` (number): Content ID

### 7. Get Content with Program
**GET** `/api/content/:id/with-program`

Get content with program information.

**Path Parameters:**
- `id` (number): Content ID

### 8. Get Parsed Metadata Content
**GET** `/api/content/:id/parsed-metadata`

Get content with parsed metadata.

**Path Parameters:**
- `id` (number): Content ID

### 9. Get Content File
**GET** `/api/content/file/:id`

Serve content file.

**Path Parameters:**
- `id` (number): Content ID

### 10. Create Content
**POST** `/api/content`

Create new content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Educational Video",
  "description": "Informative video about prevention",
  "type": "video",
  "content_type": "video",
  "program_id": 1,
  "order": 3,
  "metadata_json": {
    "youtube_id": "newvideoid",
    "duration": "15:00"
  }
}
```

### 11. Create YouTube Content
**POST** `/api/content/youtube`

Create YouTube video content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "YouTube Video Title",
  "description": "Video description",
  "program_id": 1,
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "order": 2
}
```

### 12. Create Markdown Content
**POST** `/api/content/markdown`

Create markdown content with image (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (string): Content title
- `description` (string): Content description
- `program_id` (number): Program ID
- `markdown_content` (string): Markdown text
- `image` (file): Image file
- `order` (number): Content order

### 13. Create Podcast Content
**POST** `/api/content/podcast`

Create podcast/audio content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Podcast Episode Title",
  "description": "Episode description",
  "program_id": 1,
  "audio_url": "https://example.com/podcast.mp3",
  "duration": "30:00",
  "order": 4
}
```

### 14. Update Content
**PUT** `/api/content/:id`

Update existing content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Content ID

### 15. Update Content Order
**PATCH** `/api/content/:id/order`

Update content order (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Content ID

**Request Body:**
```json
{
  "order": 5
}
```

### 16. Delete Content
**DELETE** `/api/content/:id`

Delete content from the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Content ID

### 17. Upload Image
**POST** `/api/images/upload`

Upload image for content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (file): Image file

### 18. Get Image
**GET** `/api/images/:filename`

Serve uploaded image.

**Path Parameters:**
- `filename` (string): Image filename

---

## Category Routes

### 1. Get All Categories
**GET** `/api/categories`

Retrieve all available program categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "name": "Youth Prevention",
      "description": "Programs focused on preventing drug use among youth"
    },
    {
      "category_id": 2,
      "name": "Adult Recovery",
      "description": "Recovery programs for adults"
    }
  ],
  "count": 2,
  "message": "Categories retrieved successfully"
}
```

### 2. Create Category
**POST** `/api/categories`

Create a new program category (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Family Support",
  "description": "Programs designed for family members of those affected by addiction"
}
```

### 3. Update Category
**PUT** `/api/categories/:id`

Modify an existing program category (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Category ID

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

### 4. Delete Category
**DELETE** `/api/categories/:id`

Delete a program category from the system (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Category ID

---

## Blog Routes

### 1. Get All Published Blogs
**GET** `/api/blogs`

Retrieve all published blog posts (public).

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of blogs per page
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "blog_id": 1,
      "title": "Understanding Addiction Recovery",
      "body": "Blog content...",
      "status": "published",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "author_id": 45,
      "img_link": "blog-image.jpg",
      "author": {
        "user_id": 45,
        "email": "author@example.com",
        "role": "staff"
      }
    }
  ],
  "count": 1,
  "message": "Published blogs retrieved successfully"
}
```

### 2. Get All Blogs for Admin
**GET** `/api/admin/blogs`

Retrieve all blogs including unpublished ones (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 3. Get My Blogs
**GET** `/api/blogs/my`

Retrieve all blog posts created by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 4. Get Pending Blogs
**GET** `/api/blogs/pending`

Retrieve blog posts awaiting moderation (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 5. Get Moderation Statistics
**GET** `/api/blogs/moderation/stats`

Retrieve statistics about blog moderation (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_blogs": 150,
    "published": 120,
    "pending": 25,
    "rejected": 5,
    "flagged": 8
  },
  "message": "Moderation statistics retrieved successfully"
}
```

### 6. Get Blog Details
**GET** `/api/blogs/:id`

Retrieve detailed information about a specific blog post.

**Path Parameters:**
- `id` (number): Blog ID

### 7. Get Blogs by Author
**GET** `/api/blogs/user/:authorId`

Get all blogs by a specific author.

**Path Parameters:**
- `authorId` (number): Author's user ID

### 8. Create Blog
**POST** `/api/blogs`

Create new blog post with text content.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "body": "This is the content of my blog post...",
  "status": "draft"
}
```

### 9. Create Blog with Image
**POST** `/api/blogs/with-image`

Create new blog post with image attachment.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (string): Blog title
- `body` (string): Blog content
- `image` (file): Image file
- `status` (string): Blog status (draft, published)

### 10. Update Blog
**PUT** `/api/blogs/:id`

Modify existing blog post content (Author/Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Blog ID

**Request Body:**
```json
{
  "title": "Updated Blog Title",
  "body": "Updated blog content...",
  "status": "published"
}
```

### 11. Delete Blog
**DELETE** `/api/blogs/:id`

Delete blog post from the system (Author/Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Blog ID

### 12. Update Blog Status
**PATCH** `/api/blogs/:id/status`

Change blog post status (Author/Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Blog ID

**Request Body:**
```json
{
  "status": "published"
}
```

### 13. Approve Blog
**PATCH** `/api/blogs/:id/approve`

Approve pending blog post for publication (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Blog ID

### 14. Reject Blog
**PATCH** `/api/blogs/:id/reject`

Reject pending blog post (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Blog ID

**Request Body:**
```json
{
  "reason": "Content does not meet guidelines"
}
```

---

## Flag Routes

### 1. Create Flag
**POST** `/api/flags`

Report blog post for inappropriate content.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "blog_id": 1,
  "reason": "Inappropriate content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flag_id": 1,
    "blog_id": 1,
    "user_id": 123,
    "reason": "Inappropriate content",
    "created_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "Flag created successfully",
  "blogHidden": true,
  "authorBanned": false
}
```

### 2. Get Flags by Blog
**GET** `/api/flags/blog/:blogId`

Retrieve all flag reports for a specific blog (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `blogId` (number): Blog ID

### 3. Get Flags by User
**GET** `/api/flags/user/:userId`

Retrieve all flag reports created by a specific user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID

### 4. Get All Flags
**GET** `/api/flags`

Retrieve all flag reports for admin review (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 5. Get Most Flagged Blogs
**GET** `/api/flags/most-flagged-blogs`

Retrieve blogs sorted by number of flags (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "blog_id": 1,
      "title": "Controversial Blog Post",
      "flag_count": 15,
      "status": "hidden",
      "author_id": 67
    }
  ],
  "message": "Most flagged blogs retrieved successfully"
}
```

### 6. Remove Flag
**DELETE** `/api/flags/:id`

Delete a flag report and unhide blog if needed (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Flag ID

**Response:**
```json
{
  "success": true,
  "message": "Flag removed successfully",
  "blogUnhidden": true,
  "remainingFlags": 2,
  "blogId": 1
}
```

### 7. Clear Blog Flags
**DELETE** `/api/flags/blog/:blogId/clear`

Remove all flag reports for a specific blog (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `blogId` (number): Blog ID

### 8. Get Banned Users
**GET** `/api/flags/banned-users`

Retrieve users banned due to flagged content (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 9. Unban User
**PATCH** `/api/flags/unban-user/:userId`

Remove ban from user (Admin).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID

---

## Enrollment Routes

### 1. Get My Enrollments
**GET** `/api/enrollments/my`

Retrieve all program enrollments for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "enroll_id": "uuid-1234",
      "user_id": 123,
      "program_id": 1,
      "enrollment_date": "2024-01-10T00:00:00.000Z",
      "completion_date": null,
      "status": "in_progress",
      "progress": 65.5,
      "completed_content_ids": [1, 2, 3],
      "program": {
        "title": "Youth Prevention Program",
        "description": "..."
      }
    }
  ],
  "count": 1,
  "message": "User enrollments retrieved successfully"
}
```

### 2. Check My Enrollment
**GET** `/api/enrollments/check/:programId`

Check if current user is enrolled in a specific program.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `programId` (number): Program ID

**Response:**
```json
{
  "success": true,
  "isEnrolled": true,
  "enrollment": {
    "enroll_id": "uuid-1234",
    "status": "in_progress",
    "progress": 65.5
  },
  "message": "Enrollment status checked successfully"
}
```

### 3. Get Enrollment Details
**GET** `/api/enrollments/:userId/:programId`

Retrieve detailed enrollment information with progress.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID
- `programId` (number): Program ID

### 4. Create Enrollment
**POST** `/api/enrollments`

Enroll in a program.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "program_id": 1,
  "user_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enroll_id": "uuid-1234",
    "user_id": 123,
    "program_id": 1,
    "enrollment_date": "2024-01-15T10:00:00.000Z",
    "status": "enrolled",
    "progress": 0,
    "completed_content_ids": []
  },
  "message": "Enrollment created successfully"
}
```

### 5. Toggle Content Completion
**PATCH** `/api/enrollments/:enrollId/content/:contentId/toggle`

Mark content as complete/incomplete.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `enrollId` (string): Enrollment ID
- `contentId` (number): Content ID

### 6. Complete Enrollment
**PUT** `/api/enrollments/:enrollId/complete`

Mark entire program enrollment as completed.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `enrollId` (string): Enrollment ID

### 7. Delete My Enrollment
**DELETE** `/api/enrollments/my/:programId`

Delete enrollment for current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `programId` (number): Program ID

---

## Survey Routes

### 1. Get Surveys by Type and Program
**GET** `/api/surveys/program/:programId/type/:type`

Get surveys by program ID and type.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `programId` (number): Program ID
- `type` (string): Survey type (e.g., "pre", "post", "satisfaction")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "survey_id": 1,
      "title": "Pre-Program Assessment",
      "type": "pre",
      "program_id": 1,
      "questions_json": {
        "questions": [
          {
            "id": 1,
            "question": "How confident are you in your knowledge?",
            "type": "scale",
            "options": ["1", "2", "3", "4", "5"]
          }
        ]
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Survey retrieved successfully"
}
```

### 2. Get Surveys by Program
**GET** `/api/surveys/program/:programId`

Get all surveys for a program.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `programId` (number): Program ID

### 3. Create Survey
**POST** `/api/surveys`

Create new survey (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Survey",
  "type": "satisfaction",
  "program_id": 1,
  "questions_json": {
    "questions": [
      {
        "id": 1,
        "question": "Rate your satisfaction",
        "type": "scale",
        "options": ["1", "2", "3", "4", "5"],
        "required": true
      }
    ]
  }
}
```

### 4. Update Survey
**PUT** `/api/surveys/:id`

Update survey and delete all responses (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Survey ID

---

## Survey Response Routes

### 1. Get My Survey Responses
**GET** `/api/survey-responses/me`

Get current user's survey responses in key-value format.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "response_id": 1,
      "survey_id": 1,
      "user_id": 123,
      "responses": {
        "question_1": "5",
        "question_2": "Very satisfied",
        "question_3": ["option1", "option2"]
      },
      "submitted_at": "2024-01-15T10:00:00.000Z",
      "survey": {
        "title": "Pre-Program Assessment",
        "type": "pre"
      }
    }
  ],
  "message": "User survey responses retrieved successfully"
}
```

### 2. Check My Response
**GET** `/api/survey-responses/check/:surveyId`

Check if current user has responded to a survey.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `surveyId` (number): Survey ID

**Response:**
```json
{
  "success": true,
  "hasResponded": true,
  "response": {
    "response_id": 1,
    "submitted_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "Response status checked successfully"
}
```

### 3. Submit Survey Response
**POST** `/api/survey-responses`

Submit survey response in key-value format.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "survey_id": 1,
  "responses": {
    "question_1": "5",
    "question_2": "Very satisfied",
    "question_3": ["option1", "option2"]
  }
}
```

### 4. Update Survey Response
**PUT** `/api/survey-responses`

Update existing survey response in key-value format.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "survey_id": 1,
  "responses": {
    "question_1": "4",
    "question_2": "Satisfied",
    "question_3": ["option1"]
  }
}
```

### 5. Get All Survey Responses
**GET** `/api/survey-responses`

Get all survey responses (Admin/Staff).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 6. Get Survey Response Statistics
**GET** `/api/survey-responses/statistics`

Get survey response statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 7. Get Responses by Date Range
**GET** `/api/survey-responses/date-range`

Get responses within a date range.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `start_date` (string): Start date (YYYY-MM-DD)
- `end_date` (string): End date (YYYY-MM-DD)

### 8. Get Survey Response by ID
**GET** `/api/survey-responses/:id`

Get specific survey response by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Response ID

### 9. Get Parsed Survey Response
**GET** `/api/survey-responses/:id/parsed`

Get parsed survey response by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Response ID

### 10. Get Response with Relations
**GET** `/api/survey-responses/:id/with-relations`

Get response with user and survey information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Response ID

### 11. Get Responses by Survey ID
**GET** `/api/survey-responses/survey/:surveyId`

Get all responses for a specific survey.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `surveyId` (number): Survey ID

### 12. Get Responses by User ID
**GET** `/api/survey-responses/user/:userId`

Get all responses by a specific user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (number): User ID

### 13. Get Survey Analytics
**GET** `/api/survey-responses/survey/:surveyId/analytics`

Get comprehensive analytics for a survey.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `surveyId` (number): Survey ID

**Response:**
```json
{
  "success": true,
  "data": {
    "survey_info": {
      "survey_id": 1,
      "title": "Pre-Program Assessment",
      "total_questions": 5
    },
    "response_stats": {
      "total_responses": 150,
      "response_rate": 75.5,
      "completion_rate": 98.2
    },
    "question_analytics": [
      {
        "question_id": 1,
        "question": "Rate your satisfaction",
        "response_distribution": {
          "1": 5,
          "2": 10,
          "3": 25,
          "4": 60,
          "5": 50
        },
        "average_score": 4.2
      }
    ]
  },
  "message": "Survey analytics retrieved successfully"
}
```

### 14. Check User Response
**GET** `/api/survey-responses/check/:surveyId/:userId`

Check if specific user has responded to a survey.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `surveyId` (number): Survey ID
- `userId` (number): User ID

### 15. Create Survey Response (Legacy)
**POST** `/api/survey-responses/legacy`

Submit survey response in legacy format.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 16. Update Survey Response by ID
**PUT** `/api/survey-responses/:id`

Update survey response by ID (legacy format).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): Response ID

### 17. Delete Survey Response
**DELETE** `/api/survey-responses/:id`

Delete survey response.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (number): Response ID

---

## Debug & Test Routes

### 1. Get All Users (Debug)
**GET** `/`

Development debugging endpoint to list all users (includes passwords).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "email": "admin@example.com",
      "password": "password123",
      "role": "admin",
      "status": "active",
      "img_link": null
    }
  ],
  "message": "Users retrieved successfully (DEBUG MODE - includes passwords)"
}
```

### 2. Test Swagger Bypass
**GET** `/api/test-bypass`

Test endpoint to verify Swagger bypass functionality.

**Headers:**
```
Authorization: Bearer <jwt_token>
x-swagger-bypass: true
```

**Response:**
```json
{
  "success": true,
  "message": "🔓 Swagger bypass is working!",
  "user": {
    "userId": 1,
    "email": "mock@admin.com",
    "role": "admin"
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## File Serving Routes

### 1. Serve Content Files
**GET** `/content/*`

Serve static content files.

**Path:** `/content/image/filename.jpg`

### 2. Serve Upload Files
**GET** `/uploads/*`

Serve uploaded files (profile pictures, blog images, etc.).

**Path:** `/uploads/profile-pictures/filename.jpg`

---

## Additional User Routes

### 1. Get User Role
**GET** `/api/user/role/`

Get the role of the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "role": "member"
  },
  "message": "User role retrieved successfully"
}
```

---

## Response Examples by Status Code

### 200 Success
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "error": "Missing required field: email"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "User with ID 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## Development Notes

### Environment Setup
- **Database**: SQL Server (localhost:1433)
- **Port**: 3000
- **JWT Secret**: `swp391-super-secret-jwt-key-2025-secure`

### Testing with Swagger
1. Access Swagger UI at `http://localhost:3000/api-docs`
2. For protected endpoints, add header: `x-swagger-bypass: true`
3. This bypasses authentication and uses a mock admin user

### File Uploads
- **Profile Pictures**: `/public/uploads/profile-pictures/`
- **Blog Images**: `/public/uploads/blog-images/`
- **Content Images**: `/content/image/`
- **Max File Size**: 5MB
- **Allowed Types**: Images only (jpg, png, gif, etc.)

### Database Relationships
- Users have Profiles (one-to-one)
- Users can be Consultants (one-to-one)
- Programs have Categories (many-to-one)
- Programs have Content (one-to-many)
- Users can Enroll in Programs (many-to-many)
- Assessments have Actions (many-to-one)
- Surveys have Responses (one-to-many)

---

This documentation covers all API endpoints available in the SWP391 Drug Prevention Platform. For the most up-to-date information, refer to the Swagger documentation at `http://localhost:3000/api-docs`.