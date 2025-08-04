# SWP391 Drug Prevention Platform - Assessment System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Assessment Types](#assessment-types)
6. [Data Structures](#data-structures)
7. [API Documentation](#api-documentation)
8. [User Journey](#user-journey)
9. [Scoring & Risk Assessment](#scoring--risk-assessment)
10. [Database Schema](#database-schema)
11. [Component Reference](#component-reference)
12. [Configuration](#configuration)

---

## Overview

The Assessment System is a comprehensive drug screening and evaluation platform that implements standardized assessment tools for substance use disorder screening. The system supports multiple assessment types with dynamic question management, real-time scoring, and risk level determination.

### Key Features
- **Multi-Assessment Support**: ASSIST (WHO) and CRAFFT 2.1 assessments
- **Dynamic Question Management**: Admin interface for creating/editing questions
- **Real-time Scoring**: Automatic calculation with risk level assessment
- **Result Persistence**: Assessment history and analytics
- **Role-based Access**: Different interfaces for users, staff, and administrators
- **Risk Level Mapping**: Automatic recommendations based on scores

### Assessment Types Supported
1. **ASSIST (Alcohol, Smoking and Substance Involvement Screening Test)**
   - WHO-developed comprehensive screening tool
   - 15 questions covering various substances
   - Multi-select capabilities for question 1
   - Dynamic substance replacement in follow-up questions

2. **CRAFFT 2.1 (Behavioral Health Screening)**
   - Specialized for adolescents and young adults
   - Part A: Substance use screening (3 questions)
   - Part B: CRAFFT questions (6 questions)
   - Age-appropriate behavioral focus

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Assessment System Architecture               │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (React)                                                │
│ ├── Assessment Pages                                            │
│ │   ├── ChooseTypeExam.jsx    (Assessment selection)           │
│ │   ├── ExamPage.jsx          (Assessment taking interface)     │
│ │   ├── ResultPage.jsx        (Results display)                │
│ │   └── AssessmentResultPage.jsx (History view)                │
│ ├── Admin Pages                                                │
│ │   └── AssessmentListPage.jsx (Assessment management)         │
│ ├── Components                                                 │
│ │   ├── AssistQuestionModal.jsx                               │
│ │   └── CrafftQuestionModal.jsx                               │
│ └── Data Sources                                              │
│     ├── Assist_Data.jsx                                       │
│     └── Crafft-Data.jsx                                       │
├─────────────────────────────────────────────────────────────────┤
│ Backend (Express + TypeORM)                                    │
│ ├── Controllers                                               │
│ │   ├── assessmentController.js                              │
│ │   ├── assessmentQuestionController.js                      │
│ │   ├── answerController.js                                  │
│ │   └── actionController.js                                  │
│ ├── Entities                                                  │
│ │   ├── Assessment.js                                        │
│ │   ├── AssessmentQuestion.js                               │
│ │   ├── Answer.js                                           │
│ │   └── Action.js                                           │
│ └── API Routes                                              │
│     ├── /api/assessments/*                                  │
│     ├── /api/assessment-questions/*                         │
│     ├── /api/answers/*                                      │
│     └── /api/actions/*                                      │
├─────────────────────────────────────────────────────────────────┤
│ Database (SQL Server)                                          │
│ ├── Assessments                                               │
│ ├── Assessments_question                                      │
│ ├── Answer                                                    │
│ ├── Action                                                    │
│ └── Users                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Components

### 1. Assessment Controller (`assessmentController.js`)

**Purpose**: Manages assessment submissions, retrieval, and scoring.

#### Key Methods:

##### `getAllAssessments(req, res)`
- **Purpose**: Retrieve all assessments (Admin/Staff only)
- **Route**: `GET /api/assessments`
- **Authentication**: Required (Admin/Staff)
- **Response**: Array of all assessment records

##### `getAssessmentsByUserToken(req, res)`
- **Purpose**: Get assessments for authenticated user
- **Route**: `GET /api/assessments/me`
- **Authentication**: Required
- **Response**: User's assessment history with actions

```javascript
{
  "success": true,
  "data": [
    {
      "assessment_id": 1,
      "user_id": 123,
      "type": "ASSIST",
      "result_json": {
        "score": 15,
        "risk_level": "Trung bình",
        "responses": [...]
      },
      "create_at": "2024-01-15T10:00:00.000Z",
      "action": {
        "action_id": 2,
        "description": "Consider seeking professional help",
        "range": "moderate",
        "type": "recommendation"
      }
    }
  ],
  "count": 1,
  "message": "Assessments retrieved successfully"
}
```

##### `takeTestFromUser(req, res)`
- **Purpose**: Submit assessment test and get results
- **Route**: `POST /api/assessments/take-test`
- **Authentication**: Required
- **Input**: 
```javascript
{
  "type": "ASSIST",
  "responses": [
    {
      "question": "How often do you use alcohol?",
      "answer": "Weekly"
    }
  ]
}
```
- **Response**: Assessment results with recommended actions

##### `getAssessmentsByType(req, res)`
- **Purpose**: Filter assessments by type
- **Route**: `GET /api/assessments/type/:type`
- **Parameters**: `type` - Assessment type (ASSIST, CRAFFT)

##### `deleteAssessment(req, res)`
- **Purpose**: Delete assessment record
- **Route**: `DELETE /api/assessments/:id`
- **Authentication**: Required (Admin/Staff)

---

### 2. Assessment Question Controller (`assessmentQuestionController.js`)

**Purpose**: Manages assessment questions and their answer options.

#### Key Methods:

##### `getQuestionsByAssessmentType(req, res)`
- **Purpose**: Main feature - Get questions by assessment type
- **Route**: `GET /api/assessment-questions/type/:assessment_type`
- **Parameters**: `assessment_type` - ASSIST, CRAFFT, etc.
- **Response**: Questions with their answer options

```javascript
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
        }
      ]
    }
  ],
  "count": 1,
  "assessment_type": "ASSIST"
}
```

##### `createQuestionWithoptions(req, res)`
- **Purpose**: Create new question with answer options
- **Route**: `POST /api/assessment-questions`
- **Authentication**: Required (Admin/Staff)
- **Input**:
```javascript
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
    }
  ]
}
```

##### `updateQuestionWithoptions(req, res)`
- **Purpose**: Update question and its answers
- **Route**: `PUT /api/assessment-questions/:id`
- **Authentication**: Required (Admin/Staff)

##### Additional Methods:
- `getAllQuestionsWithoptions()` - Get all questions
- `getQuestionsByType()` - Filter by question type
- `getUniqueAssessmentTypes()` - Get available assessment types
- `getQuestionCountByType()` - Statistics for admin dashboard
- `deleteQuestionById()` - Remove question and answers

---

### 3. Answer Controller (`answerController.js`)

**Purpose**: Manages individual answer options for questions.

#### Key Methods:

##### `getAllAnswers(req, res)`
- **Purpose**: Get all answers with question details
- **Route**: `GET /api/answers`

##### `getAnswersByQuestionId(req, res)`
- **Purpose**: Get answers for specific question
- **Route**: `GET /api/answers/question/:questionId`

##### `createAnswer(req, res)`
- **Purpose**: Create single answer option
- **Route**: `POST /api/answers`
- **Authentication**: Required (Admin/Staff)

##### `bulkCreateAnswers(req, res)`
- **Purpose**: Create multiple answers at once
- **Route**: `POST /api/answers/bulk`
- **Authentication**: Required (Admin/Staff)

---

### 4. Action Controller (`actionController.js`)

**Purpose**: Manages recommendation actions based on assessment scores.

#### Key Methods:

##### `getAllActions(req, res)`
- **Purpose**: Get all action recommendations
- **Route**: `GET /api/actions`
- **Authentication**: Required (Admin/Staff)

##### `getActionsByType(req, res)`
- **Purpose**: Filter actions by type
- **Route**: `GET /api/actions/type/:type`

##### `createAction(req, res)`
- **Purpose**: Create new action recommendation
- **Route**: `POST /api/actions`
- **Input**:
```javascript
{
  "range": "high",
  "description": "Immediate professional intervention recommended",
  "type": "urgent_intervention"
}
```

---

## Frontend Components

### 1. Assessment Selection (`ChooseTypeExam.jsx`)

**Purpose**: Allows users to select which assessment to take.

#### Features:
- **Assessment Types Display**: ASSIST vs CRAFFT comparison
- **Interactive Selection**: Click-to-select interface
- **Information Cards**: Detailed descriptions of each assessment
- **Resource Links**: Links to official documentation
- **Confirmation Flow**: Prevents accidental selections

#### Key Functions:
```javascript
const handleConfirm = () => {
    if (selectedType) {
        navigate(`/exam/${selectedType.toLowerCase()}`);
    }
};
```

#### Assessment Type Data:
```javascript
const examTypes = [
    {
        id: 'ASSIST',
        title: 'Bài Đánh Giá ASSIST',
        subtitle: 'Công Cụ Sàng Lọc WHO',
        description: 'WHO comprehensive screening tool...',
        features: ['15 câu hỏi', 'Kết quả dựa trên bằng chứng', 'Xác định mức độ rủi ro'],
        icon: 'bi-clipboard-check'
    },
    {
        id: 'CRAFFT',
        title: 'Bài Đánh Giá CRAFFT 2.1',
        subtitle: 'Sức Khỏe Hành Vi Thanh Thiếu Niên',
        description: 'Behavioral health screening for adolescents...',
        features: ['Câu hỏi phù hợp với độ tuổi', 'Tập trung vào hành vi', 'Sàng lọc bảo mật'],
        icon: 'bi-person-hearts'
    }
];
```

---

### 2. Assessment Interface (`ExamPage.jsx`)

**Purpose**: Main assessment taking interface with dynamic question handling.

#### Key Features:
- **Dynamic Question Loading**: Loads questions from API
- **Multi-select Support**: Handles both single and multiple choice questions
- **Substance Replacement**: For ASSIST, replaces [chất] with selected substances
- **Real-time Scoring**: Calculates scores as user progresses
- **Answer Persistence**: Saves answers for final submission
- **Smart Navigation**: Skips questions based on previous answers

#### State Management:
```javascript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [result, setResult] = useState(null);
const [selectedOption, setSelectedOption] = useState(null);
const [selectedOptions, setSelectedOptions] = useState([]);
const [savedAnswers, setSavedAnswers] = useState({});
```

#### Key Functions:

##### Dynamic Question Text
```javascript
const getCurrentQuestionText = () => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    let questionText = currentQuestion.question;
    
    // For ASSIST, replace [chất] with selected substances
    if (type.toLowerCase() === 'assist' && currentQuestionIndex > 0) {
        const firstQuestionAnswer = savedAnswers[0];
        if (firstQuestionAnswer && firstQuestionAnswer.selectedOptions) {
            const selectedSubstances = firstQuestionAnswer.selectedOptions
                .filter(opt => opt.id !== 11)
                .map(opt => opt.text);
            
            if (selectedSubstances.length > 0) {
                const substanceText = selectedSubstances.join(' hoặc ');
                questionText = questionText.replace(/\[chất\]/g, substanceText);
            }
        }
    }
    
    return questionText;
};
```

##### Smart Scoring Logic
```javascript
const scoreToAdd = type.toLowerCase() === 'crafft' 
    ? (currentQuestionIndex >= 3 ? (selectedOption?.score || 0) : 0) // Only Part B counts for CRAFFT
    : (currentQuestionIndex === 0 && type.toLowerCase() === 'assist' 
        ? selectedOptions.reduce((sum, opt) => sum + (opt.score || 0), 0) // Multi-select scoring
        : (selectedOption?.score || 0)); // Single choice scoring
```

---

### 3. Assessment Results (`ResultPage.jsx`)

**Purpose**: Displays assessment results with risk level and recommendations.

#### Features:
- **Risk Level Display**: Visual risk level indicator
- **Score Breakdown**: Detailed scoring information
- **Recommendations**: Action items based on results
- **History Integration**: Saves results to user history
- **Shareable Results**: Option to share or print results

---

### 4. Assessment History (`AssessmentResultPage.jsx`)

**Purpose**: Shows user's assessment history and allows viewing past results.

#### Features:
- **Assessment List**: Table view of all assessments
- **Score Display**: Shows scores and risk levels
- **Date Filtering**: Filter by assessment date
- **Detail View**: View individual assessment details
- **Export Options**: Download assessment history

#### Key Functions:
```javascript
const fetchResults = async () => {
    const response = await axios.get('http://localhost:3000/api/assessments/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    setResults(response.data.data || []);
};

const getScore = (item) => {
    if (!item.result_json) return '';
    try {
        const result = typeof item.result_json === 'string' ? 
            JSON.parse(item.result_json) : item.result_json;
        return result && result.score !== undefined ? result.score : '';
    } catch {
        return '';
    }
};
```

---

### 5. Admin Assessment Management (`AssessmentListPage.jsx`)

**Purpose**: Administrative interface for managing assessments and viewing analytics.

#### Features:
- **Assessment Analytics**: Charts and statistics
- **Assessment List**: All user assessments with filtering
- **Risk Level Distribution**: Visual breakdown of risk levels
- **Search & Filter**: Find specific assessments
- **Sorting**: Sort by various criteria
- **Export Data**: Download assessment data

#### Key Components:
```javascript
// Filtering and pagination
const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.user_id?.toString().includes(searchTerm) ||
        assessment.assessment_id?.toString().includes(searchTerm) ||
        assessment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || assessment.type === filterType;
    
    return matchesSearch && matchesType;
});

// Statistics calculations
const totalAssessments = assessments.length;
const assistAssessments = assessments.filter(a => a.type === 'ASSIST').length;
const crafftAssessments = assessments.filter(a => a.type === 'CRAFFT').length;
```

---

### 6. Question Management Modals

#### ASSIST Question Modal (`AssistQuestionModal.jsx`)
**Purpose**: Admin interface for creating/editing ASSIST questions.

#### CRAFFT Question Modal (`CrafftQuestionModal.jsx`)
**Purpose**: Admin interface for creating/editing CRAFFT questions.

Both modals provide:
- **Form Interface**: Complete question editing
- **Option Management**: Add/remove answer options
- **Validation**: Input validation and error handling
- **API Integration**: Create/update questions via API

---

## Assessment Types

### 1. ASSIST (Alcohol, Smoking and Substance Involvement Screening Test)

#### Overview
- **Developer**: World Health Organization (WHO)
- **Purpose**: Comprehensive substance use screening
- **Target Population**: Adults (18+)
- **Questions**: 15 questions covering multiple substances
- **Scoring**: 0-100+ scale with substance-specific risk levels

#### Question Structure
1. **Question 1**: Multi-select substance use history
2. **Questions 2-15**: Single-choice questions with dynamic substance replacement

#### Substances Covered
- Alcohol
- Cannabis (marijuana)
- Cocaine
- Prescription stimulants
- Methamphetamine
- Inhalants
- Sedatives/Benzodiazepines
- Hallucinogens
- Street opioids
- Prescription opioids
- Other substances

#### Risk Levels
- **Low Risk (0-3)**: No intervention required
- **Moderate Risk (4-26)**: Brief intervention
- **High Risk (27+)**: Intensive treatment

#### Data Structure (`Assist_Data.jsx`)
```javascript
export const Assist_Data = {
    questions: [],
    isLoading: false,
    error: null
};

// API-based loading
export const fetchAssistQuestions = async () => {
    const response = await axios.get('http://localhost:3000/api/assessment-questions/type/ASSIST');
    // Transform and store questions
};

// Risk assessment
export const assessRiskLevel = async (score, isCannabis = false) => {
    // Fetch dynamic actions from API
    // Calculate risk level based on score ranges
};
```

---

### 2. CRAFFT 2.1 (Behavioral Health Screening)

#### Overview
- **Developer**: Children's Hospital Boston
- **Purpose**: Behavioral health screening for adolescents
- **Target Population**: Adolescents and young adults
- **Questions**: 9 questions (3 Part A + 6 Part B)
- **Scoring**: Part A (0-3), Part B (0-6), combined risk assessment

#### Question Structure

##### Part A (Substance Use Screening)
1. Alcohol use in past 12 months
2. Cannabis use in past 12 months  
3. Other substance use in past 12 months

##### Part B (CRAFFT Questions)
4. **[C]** Car - Riding with someone under the influence
5. **[R]** Relax - Using to relax or feel better
6. **[A]** Alone - Using when alone
7. **[F]** Forget - Memory problems from use
8. **[F]** Family/Friends - Concerns from others
9. **[T]** Trouble - Getting into trouble while using

#### Risk Assessment Logic
```javascript
export const assessRiskLevel = (totalScore, userAnswers = {}) => {
    const partBScore = totalScore;
    const hasSubstanceUse = hasSubstanceUseInPartA(userAnswers);
    const hasCarRiskFactor = hasCarRisk(userAnswers);

    if (!hasSubstanceUse && partBScore === 0) {
        return "Thấp"; // LOW RISK
    } else if ((!hasSubstanceUse && hasCarRiskFactor) || (hasSubstanceUse && partBScore < 2)) {
        return "Trung bình"; // MEDIUM RISK
    } else if (hasSubstanceUse && partBScore >= 2) {
        return "Cao"; // HIGH RISK
    }
    return "Trung bình";
};
```

#### Data Structure (`Crafft-Data.jsx`)
```javascript
export const Crafft_Data = {
    questions: [],
    isLoading: false,
    error: null
};

// Helper functions
export const getCrafftPartAScore = (userAnswers) => { /* Calculate Part A score */ };
export const getCrafftPartBScore = (userAnswers) => { /* Calculate Part B score */ };
export const hasSubstanceUseInPartA = (userAnswers) => { /* Check substance use */ };
export const hasCarRisk = (userAnswers) => { /* Check car safety risk */ };
```

---

## Data Structures

### 1. Assessment Entity
```sql
CREATE TABLE Assessments (
    assessment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    type NVARCHAR(50),
    result_json NVARCHAR(MAX),
    create_at DATETIME,
    action_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (action_id) REFERENCES Action(action_id)
);
```

**TypeORM Entity Structure:**
```javascript
const Assessment = new EntitySchema({
    name: "Assessment",
    tableName: "Assessments",
    columns: {
        assessment_id: { type: "int", primary: true, generated: true },
        user_id: { type: "int", nullable: true },
        type: { type: "nvarchar", length: 50, nullable: true },
        result_json: { type: "nvarchar", length: "MAX", nullable: true },
        create_at: { type: "datetime", nullable: true },
        action_id: { type: "int", nullable: true }
    },
    relations: {
        user: { type: "many-to-one", target: "User" },
        action: { type: "many-to-one", target: "Action" }
    }
});
```

### 2. Assessment Question Entity
```sql
CREATE TABLE Assessments_question (
    assessment_question_id INT IDENTITY(1,1) PRIMARY KEY,
    question NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    note NVARCHAR(MAX),
    assessment_type NVARCHAR(50) NOT NULL,
    multiSelect BIT DEFAULT 0,
    allowMultiple BIT DEFAULT 0,
    category NVARCHAR(50),
    substance NVARCHAR(50),
    letter NVARCHAR(10)
);
```

**Question Types:**
- `multiple_choice` - Standard multiple choice
- `multi-select` - Allow multiple selections
- `yes_no` - Simple yes/no questions
- `scale` - Likert scale questions

**Assessment Types:**
- `ASSIST` - WHO ASSIST assessment
- `CRAFFT` - CRAFFT 2.1 assessment
- `CAGE` - CAGE alcohol screening (future)

### 3. Answer Entity
```sql
CREATE TABLE Answer (
    answer_id INT IDENTITY(1,1) PRIMARY KEY,
    assessment_question_id INT NOT NULL,
    option_id INT,
    text NVARCHAR(MAX) NOT NULL,
    score INT DEFAULT 0,
    answer_order INT DEFAULT 1,
    FOREIGN KEY (assessment_question_id) REFERENCES Assessments_question(assessment_question_id)
);
```

### 4. Action Entity
```sql
CREATE TABLE Action (
    action_id INT IDENTITY(1,1) PRIMARY KEY,
    range_value INT NOT NULL, -- Minimum score for this action
    description NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL
);
```

**Action Types:**
- `recommendation` - General recommendations
- `intervention` - Professional intervention needed
- `urgent_intervention` - Immediate help required
- `low_risk` - Minimal intervention
- `moderate_risk` - Brief intervention
- `high_risk` - Intensive treatment

---

## API Documentation

### Assessment APIs

#### 1. Take Assessment Test
```http
POST /api/assessments/take-test
Authorization: Bearer <token>
Content-Type: application/json

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
      "result_json": {
        "score": 12,
        "riskLevel": "Trung bình",
        "responses": [...]
      }
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

#### 2. Get User Assessment History
```http
GET /api/assessments/me
Authorization: Bearer <token>
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

### Assessment Question APIs

#### 3. Get Questions by Assessment Type
```http
GET /api/assessment-questions/type/ASSIST
```

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
  "message": "Assessment questions retrieved successfully"
}
```

#### 4. Create Assessment Question
```http
POST /api/assessment-questions
Authorization: Bearer <token>
Content-Type: application/json

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

### Action APIs

#### 5. Get All Actions
```http
GET /api/actions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "action_id": 1,
      "range": 0,
      "description": "Your risk level is low. Continue your current healthy choices.",
      "type": "low_risk"
    },
    {
      "action_id": 2,
      "range": 4,
      "description": "Consider seeking professional help",
      "type": "moderate_risk"
    },
    {
      "action_id": 3,
      "range": 27,
      "description": "Immediate professional intervention recommended",
      "type": "high_risk"
    }
  ],
  "message": "All actions retrieved successfully"
}
```

---

## User Journey

### 1. Assessment Selection Flow

```
User Dashboard → Choose Assessment → Assessment Interface → Results → History
      ↓               ↓                    ↓              ↓         ↓
  [/test]      [/choosetype]        [/exam/:type]    [/result]  [/assessment-history]
```

#### Step 1: Assessment Selection (`/choosetype`)
- User views available assessments (ASSIST vs CRAFFT)
- Reads descriptions and features
- Selects appropriate assessment type
- Confirms selection

#### Step 2: Assessment Taking (`/exam/:type`)
- Questions loaded dynamically from API
- Progress tracking (question x of y)
- Answer selection and validation
- Special handling for multi-select questions
- Dynamic text replacement (ASSIST [chất] feature)
- Real-time score calculation

#### Step 3: Results Display (`/result`)
- Final score calculation
- Risk level determination
- Action recommendations
- Option to retake or view history
- Results saved to database

#### Step 4: History Access (`/assessment-history`)
- View all past assessments
- Filter by date or type
- View detailed results
- Export functionality

### 2. Admin Management Flow

```
Admin Dashboard → Assessment Management → Question Management → Analytics
       ↓                    ↓                    ↓               ↓
[/admin/dashboard]  [/admin/assessments]  [Question Modals]  [Charts & Stats]
```

#### Admin Capabilities:
- View all user assessments
- Create/edit assessment questions
- Manage answer options
- Configure risk level actions
- Export assessment data
- View analytics and reports

---

## Scoring & Risk Assessment

### 1. ASSIST Scoring Algorithm

#### Score Calculation:
```javascript
// Question 1 (Multi-select): Sum of all selected substance scores
const q1Score = selectedOptions.reduce((sum, opt) => sum + opt.score, 0);

// Questions 2-15: Individual question scores
const questionScore = selectedOption.score;

// Total score: Sum of all question scores
const totalScore = q1Score + q2Score + ... + q15Score;
```

#### Risk Level Determination:
```javascript
const assessRiskLevel = async (score, isCannabis = false) => {
    // Fetch dynamic actions from API
    const actions = await fetchActions();
    
    // Find appropriate action based on score
    const selectedAction = actions.find(action => score >= action.range);
    
    // Extract risk level from action
    if (selectedAction.description.includes('Thấp')) return "Thấp";
    if (selectedAction.description.includes('Trung bình')) return "Trung bình";
    if (selectedAction.description.includes('Cao')) return "Cao";
    
    // Fallback ranges
    if (isCannabis) {
        if (score <= 4) return "Thấp";
        if (score <= 26) return "Trung bình";
        return "Cao";
    } else {
        if (score <= 3) return "Thấp";
        if (score <= 26) return "Trung bình";
        return "Cao";
    }
};
```

### 2. CRAFFT 2.1 Scoring Algorithm

#### Score Calculation:
```javascript
// Part A (Questions 1-3): Track substance use (0-3)
const partAScore = getCrafftPartAScore(userAnswers);

// Part B (Questions 4-9): CRAFFT score (0-6)
const partBScore = getCrafftPartBScore(userAnswers);

// Only Part B contributes to final score
const finalScore = partBScore;
```

#### Risk Level Determination:
```javascript
const assessRiskLevel = (totalScore, userAnswers = {}) => {
    const partBScore = totalScore;
    const hasSubstanceUse = hasSubstanceUseInPartA(userAnswers);
    const hasCarRiskFactor = hasCarRisk(userAnswers);

    // CRAFFT 2.1 Clinical Guidelines
    if (!hasSubstanceUse && partBScore === 0) {
        // LOW RISK: No use + CRAFFT = 0
        return "Thấp";
    } else if ((!hasSubstanceUse && hasCarRiskFactor) || (hasSubstanceUse && partBScore < 2)) {
        // MEDIUM RISK: No use + CAR risk OR Any use + CRAFFT < 2
        return "Trung bình";
    } else if (hasSubstanceUse && partBScore >= 2) {
        // HIGH RISK: Any use + CRAFFT >= 2
        return "Cao";
    }
    return "Trung bình";
};
```

### 3. Clinical Interpretations

#### ASSIST Risk Levels:
- **Low (0-3)**: No intervention required
  - *Action*: Provide information about risks
  - *Follow-up*: None required

- **Moderate (4-26)**: Brief intervention
  - *Action*: Brief counseling session
  - *Follow-up*: Monitor progress

- **High (27+)**: Intensive treatment
  - *Action*: Referral to specialist
  - *Follow-up*: Regular monitoring

#### CRAFFT Risk Levels:
- **Low**: No substance use + CRAFFT = 0
  - *Action*: Praise and encourage; provide risk information
  - *Follow-up*: Routine screening

- **Medium**: Car risk OR substance use + CRAFFT < 2
  - *Action*: Brief counseling; provide risk information
  - *Follow-up*: Follow-up visit

- **High**: Substance use + CRAFFT ≥ 2
  - *Action*: Brief counseling; consider referral
  - *Follow-up*: Follow-up visit and possible treatment referral

---

## Database Schema

### Complete Schema Structure:

```sql
-- Users table (existing)
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) DEFAULT 'member',
    status NVARCHAR(50) DEFAULT 'active',
    img_link NVARCHAR(500),
    date_create DATETIME DEFAULT GETDATE()
);

-- Action table
CREATE TABLE Action (
    action_id INT IDENTITY(1,1) PRIMARY KEY,
    range_value INT NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL
);

-- Assessment Questions table
CREATE TABLE Assessments_question (
    assessment_question_id INT IDENTITY(1,1) PRIMARY KEY,
    question NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    note NVARCHAR(MAX),
    assessment_type NVARCHAR(50) NOT NULL,
    multiSelect BIT DEFAULT 0,
    allowMultiple BIT DEFAULT 0,
    category NVARCHAR(50),
    substance NVARCHAR(50),
    letter NVARCHAR(10)
);

-- Answer options table
CREATE TABLE Answer (
    answer_id INT IDENTITY(1,1) PRIMARY KEY,
    assessment_question_id INT NOT NULL,
    option_id INT,
    text NVARCHAR(MAX) NOT NULL,
    score INT DEFAULT 0,
    answer_order INT DEFAULT 1,
    FOREIGN KEY (assessment_question_id) REFERENCES Assessments_question(assessment_question_id) ON DELETE CASCADE
);

-- Assessments table
CREATE TABLE Assessments (
    assessment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    type NVARCHAR(50),
    result_json NVARCHAR(MAX),
    create_at DATETIME DEFAULT GETDATE(),
    action_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES Action(action_id)
);

-- Indexes for performance
CREATE INDEX IX_Assessments_UserType ON Assessments(user_id, type);
CREATE INDEX IX_Assessments_CreateDate ON Assessments(create_at);
CREATE INDEX IX_AssessmentQuestion_Type ON Assessments_question(assessment_type);
CREATE INDEX IX_Answer_QuestionId ON Answer(assessment_question_id);
```

### Sample Data:

#### Action Records:
```sql
INSERT INTO Action (range_value, description, type) VALUES
(0, 'Mức độ rủi ro thấp. Tiếp tục duy trì lối sống lành mạnh hiện tại.', 'low_risk'),
(4, 'Mức độ rủi ro trung bình. Nên tham khảo ý kiến chuyên gia.', 'moderate_risk'),
(27, 'Mức độ rủi ro cao. Cần can thiệp chuyên nghiệp ngay lập tức.', 'high_risk');
```

#### ASSIST Question Example:
```sql
INSERT INTO Assessments_question (question, type, assessment_type, note, multiSelect, allowMultiple, category, substance) VALUES
('Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất nào sau đây?', 'multi-select', 'ASSIST', 'Có thể chọn nhiều đáp án', 1, 1, 'substance_use', 'multiple');

INSERT INTO Answer (assessment_question_id, option_id, text, score, answer_order) VALUES
(1, 1, 'Cần sa (marijuana, pot, cỏ, hash, v.v.)', 3, 1),
(1, 2, 'Cocaine (coke, crack, v.v.)', 3, 2),
(1, 11, 'Tôi chưa từng sử dụng bất kỳ chất nào', 0, 11);
```

---

## Component Reference

### Assessment Components

#### 1. `ChooseTypeExam`
- **Path**: `/src/pages/ChooseTypeExam.jsx`
- **Purpose**: Assessment type selection
- **Props**: None
- **State**: `selectedType`
- **Navigation**: `/exam/:type`

#### 2. `ExamPage`
- **Path**: `/src/pages/ExamPage.jsx`
- **Purpose**: Assessment taking interface
- **Props**: URL parameter `:type`
- **State**: Multiple (questions, answers, scores)
- **Navigation**: `/result`

#### 3. `ResultPage`
- **Path**: `/src/pages/ResultPage.jsx`
- **Purpose**: Display assessment results
- **Props**: Location state (results)
- **Features**: Score display, risk level, recommendations

#### 4. `AssessmentResultPage`
- **Path**: `/src/pages/AssessmentResultPage.jsx`
- **Purpose**: Assessment history view
- **Features**: Table view, filtering, pagination

#### 5. `AssessmentListPage` (Admin)
- **Path**: `/src/pages/admin/AssessmentListPage.jsx`
- **Purpose**: Admin assessment management
- **Features**: Analytics, charts, data export

### Question Management Components

#### 6. `AssistQuestionModal`
- **Path**: `/src/components/AssistQuestionModal.jsx`
- **Purpose**: ASSIST question creation/editing
- **Props**: `show`, `onClose`, `question`, `mode`, `onSave`
- **Modes**: `view`, `edit`, `create`

#### 7. `CrafftQuestionModal`
- **Path**: `/src/components/CrafftQuestionModal.jsx`
- **Purpose**: CRAFFT question creation/editing
- **Props**: Same as AssistQuestionModal
- **Additional**: Category and letter fields

### Data Source Components

#### 8. `Assist_Data.jsx`
- **Path**: `/src/QuizData/Assist_Data.jsx`
- **Purpose**: ASSIST data management
- **Functions**: `fetchAssistQuestions()`, `assessRiskLevel()`

#### 9. `Crafft-Data.jsx`
- **Path**: `/src/QuizData/Crafft-Data.jsx`
- **Purpose**: CRAFFT data management
- **Functions**: Multiple helper functions for scoring

---

## Configuration

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=SWP391-demo
DB_USER=SA
DB_PASSWORD=12345

# JWT Configuration
JWT_SECRET=swp391-super-secret-jwt-key-2025-secure

# API Configuration
API_BASE_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3000
```

### Assessment Configuration

#### Default Settings:
```javascript
// Assessment Types
const ASSESSMENT_TYPES = {
    ASSIST: 'ASSIST',
    CRAFFT: 'CRAFFT',
    CAGE: 'CAGE' // Future implementation
};

// Risk Levels
const RISK_LEVELS = {
    LOW: 'Thấp',
    MODERATE: 'Trung bình', 
    HIGH: 'Cao'
};

// Question Types
const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    MULTI_SELECT: 'multi-select',
    YES_NO: 'yes_no',
    SCALE: 'scale'
};
```

### API Endpoints Summary:

#### Assessment Management:
- `GET /api/assessments` - List all assessments (Admin)
- `GET /api/assessments/me` - User's assessment history
- `POST /api/assessments/take-test` - Submit assessment
- `GET /api/assessments/type/:type` - Filter by assessment type
- `DELETE /api/assessments/:id` - Delete assessment (Admin)

#### Question Management:
- `GET /api/assessment-questions/type/:type` - Get questions by type
- `POST /api/assessment-questions` - Create question (Admin)
- `PUT /api/assessment-questions/:id` - Update question (Admin)
- `DELETE /api/assessment-questions/:id` - Delete question (Admin)

#### Action Management:
- `GET /api/actions` - List all actions (Admin)
- `GET /api/actions/type/:type` - Filter actions by type
- `POST /api/actions` - Create action (Admin)
- `PUT /api/actions/:id` - Update action (Admin)
- `DELETE /api/actions/:id` - Delete action (Admin)

### Frontend Routes:

```javascript
// Assessment Routes
/test              → TestPage (Assessment landing)
/choosetype        → ChooseTypeExam (Assessment selection)
/exam/:type        → ExamPage (Assessment interface)
/result            → ResultPage (Results display)
/assessment-history → AssessmentResultPage (History view)

// Admin Routes
/admin/assessments → AssessmentListPage (Assessment management)
```

---

## Security Considerations

### 1. Authentication & Authorization
- All assessment APIs require valid JWT tokens
- Role-based access control for admin functions
- User can only access their own assessment data

### 2. Data Validation
- Input validation on all API endpoints
- SQL injection prevention through TypeORM
- XSS protection on frontend forms

### 3. Privacy Protection
- Assessment results are personal health information
- No sharing of individual results without consent
- Secure storage of assessment data

### 4. Rate Limiting
- Prevent abuse of assessment endpoints
- Limit assessment submission frequency
- Monitor for unusual usage patterns

---

## Troubleshooting

### Common Issues:

#### 1. Questions Not Loading
```javascript
// Check API endpoint
console.log('Fetching from:', 'http://localhost:3000/api/assessment-questions/type/ASSIST');

// Verify data structure
console.log('Questions loaded:', Assist_Data.questions);
```

#### 2. Scoring Inconsistencies
```javascript
// Debug score calculation
console.log('Current score:', currentScore);
console.log('Score to add:', scoreToAdd);
console.log('Final score:', finalScore);
```

#### 3. Risk Level Issues
```javascript
// Check risk assessment
console.log('Score:', score);
console.log('Actions:', actions);
console.log('Selected action:', selectedAction);
console.log('Risk level:', riskLevel);
```

### Performance Optimization:

#### 1. Question Caching
- Cache questions in localStorage
- Implement question prefetching
- Use React.memo for question components

#### 2. Database Optimization
- Index on frequently queried fields
- Optimize JSON storage in result_json
- Use connection pooling

#### 3. Frontend Optimization
- Lazy load assessment components
- Implement virtual scrolling for long lists
- Optimize re-renders with useCallback

---

This comprehensive documentation covers the entire Assessment System in the SWP391 Drug Prevention Platform. The system provides a robust, scalable solution for substance use screening with professional-grade assessment tools, real-time scoring, and comprehensive analytics.