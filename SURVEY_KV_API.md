# Survey Key-Value API Documentation

## Overview

This API provides endpoints for managing survey responses in a specific key-value format where each response contains `(id, question, answer)` pairs.

## Key Endpoints

### 1. Submit Survey Response
```
POST /api/survey-responses/submit-kv
```

**Request Body:**
```json
{
  "survey_id": 1,
  "responses": [
    {"id": 1, "question": "How confident are you?", "answer": "Very confident"},
    {"id": 2, "question": "What is your age?", "answer": "25"}
  ]
}
```

### 2. Update Survey Response
```
PUT /api/survey-responses/update-kv
```

### 3. Get My Responses
```
GET /api/survey-responses/my-kv
```

## Usage Example

```javascript
// Submit survey response
const response = await fetch('/api/survey-responses/submit-kv', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    survey_id: 4,
    responses: [
      {id: 1, question: "How confident are you?", answer: "Very confident"},
      {id: 2, question: "What is your age?", answer: "25"}
    ]
  })
});
```

## Survey Templates

See `SURVEY_TEMPLATES.json` for pre-built survey structures with the correct format. 