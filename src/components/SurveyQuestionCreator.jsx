import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaCopy } from "react-icons/fa";
import { MdPreview } from "react-icons/md";
// import "../../styles/SurveyQuestionCreator.scss";

const SurveyQuestionCreator = ({
  survey,
  onSave,
  onCancel,
  onPreview,
  isEditing = false
}) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    question: "",
    options: ["", ""]
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    console.log("SurveyQuestionCreator - useEffect triggered, survey:", survey);
    if (survey?.questions_json) {
      try {
        const parsed = JSON.parse(survey.questions_json);
        console.log("SurveyQuestionCreator - Parsed questions from JSON:", parsed);
        setQuestions(parsed.questions || []);
      } catch (error) {
        console.error("SurveyQuestionCreator - Error parsing survey questions:", error);
        setQuestions([]);
      }
    } else {
      console.log("SurveyQuestionCreator - No questions_json found, setting empty array");
      setQuestions([]);
    }
  }, [survey]);

  const generateNewId = () => {
    const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 0;
    const newId = maxId + 1;
    console.log("SurveyQuestionCreator - Generated new ID:", newId, "from max ID:", maxId);
    return newId;
  };

  const handleAddQuestion = () => {
    console.log("SurveyQuestionCreator - Adding new question");
    const newQuestion = {
      id: generateNewId(),
      question: "",
      options: ["", ""]
    };
    console.log("SurveyQuestionCreator - New question object:", newQuestion);
    setCurrentQuestion(newQuestion);
    setEditingIndex(questions.length);
    console.log("SurveyQuestionCreator - Set editing index to:", questions.length);
  };

  const handleEditQuestion = (index) => {
    console.log("SurveyQuestionCreator - Editing question at index:", index);
    console.log("SurveyQuestionCreator - Question to edit:", questions[index]);
    setCurrentQuestion({ ...questions[index] });
    setEditingIndex(index);
  };

  const handleSaveQuestion = () => {
    console.log("SurveyQuestionCreator - Saving question:", currentQuestion);

    if (!currentQuestion.question.trim()) {
      alert("Please enter a question text.");
      return;
    }

    if (currentQuestion.options.filter(opt => opt.trim()).length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    const updatedQuestions = [...questions];

    if (editingIndex !== null) {
      // Editing existing question
      console.log("SurveyQuestionCreator - Editing existing question at index:", editingIndex);
      updatedQuestions[editingIndex] = {
        ...currentQuestion,
        options: currentQuestion.options.filter(opt => opt.trim())
      };
    } else {
      // Adding new question
      console.log("SurveyQuestionCreator - Adding new question to array");
      updatedQuestions.push({
        ...currentQuestion,
        options: currentQuestion.options.filter(opt => opt.trim())
      });
    }

    console.log("SurveyQuestionCreator - Updated questions array:", updatedQuestions);
    setQuestions(updatedQuestions);
    setCurrentQuestion({
      id: generateNewId(),
      question: "",
      options: ["", ""]
    });
    setEditingIndex(null);
    console.log("SurveyQuestionCreator - Question saved, reset form");
  };

  const handleCancelEdit = () => {
    setCurrentQuestion({
      id: generateNewId(),
      question: "",
      options: ["", ""]
    });
    setEditingIndex(null);
  };

  const handleDeleteQuestion = (index) => {
    console.log("SurveyQuestionCreator - Deleting question at index:", index);
    if (window.confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      console.log("SurveyQuestionCreator - Questions after deletion:", updatedQuestions);
      setQuestions(updatedQuestions);
    }
  };

  const handleDuplicateQuestion = (index) => {
    console.log("SurveyQuestionCreator - Duplicating question at index:", index);
    const questionToDuplicate = questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: generateNewId(),
      question: `${questionToDuplicate.question} (Copy)`
    };
    console.log("SurveyQuestionCreator - Duplicated question:", duplicatedQuestion);
    setQuestions([...questions, duplicatedQuestion]);
  };

  const handleQuestionChange = (value) => {
    console.log("SurveyQuestionCreator - Question text changed to:", value);
    setCurrentQuestion({
      ...currentQuestion,
      question: value
    });
  };

  const handleOptionChange = (index, value) => {
    console.log("SurveyQuestionCreator - Option", index, "changed to:", value);
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleAddOption = () => {
    console.log("SurveyQuestionCreator - Adding new option");
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""]
    });
  };

  const handleRemoveOption = (index) => {
    console.log("SurveyQuestionCreator - Removing option at index:", index);
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions
      });
    } else {
      console.log("SurveyQuestionCreator - Cannot remove option, minimum 2 required");
    }
  };

  const handleSaveSurvey = () => {
    console.log("🔄 SurveyQuestionCreator - handleSaveSurvey called");
    console.log("🔄 SurveyQuestionCreator - Current questions:", questions);
    console.log("🔄 SurveyQuestionCreator - Current survey prop:", survey);

    if (questions.length === 0) {
      console.log("❌ SurveyQuestionCreator - No questions to save");
      alert("Please add at least one question to the survey.");
      return;
    }

    // Validate questions before saving
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question.trim()) {
        console.log("❌ SurveyQuestionCreator - Question", i + 1, "has empty text");
        alert(`Question ${i + 1} cannot be empty`);
        return;
      }
      if (!question.options || question.options.length < 2) {
        console.log("❌ SurveyQuestionCreator - Question", i + 1, "has insufficient options");
        alert(`Question ${i + 1} must have at least 2 options`);
        return;
      }
    }

    const surveyData = {
      ...survey,
      questions: { questions } // Use the format expected by the API
    };

    console.log("✅ SurveyQuestionCreator - Validation passed");
    console.log("✅ SurveyQuestionCreator - Survey data to save:", surveyData);
    console.log("✅ SurveyQuestionCreator - Questions structure:", surveyData.questions);
    console.log("✅ SurveyQuestionCreator - Number of questions:", surveyData.questions.questions.length);
    console.log("✅ SurveyQuestionCreator - Calling onSave callback");

    onSave(surveyData);
  };

  const handlePreview = () => {
    console.log("SurveyQuestionCreator - Toggling preview, current state:", showPreview);
    setShowPreview(!showPreview);
    if (onPreview) {
      console.log("SurveyQuestionCreator - Calling onPreview with questions:", questions);
      onPreview({ questions });
    }
  };

  return (
    <div className="survey-question-creator">
      <div className="creator-header">
        <h5>{isEditing ? 'Edit' : 'Create'} Câu hỏi khảo sát</h5>
        <div className="header-actions">
          <button
            className="btn btn-outline-info btn-sm me-2"
            onClick={handlePreview}
          >
            <MdPreview className="me-1" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            className="btn btn-success btn-sm me-2"
            onClick={handleSaveSurvey}
            disabled={questions.length === 0}
          >
            <FaSave className="me-1" />
            Lưu khảo sát
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
          >
            <FaTimes className="me-1" />
            Đóng
          </button>
        </div>
      </div>

      <div className="creator-content">
        {/* Left: Question List */}
        <div className="questions-list">
          <div className="questions-header">
            <h6>Câu hỏi ({questions.length})</h6>
          </div>
          <div className="questions-scroll">
            {questions.length === 0 && (
              <div className="no-questions">
                <p>Chưa có câu hỏi nào được thêm vào. Nhấp vào "Thêm câu hỏi" để bắt đầu.</p>
              </div>
            )}
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`question-item${editingIndex === index ? ' active' : ''}`}
                style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  padding: '1.2rem 1.5rem',
                  marginBottom: '1.2rem',
                  border: editingIndex === index ? '2px solid #764ba2' : '1.5px solid #e0e4ea',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => handleEditQuestion(index)}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      width: '2.2rem',
                      height: '2.2rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.8rem',
                      flexShrink: 0,
                    }}>
                      Q{index + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#22223b', lineHeight: 1.4 }}>
                      {question.question}
                    </span>
                    <span style={{
                      background: '#e9ecef',
                      color: '#6c757d',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      marginLeft: '1rem',
                    }}>
                      ({question.options.length} options)
                    </span>
                  </div>
                </div>
                <div
                  className="question-actions"
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    opacity: 1,
                    alignItems: 'center',
                    marginLeft: '1.5rem',
                  }}
                >
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={e => { e.stopPropagation(); handleEditQuestion(index); }}
                    title="Edit"
                  >
                    Biên tập
                  </button>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={e => { e.stopPropagation(); handleDuplicateQuestion(index); }}
                    title="Duplicate"
                  >
                    <FaCopy />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={e => { e.stopPropagation(); handleDeleteQuestion(index); }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="add-question-sticky">
            <button
              className="btn btn-primary"
              onClick={handleAddQuestion}
            >
              <FaPlus className="me-1" />
              Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Right: Editor Panel */}
        <div className="question-editor">
          {(editingIndex !== null || questions.length === 0) ? (
            <div className="edit-question-card" style={{ background: '#f8f9fa', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '2rem', marginBottom: '1rem', border: '1px solid #e9ecef' }}>
              <div className="editor-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e0e4ea', paddingBottom: '1rem' }}>
                <h6 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                  {editingIndex !== null ? `Editing Question ${editingIndex + 1}` : 'Add New Question'}
                </h6>
              </div>
              <div className="editor-form">
                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Question Text *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Enter your question here..."
                    style={{ fontSize: '1.05rem', borderRadius: '8px', border: '1.5px solid #e0e4ea', background: '#fff' }}
                  />
                </div>
                <div className="form-group mb-4">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Options *</label>
                  <div className="options-container">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="option-row d-flex align-items-center mb-2" style={{ background: '#f1f3f6', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '0.5rem' }}>
                        <span className="option-letter me-2" style={{ fontWeight: 700, color: '#495057', background: '#dee2e6', borderRadius: '6px', padding: '0.3rem 0.8rem', minWidth: '2rem', display: 'inline-block', textAlign: 'center' }}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          className="form-control me-2"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          style={{ background: 'transparent', border: 'none', borderBottom: '1.5px solid #ced4da', borderRadius: 0, fontSize: '1rem' }}
                        />
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveOption(index)}
                          disabled={currentQuestion.options.length <= 2}
                          title="Remove Option"
                          style={{ marginLeft: '0.5rem' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={handleAddOption}
                    >
                      <FaPlus className="me-1" />
                      Thêm tùy chọn
                    </button>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-4 gap-2">
                  <button
                    className="btn btn-success me-2"
                    onClick={handleSaveQuestion}
                  >
                    <FaSave className="me-1" />
                    Lưu câu hỏi
                  </button>
                  {editingIndex !== null && (
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      <FaTimes className="me-1" />
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <p>Chọn câu hỏi để chỉnh sửa hoặc nhấp vào "Thêm câu hỏi" để tạo câu hỏi mới.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section (full width below) */}
      {showPreview && (
        <div className="preview-section">
          <h6>Xem trước</h6>
          <div className="preview-questions">
            {questions.map((question, index) => (
              <div key={question.id} className="preview-question">
                <h6>Q{index + 1}. {question.question}</h6>
                <div className="preview-options">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="preview-option">
                      <input type="radio" name={`question-${question.id}`} disabled />
                      <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionCreator; 