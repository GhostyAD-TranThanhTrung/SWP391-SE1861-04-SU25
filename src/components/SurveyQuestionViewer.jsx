import React from "react";

const SurveyQuestionViewer = ({ survey, onEdit, readOnly = false }) => {
  if (!survey || !survey.questions_json) {
    return <div>No survey data available.</div>;
  }

  let questions = [];
  try {
    // Support both stringified and object format
    const parsed =
      typeof survey.questions_json === "string"
        ? JSON.parse(survey.questions_json)
        : survey.questions_json;
    questions = parsed.questions || [];
  } catch (e) {
    return <div>Invalid survey questions format.</div>;
  }

  return (
    <div className="survey-question-viewer">
      <h5 className="mb-3">Survey Questions</h5>
      {questions.length === 0 && <div>No questions found.</div>}
      {questions.map((q, idx) => (
        <div key={q.id || idx} className="question-block mb-4 p-3 border rounded bg-light">
          <div className="d-flex align-items-center mb-2">
            <span className="fw-bold me-2">Q{idx + 1}:</span>
            <span>{q.question}</span>
          </div>
          <div className="ms-4">
            {q.options && q.options.length > 0 ? (
              <ul className="list-unstyled mb-0">
                {q.options.map((opt, oidx) => (
                  <li key={oidx} className="mb-1">
                    <span className="badge bg-secondary me-2">
                      {String.fromCharCode(65 + oidx)}
                    </span>
                    {opt}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">No options</div>
            )}
          </div>
        </div>
      ))}
      {!readOnly && onEdit && (
        <div className="text-end">
          <button className="btn btn-warning" onClick={onEdit}>
            Edit Survey
          </button>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionViewer; 