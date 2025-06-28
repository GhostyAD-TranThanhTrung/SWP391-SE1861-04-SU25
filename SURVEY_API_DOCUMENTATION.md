# Survey API Documentation - Key-Value Format

## Overview

This API provides endpoints for managing surveys and survey responses in a specific key-value format where each response contains `(id, question, answer)` pairs. This format is designed for easy storage and retrieval of survey data.

## Survey Structure

### Basic Survey JSON Format
```json
[
  {
    "id": 1,
    "question": "How confident are you?",
    "options": ["Not confident", "Slightly confident", "Very confident"]
  },
  {
    "id": 2,
    "question": "What is your age?",
    "options": ["18-25", "26-35", "36-45", "46+"]
  }
]
```

## Key-Value Survey Response Endpoints

### 1. Submit Survey Response (Key-Value Format)

```
POST /api/survey-responses/submit-kv
```

**Authentication:** Required (Bearer Token)

**Description:** Submit a new survey response in key-value format.

**Request Body:**
```json
{
  "survey_id": 1,
  "responses": [
    {
      "id": 1,
      "question": "How confident are you in resisting peer pressure?",
      "answer": "Very confident"
    },
    {
      "id": 2,
      "question": "What is your age group?",
      "answer": "18-25"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "response_id": 123,
    "survey_id": 1,
    "user_id": 6,
    "responses": [
      {
        "id": 1,
        "question": "How confident are you in resisting peer pressure?",
        "answer": "Very confident"
      },
      {
        "id": 2,
        "question": "What is your age group?",
        "answer": "18-25"
      }
    ],
    "submitted_at": "2024-01-20T10:30:00.000Z",
    "total_questions": 2
  },
  "message": "Survey response submitted successfully"
}
```

**Error Responses:**
- **400:** Invalid request format or missing required fields
- **404:** Survey not found
- **409:** User has already responded to this survey

### 2. Update Survey Response (Key-Value Format)

```
PUT /api/survey-responses/update-kv
```

**Authentication:** Required (Bearer Token)

**Description:** Update an existing survey response in key-value format.

**Request Body:** Same format as submit endpoint

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response_id": 123,
    "survey_id": 1,
    "user_id": 6,
    "responses": [
      {
        "id": 1,
        "question": "How confident are you in resisting peer pressure?",
        "answer": "Extremely confident"
      },
      {
        "id": 2,
        "question": "What is your age group?",
        "answer": "18-25"
      }
    ],
    "submitted_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T15:45:00.000Z",
    "total_questions": 2
  },
  "message": "Survey response updated successfully"
}
```

**Error Responses:**
- **400:** Invalid request format
- **404:** No existing response found for this user and survey

### 3. Get My Survey Responses (Key-Value Format)

```
GET /api/survey-responses/my-kv
```

**Authentication:** Required (Bearer Token)

**Description:** Get all survey responses for the authenticated user in key-value format.

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "response_id": 123,
      "survey_id": 1,
      "survey_type": "pre-assessment",
      "survey_program_id": 25,
      "responses": [
        {
          "id": 1,
          "question": "How confident are you?",
          "answer": "Very confident"
        },
        {
          "id": 2,
          "question": "What is your age?",
          "answer": "18-25"
        }
      ],
      "submitted_at": "2024-01-20T10:30:00.000Z",
      "updated_at": null,
      "total_questions": 2
    }
  ],
  "count": 1,
  "message": "User survey responses retrieved successfully"
}
```

## Regular Survey Endpoints

### Get Surveys by Type

```
GET /api/surveys/type/:type
```

**Parameters:**
- `type`: Survey type (pre-assessment, post-assessment, etc.)

**Example:**
```
GET /api/surveys/type/pre-assessment
```

### Get Survey with Parsed Questions

```
GET /api/surveys/:id/parsed
```

**Description:** Get a survey with JSON questions parsed into readable format.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "survey_id": 4,
    "program_id": null,
    "type": "pre-assessment",
    "questions": [
      {
        "id": 1,
        "question": "How would you rate your current knowledge?",
        "options": ["Very Low", "Low", "Moderate", "High", "Very High"]
      }
    ]
  },
  "message": "Survey retrieved and parsed successfully"
}
```

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Submit a survey response
const submitSurveyResponse = async (surveyId, responses) => {
  try {
    const response = await fetch('/api/survey-responses/submit-kv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        survey_id: surveyId,
        responses: responses
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Survey submitted successfully:', result.data);
      return result.data;
    } else {
      console.error('Error submitting survey:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};

// Usage example
const responses = [
  {
    id: 1,
    question: "How confident are you in resisting peer pressure?",
    answer: "Very confident"
  },
  {
    id: 2,
    question: "What is your age group?",
    answer: "18-25"
  }
];

submitSurveyResponse(4, responses);
```

### React Component Example

```jsx
import React, { useState } from 'react';

const SurveyForm = ({ surveyQuestions, surveyId }) => {
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (questionId, question, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { id: questionId, question, answer }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const responseArray = Object.values(responses);
    
    try {
      const response = await fetch('/api/survey-responses/submit-kv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          survey_id: surveyId,
          responses: responseArray
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Survey submitted successfully!');
        // Redirect or show success message
      } else {
        alert('Error submitting survey: ' + result.message);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {surveyQuestions.map(q => (
        <div key={q.id} className="question-group">
          <label>{q.question}</label>
          <select 
            onChange={(e) => handleAnswerChange(q.id, q.question, e.target.value)}
            required
          >
            <option value="">Select an answer</option>
            {q.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Survey'}
      </button>
    </form>
  );
};

export default SurveyForm;
```

### Get User's Previous Responses

```javascript
const getUserResponses = async () => {
  try {
    const response = await fetch('/api/survey-responses/my-kv', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('User responses:', result.data);
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching responses:', error);
  }
};
```

## Data Storage Format

The responses are stored in the database as JSON in the following format:

```json
{
  "responses": [
    {
      "id": 1,
      "question": "How confident are you?",
      "answer": "Very confident"
    },
    {
      "id": 2,
      "question": "What is your age?",
      "answer": "18-25"
    }
  ],
  "submitted_at": "2024-01-20T10:30:00.000Z",
  "updated_at": "2024-01-20T15:45:00.000Z",
  "total_questions": 2
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Each response must have id, question, and answer fields"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Survey not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "User has already responded to this survey. Use update endpoint to modify existing response."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to submit survey response",
  "error": "Database connection error"
}
```

## Best Practices

1. **Always validate responses on the frontend** before submitting to reduce API calls
2. **Handle network errors gracefully** with retry mechanisms
3. **Store survey questions locally** to reduce API calls when showing previous responses
4. **Use the update endpoint** when you know a response already exists
5. **Check for existing responses** before allowing users to take surveys again

## Security Notes

- All endpoints require valid JWT authentication
- Users can only access their own survey responses
- Survey responses are automatically associated with the authenticated user
- Input validation is performed on all submitted data 