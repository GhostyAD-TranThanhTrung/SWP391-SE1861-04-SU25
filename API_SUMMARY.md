# SWP391 Drug Prevention Platform - API Quick Reference

## Overview
This is a quick reference guide for the SWP391 Drug Prevention Platform API. For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

**Base URL:** `http://localhost:3000`  
**Swagger UI:** `http://localhost:3000/api-docs`

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Quick Endpoint Reference

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/login` | User login | ❌ |
| POST | `/api/register` | User registration | ❌ |
| POST | `/api/google-login` | Google OAuth login | ❌ |
| POST | `/api/google-register` | Google OAuth registration | ❌ |
| PUT | `/api/reset-password` | Reset password | ✅ |

### 📊 Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard` | Basic statistics | ❌ |
| GET | `/api/dashboard/detailed` | Detailed analytics | ❌ |

### 👤 Profile Management
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/profile` | Create/update profile | ✅ |
| GET | `/api/profile` | Get user profile | ✅ |
| GET | `/api/profile/status` | Check profile status | ✅ |
| GET | `/api/user/profile-combined` | Get combined user+profile | ✅ |
| PUT | `/api/user/profile-combined` | Update combined data | ✅ |
| DELETE | `/api/user/delete-account` | Delete account (soft) | ✅ |

### 👥 User Management
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/staff` | List all staff | ✅ | Admin |
| POST | `/api/staff` | Create staff | ✅ | Admin |
| PUT | `/api/staff/:id` | Update staff | ✅ | Admin |
| DELETE | `/api/staff/:id` | Delete staff | ✅ | Admin |
| GET | `/api/members` | List all members | ✅ | Admin/Staff |
| GET | `/api/members/:id` | Get member details | ✅ | Admin/Staff |
| PUT | `/api/members/:id` | Update member | ✅ | Admin/Staff |
| DELETE | `/api/members/:id` | Delete member | ✅ | Admin |

### 💬 Consultants & Booking
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/consultants` | List consultants | ❌ |
| POST | `/api/consultants` | Create consultant | ✅ |
| GET | `/api/consultants/:id` | Get consultant details | ❌ |
| PUT | `/api/consultants/:id` | Update consultant | ✅ |
| DELETE | `/api/consultants/:id` | Delete consultant | ✅ |
| GET | `/api/consultants-complete` | Complete consultant data | ✅ |
| POST | `/api/consultants-complete` | Create complete consultant | ✅ |
| GET | `/api/consultant-slots/:id` | Get consultant slots | ❌ |
| PUT | `/api/consultant-slots` | Update slots | ✅ |
| GET | `/api/slots` | Get all time slots | ❌ |

### 📅 Booking Sessions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/booking-sessions/scheduled` | Get scheduled sessions | ✅ |
| GET | `/api/booking-sessions/member` | Get my bookings | ✅ |
| POST | `/api/booking-sessions` | Create booking | ✅ |
| PUT | `/api/booking-sessions/:id` | Update booking | ✅ |
| DELETE | `/api/booking-sessions/:id` | Delete booking | ✅ |
| GET | `/api/booking-sessions/consultant/:id` | Get consultant bookings | ✅ |

### 📝 Assessments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assessments` | List all assessments | ✅ |
| GET | `/api/assessments/me` | Get my assessments | ✅ |
| POST | `/api/assessments/take-test` | Take assessment | ✅ |
| GET | `/api/assessments/type/:type` | Filter by type | ✅ |
| DELETE | `/api/assessments/:id` | Delete assessment | ✅ |

### ❓ Assessment Questions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assessment-questions/type/:type` | Get questions by type | ❌ |
| GET | `/api/assessment-questions` | Get all questions | ❌ |
| POST | `/api/assessment-questions` | Create question | ✅ |
| PUT | `/api/assessment-questions/:id` | Update question | ✅ |
| DELETE | `/api/assessment-questions/:id` | Delete question | ✅ |

### 📝 Answers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/answers` | Get all answers | ❌ |
| GET | `/api/answers/question/:id` | Get answers by question | ❌ |
| POST | `/api/answers` | Create answer | ✅ |
| POST | `/api/answers/bulk` | Bulk create answers | ✅ |
| PUT | `/api/answers/:id` | Update answer | ✅ |
| DELETE | `/api/answers/:id` | Delete answer | ✅ |

### 🎯 Actions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/actions` | Get all actions | ✅ |
| GET | `/api/actions/:id` | Get action by ID | ✅ |
| POST | `/api/actions` | Create action | ✅ |
| PUT | `/api/actions/:id` | Update action | ✅ |
| DELETE | `/api/actions/:id` | Delete action | ✅ |

### 🎓 Programs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/programs` | List all programs | ❌ |
| GET | `/api/programs/category-details` | Programs by category | ❌ |
| GET | `/api/programs/community-events` | Community events | ❌ |
| GET | `/api/programs/:id` | Get program details | ❌ |
| GET | `/api/programs/my-enrollment-status` | My enrollment status | ✅ |
| POST | `/api/programs` | Create program | ✅ |
| PUT | `/api/programs/:id` | Update program | ✅ |
| DELETE | `/api/programs/:id` | Delete program | ✅ |

### 📚 Content
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/content` | Get all content | ❌ |
| GET | `/api/content/program/:id` | Get program content | ❌ |
| POST | `/api/content/youtube` | Create YouTube content | ✅ |
| POST | `/api/content/markdown` | Create markdown content | ✅ |
| POST | `/api/content/podcast` | Create podcast content | ✅ |
| PUT | `/api/content/:id` | Update content | ✅ |
| DELETE | `/api/content/:id` | Delete content | ✅ |

### 🏷️ Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List categories | ❌ |
| POST | `/api/categories` | Create category | ✅ |
| PUT | `/api/categories/:id` | Update category | ✅ |
| DELETE | `/api/categories/:id` | Delete category | ✅ |

### 📰 Blogs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/blogs` | List published blogs | ❌ |
| GET | `/api/blogs/my` | Get my blogs | ✅ |
| GET | `/api/blogs/pending` | Get pending blogs | ✅ |
| POST | `/api/blogs` | Create blog | ✅ |
| POST | `/api/blogs/with-image` | Create blog with image | ✅ |
| PUT | `/api/blogs/:id` | Update blog | ✅ |
| DELETE | `/api/blogs/:id` | Delete blog | ✅ |
| PATCH | `/api/blogs/:id/approve` | Approve blog | ✅ |
| PATCH | `/api/blogs/:id/reject` | Reject blog | ✅ |

### 🚩 Flags
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/flags` | Create flag report | ✅ |
| GET | `/api/flags` | Get all flags | ✅ |
| GET | `/api/flags/blog/:id` | Get flags by blog | ✅ |
| DELETE | `/api/flags/:id` | Remove flag | ✅ |
| DELETE | `/api/flags/blog/:id/clear` | Clear blog flags | ✅ |

### 🎯 Enrollments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/enrollments/my` | Get my enrollments | ✅ |
| GET | `/api/enrollments/check/:id` | Check enrollment | ✅ |
| POST | `/api/enrollments` | Create enrollment | ✅ |
| PATCH | `/api/enrollments/:id/content/:cid/toggle` | Toggle content | ✅ |
| PUT | `/api/enrollments/:id/complete` | Complete enrollment | ✅ |
| DELETE | `/api/enrollments/my/:id` | Delete enrollment | ✅ |

### 📊 Surveys
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/surveys/program/:pid/type/:type` | Get surveys | ✅ |
| POST | `/api/surveys` | Create survey | ✅ |
| PUT | `/api/surveys/:id` | Update survey | ✅ |

### 📋 Survey Responses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/survey-responses/me` | Get my responses | ✅ |
| GET | `/api/survey-responses/check/:id` | Check response | ✅ |
| POST | `/api/survey-responses` | Submit response | ✅ |
| PUT | `/api/survey-responses` | Update response | ✅ |
| GET | `/api/survey-responses/statistics` | Get statistics | ✅ |
| GET | `/api/survey-responses/survey/:id/analytics` | Get analytics | ✅ |

## Common Request/Response Patterns

### Standard Response Format
```json
{
  "success": true|false,
  "data": <response_data>,
  "message": "Description",
  "count": <number> // For array responses
}
```

### Authentication Header
```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

### Pagination Parameters
```javascript
?page=1&limit=10
```

### File Upload (Form Data)
```javascript
const formData = new FormData();
formData.append('title', 'Blog Title');
formData.append('body', 'Blog content');
formData.append('image', fileInput.files[0]);
```

## Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## User Roles
- **admin**: Full system access
- **staff**: Administrative functions
- **manager**: Management functions
- **consultant**: Consultation services
- **member**: Regular user access

## Development Features
- **Swagger Bypass**: Add header `x-swagger-bypass: true` for testing
- **Debug Endpoint**: GET `/` - Lists all users with passwords
- **File Serving**: 
  - Content: `/content/*`
  - Uploads: `/uploads/*`

## Key Data Structures

### User Object
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "role": "member",
  "status": "active",
  "img_link": "profile.jpg",
  "date_create": "2024-01-01T00:00:00.000Z"
}
```

### Profile Object
```json
{
  "user_id": 123,
  "name": "John Doe",
  "bio_json": {...},
  "date_of_birth": "1990-01-15",
  "job": "Teacher"
}
```

### Assessment Object
```json
{
  "assessment_id": 1,
  "user_id": 123,
  "type": "ASSIST",
  "result_json": {...},
  "create_at": "2024-01-15T10:00:00.000Z",
  "action_id": 2
}
```

### Booking Session Object
```json
{
  "booking_id": 1,
  "consultant_id": 1,
  "member_id": 123,
  "slot_id": 1,
  "booking_date": "2024-01-15",
  "status": "scheduled",
  "notes": "Initial consultation",
  "google_meet_link": "https://meet.google.com/..."
}
```

### Program Object
```json
{
  "program_id": 1,
  "title": "Youth Prevention Program",
  "description": "Program description",
  "type": "prevention",
  "status": "active",
  "category_id": 1,
  "create_at": "2024-01-01T00:00:00.000Z"
}
```

## Assessment Types
- **ASSIST**: Alcohol, Smoking and Substance Involvement Screening Test
- **CRAFFT**: Screening tool for adolescent substance abuse
- **CAGE**: Alcohol screening questionnaire

## Content Types
- **article**: Text-based educational content
- **video**: Video content (YouTube integration)
- **podcast**: Audio content
- **markdown**: Formatted text content

## Survey Types
- **pre**: Pre-program assessment
- **post**: Post-program assessment
- **satisfaction**: Satisfaction survey

For detailed information about any endpoint, including request/response examples and error handling, please refer to the complete [API Documentation](./API_DOCUMENTATION.md).