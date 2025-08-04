# SWP391 Assessment System - Quick Reference Guide

## Overview
The Assessment System is a comprehensive drug screening platform implementing WHO ASSIST and CRAFFT 2.1 standardized assessment tools for substance use disorder screening.

## 🔍 Assessment Types

### 1. ASSIST (WHO Screening Tool)
- **Target**: Adults (18+)
- **Questions**: 15 questions
- **Substances**: 10 categories (alcohol, cannabis, cocaine, etc.)
- **Scoring**: 0-100+ scale
- **Special Feature**: Dynamic substance replacement in questions

### 2. CRAFFT 2.1 (Adolescent Screening)
- **Target**: Adolescents and young adults
- **Structure**: Part A (3 questions) + Part B (6 questions)
- **Scoring**: Part B only (0-6 scale)
- **Focus**: Behavioral health screening

## 🏗️ System Architecture

```
Frontend (React) ←→ Backend (Express + TypeORM) ←→ Database (SQL Server)
     ↓                        ↓                           ↓
Assessment Pages         Controllers              Assessment Tables
Question Modals         API Endpoints            Question/Answer Data
Data Sources           Entity Models            User Results
```

## 📊 Key Components

### Backend Controllers
- **assessmentController.js**: Assessment submission & retrieval
- **assessmentQuestionController.js**: Question management
- **answerController.js**: Answer option management
- **actionController.js**: Risk level recommendations

### Frontend Pages
- **ChooseTypeExam.jsx**: Assessment selection
- **ExamPage.jsx**: Assessment taking interface
- **ResultPage.jsx**: Results display
- **AssessmentResultPage.jsx**: History view
- **AssessmentListPage.jsx**: Admin management

### Admin Components
- **AssistQuestionModal.jsx**: ASSIST question editor
- **CrafftQuestionModal.jsx**: CRAFFT question editor

## 🔄 User Journey

```
1. Select Assessment Type → 2. Take Assessment → 3. View Results → 4. Check History
   [/choosetype]           [/exam/:type]        [/result]       [/assessment-history]
```

## 📡 Key API Endpoints

### Assessment Management
```
GET    /api/assessments/me              - User's assessment history
POST   /api/assessments/take-test       - Submit assessment
GET    /api/assessments                 - All assessments (Admin)
DELETE /api/assessments/:id             - Delete assessment (Admin)
```

### Question Management
```
GET    /api/assessment-questions/type/:type  - Get questions by type
POST   /api/assessment-questions             - Create question (Admin)
PUT    /api/assessment-questions/:id         - Update question (Admin)
DELETE /api/assessment-questions/:id         - Delete question (Admin)
```

### Action Management
```
GET    /api/actions                     - List all actions (Admin)
POST   /api/actions                     - Create action (Admin)
PUT    /api/actions/:id                 - Update action (Admin)
```

## 💾 Database Schema

### Core Tables
- **Assessments**: User assessment results
- **Assessments_question**: Question bank
- **Answer**: Answer options for questions
- **Action**: Risk level recommendations
- **Users**: User accounts (existing)

### Relationships
```
Users (1) ←→ (*) Assessments ←→ (1) Actions
Assessments_question (1) ←→ (*) Answer
```

## 🎯 Scoring Logic

### ASSIST Scoring
```javascript
// Multi-select question 1 + Single choice questions 2-15
totalScore = q1Score + q2Score + ... + q15Score;

// Risk Levels:
// Low (0-3): No intervention
// Moderate (4-26): Brief intervention  
// High (27+): Intensive treatment
```

### CRAFFT Scoring
```javascript
// Only Part B questions count for score
partBScore = q4Score + q5Score + q6Score + q7Score + q8Score + q9Score;

// Risk Assessment:
// Low: No substance use + CRAFFT = 0
// Medium: Car risk OR substance use + CRAFFT < 2
// High: Substance use + CRAFFT ≥ 2
```

## 🚀 Key Features

### Dynamic Question System
- **API-driven**: Questions loaded from database
- **Substance Replacement**: ASSIST replaces [chất] with selected substances
- **Multi-select Support**: First ASSIST question allows multiple selections
- **Conditional Logic**: Skip questions based on previous answers

### Real-time Scoring
- **Progressive Calculation**: Score calculated as user progresses
- **Risk Level Assessment**: Automatic risk level determination
- **Action Recommendations**: Dynamic recommendations based on scores

### Admin Management
- **Question Editor**: Visual interface for creating/editing questions
- **Answer Management**: Add/remove answer options with scores
- **Assessment Analytics**: Charts and statistics for admin dashboard
- **Data Export**: Export assessment data for analysis

### Security & Privacy
- **JWT Authentication**: Secure API access
- **Role-based Access**: Different permissions for users/staff/admin
- **Data Privacy**: User data isolation and protection
- **Input Validation**: Comprehensive validation on all inputs

## 📱 Frontend Features

### Assessment Interface
- **Progress Tracking**: Visual progress indicator
- **Answer Validation**: Prevents incomplete submissions
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Screen reader compatible

### Results Display
- **Risk Level Visualization**: Color-coded risk indicators
- **Score Breakdown**: Detailed scoring information
- **Recommendations**: Personalized action items
- **History Integration**: Links to assessment history

### Admin Dashboard
- **Assessment Overview**: Total counts and statistics
- **Risk Distribution**: Visual breakdown of risk levels
- **Search & Filter**: Find specific assessments
- **Sorting Options**: Sort by various criteria

## 🔧 Configuration

### Environment Setup
```bash
# Backend (Port 3000)
DB_HOST=localhost
DB_NAME=SWP391-demo
JWT_SECRET=swp391-super-secret-jwt-key-2025-secure

# Frontend (Vite)
REACT_APP_API_URL=http://localhost:3000
```

### Assessment Types
```javascript
const ASSESSMENT_TYPES = {
    ASSIST: 'ASSIST',     // WHO screening tool
    CRAFFT: 'CRAFFT',     // Adolescent screening
    CAGE: 'CAGE'          // Future implementation
};
```

## 🎨 Styling & UI

### Design System
- **Bootstrap 5**: Primary UI framework
- **SCSS**: Custom styling with variables
- **Responsive Grid**: Mobile-first design
- **Color Coding**: Risk levels have distinct colors

### Assessment Pages
- **Modern Interface**: Clean, professional design
- **Progress Indicators**: Visual progress tracking
- **Interactive Elements**: Smooth transitions and animations
- **Accessibility**: High contrast and keyboard navigation

## 🔍 Troubleshooting

### Common Issues

#### Questions Not Loading
```javascript
// Check API endpoint
console.log('API Response:', response.data);
// Verify data transformation
console.log('Transformed Questions:', transformedQuestions);
```

#### Scoring Problems
```javascript
// Debug score calculation
console.log('Current Score:', currentScore);
console.log('Score Addition:', scoreToAdd);
console.log('Final Score:', finalScore);
```

#### Risk Level Issues
```javascript
// Check risk assessment logic
console.log('Score:', score);
console.log('Risk Level:', riskLevel);
console.log('Action:', recommendedAction);
```

## 📈 Performance Optimization

### Frontend
- **Question Caching**: Cache loaded questions
- **Component Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Load components on demand

### Backend
- **Database Indexing**: Optimized queries with indexes
- **Connection Pooling**: Efficient database connections
- **JSON Storage**: Optimized result storage

### Database
```sql
-- Performance indexes
CREATE INDEX IX_Assessments_UserType ON Assessments(user_id, type);
CREATE INDEX IX_AssessmentQuestion_Type ON Assessments_question(assessment_type);
CREATE INDEX IX_Answer_QuestionId ON Answer(assessment_question_id);
```

## 📚 Documentation Files

### Complete Documentation
- **ASSESSMENT_SYSTEM_DOCUMENTATION.md**: Comprehensive system documentation
- **API_DOCUMENTATION.md**: Complete API reference
- **ASSESSMENT_SUMMARY.md**: This quick reference guide

### File Structure
```
Backend/SWP391-SE1861-04-SU25/
├── ASSESSMENT_SYSTEM_DOCUMENTATION.md    (Complete documentation)
├── ASSESSMENT_SUMMARY.md                 (Quick reference)
├── API_DOCUMENTATION.md                  (API reference)
├── Controller/
│   ├── assessmentController.js
│   ├── assessmentQuestionController.js
│   ├── answerController.js
│   └── actionController.js
└── src/entities/
    ├── Assessment.js
    ├── AssessmentQuestion.js
    ├── Answer.js
    └── Action.js

FrontEnd/SWP391-SE1861-04-SU25/
├── src/pages/
│   ├── ChooseTypeExam.jsx
│   ├── ExamPage.jsx
│   ├── ResultPage.jsx
│   ├── AssessmentResultPage.jsx
│   └── admin/AssessmentListPage.jsx
├── src/components/
│   ├── AssistQuestionModal.jsx
│   └── CrafftQuestionModal.jsx
└── src/QuizData/
    ├── Assist_Data.jsx
    └── Crafft-Data.jsx
```

## 🚨 Security Notes

### Authentication
- All assessment APIs require JWT authentication
- Role-based access control for admin functions
- User isolation - can only access own data

### Data Protection
- Assessment results are sensitive health information
- Secure storage with SQL Server
- Input validation and sanitization

### Privacy Compliance
- No sharing of individual results without consent
- Data retention policies should be implemented
- Audit logging for admin actions

---

For detailed implementation details, API specifications, and complete code examples, refer to the **ASSESSMENT_SYSTEM_DOCUMENTATION.md** file.