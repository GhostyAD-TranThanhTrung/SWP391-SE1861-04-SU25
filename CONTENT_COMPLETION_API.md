# Content Completion API Documentation

This document describes the API endpoints for updating content completion status within enrollments using `content_id` and `enroll_id`.

## Enrollment ID Format

Since the Enroll table uses a composite primary key (`user_id` + `program_id`), the `enroll_id` is formatted as:
```
enroll_id = "userId_programId"
```

**Examples:**
- User 6 enrolled in Program 2: `enroll_id = "6_2"`
- User 8 enrolled in Program 1: `enroll_id = "8_1"`
- User 9 enrolled in Program 3: `enroll_id = "9_3"`

## API Endpoints

### 1. Update Content Completion Status

**Endpoint:** `PUT /api/enrollments/:enrollId/content/:contentId`

**Description:** Updates the completion status of a specific content item within an enrollment.

**Parameters:**
- `enrollId` (path): Composite enrollment ID in format "userId_programId"
- `contentId` (path): ID of the content item to update
- `complete` (body): Boolean value (true/false) to set completion status

**Request Example:**
```bash
PUT /api/enrollments/6_2/content/8
Content-Type: application/json
Authorization: Bearer your-jwt-token

{
  "complete": true
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "user_id": 6,
    "program_id": 2,
    "start_at": "2024-01-10T10:00:00.000Z",
    "complete_at": null,
    "progress": [
      {"content_id": 8, "complete": true},
      {"content_id": 9, "complete": false},
      {"content_id": 10, "complete": false}
    ],
    "enroll_id": "6_2",
    "progressPercentage": 33,
    "completedContent": 1,
    "totalContent": 3
  },
  "message": "Content 8 completion status updated successfully"
}
```

### 2. Toggle Content Completion Status

**Endpoint:** `PATCH /api/enrollments/:enrollId/content/:contentId/toggle`

**Description:** Toggles the completion status of a content item (false → true or true → false).

**Parameters:**
- `enrollId` (path): Composite enrollment ID in format "userId_programId"
- `contentId` (path): ID of the content item to toggle

**Request Example:**
```bash
PATCH /api/enrollments/6_2/content/9/toggle
Authorization: Bearer your-jwt-token
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "user_id": 6,
    "program_id": 2,
    "start_at": "2024-01-10T10:00:00.000Z",
    "complete_at": null,
    "progress": [
      {"content_id": 8, "complete": true},
      {"content_id": 9, "complete": true},
      {"content_id": 10, "complete": false}
    ],
    "enroll_id": "6_2",
    "progressPercentage": 67,
    "completedContent": 2,
    "totalContent": 3
  },
  "message": "Content 9 toggled to completed"
}
```

## Usage Examples

### Complete Content Item
```javascript
// Mark content 8 as completed for user 6 in program 2
const response = await fetch('/api/enrollments/6_2/content/8', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ complete: true })
});
```

### Mark Content as Incomplete
```javascript
// Mark content 9 as incomplete for user 6 in program 2
const response = await fetch('/api/enrollments/6_2/content/9', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ complete: false })
});
```

### Toggle Content Status
```javascript
// Toggle completion status of content 10 for user 6 in program 2
const response = await fetch('/api/enrollments/6_2/content/10/toggle', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## Features

### Automatic Completion Detection
- When all content items in an enrollment are marked as complete, the `complete_at` timestamp is automatically set
- When any content is marked as incomplete after full completion, the `complete_at` timestamp is cleared

### Progress Calculation
- Responses include calculated progress percentage
- Shows completed vs total content counts
- Useful for progress bars and completion tracking

### Error Handling
- Validates enroll_id format
- Checks if enrollment exists
- Verifies content exists in enrollment progress
- Handles invalid parameters gracefully

## Error Responses

### Invalid Enroll ID Format
```json
{
  "success": false,
  "message": "Invalid enroll_id format. Expected format: \"userId_programId\" (e.g., \"6_2\")"
}
```

### Enrollment Not Found
```json
{
  "success": false,
  "message": "Enrollment not found for enroll_id: 6_2"
}
```

### Content Not Found
```json
{
  "success": false,
  "message": "Content with ID 99 not found in enrollment progress"
}
```

## Integration with Sample Data

Based on the sample data, here are some valid examples:

```bash
# User 6 in Program 2 (Stress Management) - content IDs 8-14
PUT /api/enrollments/6_2/content/13
{"complete": true}

# User 7 in Program 3 (Mindfulness Meditation) - content IDs 15-21  
PATCH /api/enrollments/7_3/content/18/toggle

# User 8 in Program 1 (Mental Health Basics) - content IDs 1-7
PUT /api/enrollments/8_1/content/7
{"complete": true}
```

This API provides a simple and intuitive way to manage content completion using the requested `content_id` and `enroll_id` parameters! 