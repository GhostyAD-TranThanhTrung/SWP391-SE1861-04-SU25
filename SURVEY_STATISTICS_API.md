# Survey Response Statistics API

## Overview
The Survey Response Statistics API provides comprehensive statistical analysis of survey responses, allowing you to organize and analyze survey data for reporting and insights. This endpoint can process responses from both individual surveys and all surveys within a program.

## Endpoint
```
GET /api/survey-responses/statistics
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `surveyId` | integer | conditional* | Get statistics for a specific survey |
| `programId` | integer | conditional* | Get statistics for all surveys in a program |
| `type` | string | optional | Filter surveys by type (e.g., "pre-assessment", "post-assessment") |

*Note: Either `surveyId` OR `programId` is required*

## Usage Examples

### 1. Get Statistics for a Specific Survey
```
GET /api/survey-responses/statistics?surveyId=1
```

### 2. Get Statistics for All Surveys in a Program
```
GET /api/survey-responses/statistics?programId=3
```

### 3. Get Statistics for Pre-Assessment Surveys in a Program
```
GET /api/survey-responses/statistics?programId=3&type=pre-assessment
```

### 4. Get Statistics for Post-Assessment Surveys in a Program
```
GET /api/survey-responses/statistics?programId=3&type=post-assessment
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "surveyId": 1,
      "surveyType": "pre-assessment",
      "programId": 3,
      "totalResponses": 8,
      "questionStatistics": {
        "1": {
          "questionId": 1,
          "questionText": "How would you rate your current knowledge about substance abuse risks?",
          "questionOptions": ["Very Low", "Low", "Moderate", "High", "Very High"],
          "totalResponses": 8,
          "totalAnswers": 8,
          "uniqueAnswers": 4,
          "mostCommonAnswer": "Moderate",
          "answerCounts": {
            "Very Low": 1,
            "Low": 2,
            "Moderate": 3,
            "High": 2
          },
          "percentages": {
            "Very Low": 12.5,
            "Low": 25.0,
            "Moderate": 37.5,
            "High": 25.0
          }
        },
        "2": {
          "questionId": 2,
          "questionText": "How confident are you in resisting peer pressure?",
          "questionOptions": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"],
          "totalResponses": 8,
          "totalAnswers": 8,
          "uniqueAnswers": 3,
          "mostCommonAnswer": "Moderately confident",
          "answerCounts": {
            "Slightly confident": 2,
            "Moderately confident": 4,
            "Very confident": 2
          },
          "percentages": {
            "Slightly confident": 25.0,
            "Moderately confident": 50.0,
            "Very confident": 25.0
          }
        }
      }
    },
    {
      "surveyId": 2,
      "surveyType": "post-assessment",
      "programId": 3,
      "totalResponses": 7,
      "questionStatistics": {
        "1": {
          "questionId": 1,
          "questionText": "How would you rate your knowledge after completing this program?",
          "questionOptions": ["Very Low", "Low", "Moderate", "High", "Very High"],
          "totalResponses": 7,
          "totalAnswers": 7,
          "uniqueAnswers": 3,
          "mostCommonAnswer": "High",
          "answerCounts": {
            "Moderate": 1,
            "High": 4,
            "Very High": 2
          },
          "percentages": {
            "Moderate": 14.3,
            "High": 57.1,
            "Very High": 28.6
          }
        }
      }
    }
  ],
  "message": "Survey response statistics generated successfully"
}
```

## Data Analysis Use Cases

### 1. Individual Question Analysis
For each question, you can analyze:
- **Total responses**: How many people answered this question
- **Answer distribution**: Count of each answer choice
- **Percentages**: Percentage breakdown of all answers
- **Most common answer**: The most frequently selected response
- **Response diversity**: Number of unique answers given

### 2. Survey Comparison (Pre vs Post Assessment)
When querying by `programId`, you can compare:
- Pre-assessment vs post-assessment results
- Progress tracking over time
- Effectiveness measurement

### 3. Program-Level Analytics
For program-wide analysis:
- Compare different surveys within the same program
- Track survey type differences (pre vs post assessments)
- Analyze participation patterns across survey types

## Statistical Examples

### Example: Analyzing Knowledge Improvement
```javascript
// Query both pre and post assessments for a program
const response = await fetch('/api/survey-responses/statistics?programId=3');
const data = await response.json();

// Find pre and post assessment surveys
const preAssessment = data.data.find(s => s.surveyType === 'pre-assessment');
const postAssessment = data.data.find(s => s.surveyType === 'post-assessment');

// Compare knowledge levels for question 1
const preKnowledge = preAssessment.questionStatistics[1].answerCounts;
const postKnowledge = postAssessment.questionStatistics[1].answerCounts;

console.log('Pre-assessment knowledge levels:', preKnowledge);
console.log('Post-assessment knowledge levels:', postKnowledge);
```

### Example: Finding Most Common Answers
```javascript
const statistics = data.data[0]; // First survey in the array

Object.values(statistics.questionStatistics).forEach(question => {
  console.log(`Question: ${question.questionText}`);
  console.log(`Most common answer: ${question.mostCommonAnswer} (${question.percentages[question.mostCommonAnswer]}%)`);
  console.log(`Total responses: ${question.totalResponses}`);
  console.log('---');
});
```

### Example: Response Rate Analysis
```javascript
// Calculate response rates per question for the first survey
const survey = data.data[0];
const totalPossibleResponses = survey.totalResponses;

Object.values(survey.questionStatistics).forEach(question => {
  const responseRate = (question.totalResponses / totalPossibleResponses) * 100;
  console.log(`${question.questionText}: ${responseRate.toFixed(1)}% response rate`);
});
```

### Example: Analyzing All Surveys in a Program
```javascript
// Query all surveys for a program
const response = await fetch('/api/survey-responses/statistics?programId=3');
const data = await response.json();

// Loop through all surveys
data.data.forEach(survey => {
  console.log(`\n=== ${survey.surveyType} (Survey ID: ${survey.surveyId}) ===`);
  console.log(`Total Responses: ${survey.totalResponses}`);
  
  Object.values(survey.questionStatistics).forEach(question => {
    console.log(`\nQuestion: ${question.questionText}`);
    console.log(`Most common answer: ${question.mostCommonAnswer} (${question.percentages[question.mostCommonAnswer]}%)`);
    
    // Show all answer counts
    Object.entries(question.answerCounts).forEach(([answer, count]) => {
      console.log(`  - ${answer}: ${count} responses (${question.percentages[answer]}%)`);
    });
  });
});
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Either surveyId or programId parameter is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Survey not found"
}
```

```json
{
  "success": false,
  "message": "No surveys found for the specified program"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to generate survey response statistics",
  "error": "Detailed error message"
}
```

## Data Format Compatibility

This endpoint supports multiple survey response formats:

1. **New Format (Key-Value)**:
   ```json
   {
     "responses": [
       {"id": 1, "question": "How confident are you?", "answer": "Very confident"}
     ]
   }
   ```

2. **Old Format (Question ID)**:
   ```json
   {
     "answers": [
       {"question_id": 1, "answer": "7"}
     ]
   }
   ```

3. **Direct Format**:
   ```json
   {
     "1": "answer_value",
     "2": ["multiple", "answers"]
   }
   ```

## Notes

- The endpoint automatically handles multiple choice questions (arrays) and single choice questions
- Percentages are calculated based on total answers for each question
- Missing or invalid responses are silently skipped
- Statistics are generated in real-time from the database
- No authentication required for reading statistics (adjust as needed for your security requirements) 