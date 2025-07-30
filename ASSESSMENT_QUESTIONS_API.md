# Assessment Questions API Documentation

## Overview

The Assessment Questions API allows you to fetch assessment questions along with their corresponding answers. The main feature is filtering by `assessment_type`.

## Base URL

```
http://localhost:3000/api/assessment-questions
```

## Main Endpoints

### 1. Get Questions by Assessment Type (Primary Feature)

**Endpoint:** `GET /api/assessment-questions/type/{assessment_type}`

**Description:** Fetch all questions and their answers for a specific assessment type.

**Example:**

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/type/alcohol_screening"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "assessment_question_id": 1,
      "question": "How often do you drink alcohol?",
      "type": "multiple_choice",
      "assessment_type": "alcohol_screening",
      "category": "substance_use",
      "substance": "alcohol",
      "answers": [
        {
          "answer_id": 1,
          "text": "Never",
          "score": 0,
          "answer_order": 1
        },
        {
          "answer_id": 2,
          "text": "Monthly or less",
          "score": 1,
          "answer_order": 2
        }
      ]
    }
  ],
  "count": 1,
  "assessment_type": "alcohol_screening",
  "message": "Assessment questions with answers for type 'alcohol_screening' retrieved successfully"
}
```

### 2. Get All Questions with Answers

**Endpoint:** `GET /api/assessment-questions`

**Description:** Retrieve all assessment questions with their answers.

### 3. Advanced Filtering

**Endpoint:** `GET /api/assessment-questions/filters`

**Description:** Filter questions using multiple criteria.

**Query Parameters:**

- `assessment_type` - Filter by assessment type
- `category` - Filter by category
- `substance` - Filter by substance
- `type` - Filter by question type
- `letter` - Filter by letter designation

**Example:**

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/filters?assessment_type=alcohol_screening&substance=alcohol"
```

### 4. Get Single Question with Answers

**Endpoint:** `GET /api/assessment-questions/{id}`

**Description:** Get a specific question with all its answers.

### 5. Get Available Assessment Types

**Endpoint:** `GET /api/assessment-questions/types`

**Description:** Get list of all unique assessment types available.

**Example:**

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/types"
```

**Response:**

```json
{
  "success": true,
  "data": ["alcohol_screening", "tobacco_screening"],
  "count": 2,
  "message": "Assessment types retrieved successfully"
}
```

### 6. Get Question Count by Type

**Endpoint:** `GET /api/assessment-questions/count-by-type`

**Description:** Get statistics on how many questions exist for each assessment type.

### 7. Create Question with Answers (Admin Only)

**Endpoint:** `POST /api/assessment-questions`

**Description:** Create a new assessment question with multiple choice answers.

**Headers:**

- `Content-Type: application/json`
- `x-swagger-bypass: true` (for testing)

**Request Body:**

```json
{
  "question": "How often do you consume alcohol?",
  "type": "multiple_choice",
  "assessment_type": "alcohol_screening",
  "note": "Basic alcohol consumption frequency question",
  "multiSelect": false,
  "allowMultiple": false,
  "category": "substance_use",
  "substance": "alcohol",
  "letter": "A",
  "answers": [
    {
      "option_id": 1,
      "text": "Never",
      "score": 0,
      "answer_order": 1
    },
    {
      "option_id": 2,
      "text": "Monthly or less",
      "score": 1,
      "answer_order": 2
    }
  ]
}
```

## Data Structure

### AssessmentQuestion Entity

```javascript
{
  assessment_question_id: number,      // Primary key
  question: string,                    // Question text
  type: string,                        // Question type (multiple_choice, yes_no, numeric, etc.)
  note: string,                        // Optional note
  assessment_type: string,             // Type of assessment (main filter field)
  multiSelect: boolean,                // Allow multiple selections
  allowMultiple: boolean,              // Allow multiple answers
  category: string,                    // Question category
  substance: string,                   // Related substance
  letter: string,                      // Letter designation
  answers: Answer[]                    // Related answers
}
```

### Answer Entity

```javascript
{
  answer_id: number,                   // Primary key
  assessment_question_id: number,      // Foreign key to question
  option_id: number,                   // Option identifier
  text: string,                        // Answer text
  score: number,                       // Score for this answer
  answer_order: number                 // Display order
}
```

## Usage Examples

### Get all alcohol screening questions:

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/type/alcohol_screening"
```

### Get questions filtered by multiple criteria:

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/filters?assessment_type=alcohol_screening&category=substance_use"
```

### Get all available assessment types:

```bash
curl -X GET "http://localhost:3000/api/assessment-questions/types"
```

## Authentication

- Most GET endpoints are public (no authentication required)
- POST endpoint requires authentication (use `x-swagger-bypass: true` header for testing)

## Error Handling

All endpoints return responses in this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string  // Only present on failures
}
```
