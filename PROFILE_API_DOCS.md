# Profile API Documentation

## Overview
This document describes the Profile API endpoints that have been implemented using TypeORM. The Profile entity is designed to work with the ChooseRolePage frontend and provides authenticated user profile management.

## Database Schema
The Profile table structure matches the ERD diagram:
- `user_id` (INT PRIMARY KEY) - Foreign key to Users table
- `name` (NVARCHAR(100)) - User's full name
- `certification` (NVARCHAR(255)) - Professional certifications
- `works_hours_json` (NVARCHAR(MAX)) - Working hours as JSON
- `bio_json` (NVARCHAR(MAX)) - Biography as JSON
- `date_of_birth` (DATE) - Date of birth
- `job` (NVARCHAR(MAX)) - Job description/title

## Endpoints

### 1. Create Profile (POST /api/profile)
**Purpose**: Used by ChooseRolePage frontend to create user profiles after registration
**Authentication**: Required (JWT token)
**Method**: POST
**URL**: `/api/profile`

**Request Body**:
```json
{
  "name": "John Doe",
  "certification": "Licensed Therapist",
  "workHoursJson": "{\"monday\": \"9-17\", \"tuesday\": \"9-17\"}",
  "bioJson": "{\"summary\": \"Experienced therapist\"}",
  "dateOfBirth": "1990-01-01",
  "job": "Mental Health Counselor"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "user_id": 123,
    "name": "John Doe",
    "certification": "Licensed Therapist",
    "works_hours_json": "{\"monday\": \"9-17\", \"tuesday\": \"9-17\"}",
    "bio_json": "{\"summary\": \"Experienced therapist\"}",
    "date_of_birth": "1990-01-01",
    "job": "Mental Health Counselor"
  }
}
```

### 2. Get User Profile (GET /api/profile)
**Purpose**: Retrieve the authenticated user's profile using the user ID from JWT token
**Authentication**: Required (JWT token)
**Method**: GET
**URL**: `/api/profile`

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "profile": {
    "user_id": 123,
    "name": "John Doe",
    "certification": "Licensed Therapist",
    "works_hours_json": "{\"monday\": \"9-17\", \"tuesday\": \"9-17\"}",
    "bio_json": "{\"summary\": \"Experienced therapist\"}",
    "date_of_birth": "1990-01-01",
    "job": "Mental Health Counselor",
    "user": {
      "user_id": 123,
      "email": "john.doe@example.com",
      "role": "Member",
      "status": "active"
    }
  }
}
```

## Authentication
All profile endpoints require JWT authentication. The token must be included in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "error": "User ID is required"
}
```

**401 Unauthorized**:
```json
{
  "error": "Access denied. No token provided."
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Profile not found"
}
```

**409 Conflict**:
```json
{
  "success": false,
  "error": "Profile already exists for this user"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to create profile. Please try again later.",
  "details": "Error message details"
}
```

## Implementation Status
✅ Profile entity created and matches ERD schema exactly
✅ TypeORM integration completed
✅ Profile controller implemented with all required endpoints
✅ JWT authentication middleware integrated
✅ Routes configured in index.js
✅ Server tested and running successfully

## Usage in Frontend
The ChooseRolePage can now:
1. Call `POST /api/profile` to create a new profile after user registration
2. Call `GET /api/profile` to retrieve the current user's profile information
3. Both endpoints automatically use the user ID from the JWT token for security

## Notes
- The user_id is automatically extracted from the JWT token, so frontend doesn't need to specify it
- JSON validation is performed on workHoursJson and bioJson fields
- The profile has a one-to-one relationship with the User entity
- All database operations use TypeORM for type safety and reliability