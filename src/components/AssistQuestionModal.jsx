import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const AssistQuestionModal = ({ 
  show, 
  onClose, 
  question = null, 
  mode = 'view', // 'view', 'edit', 'create'
  onSave 
}) => {
  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple_choice',
    assessment_type: 'ASSIST',
    note: '',
    multiSelect: false,
    allowMultiple: false,
    substance: '',
    options: [
      { id: 1, text: '', score: 0 },
      { id: 2, text: '', score: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (question && (mode === 'edit' || mode === 'view')) {
      setFormData({
        question: question.question || '',
        type: question.type || 'multiple_choice',
        assessment_type: 'ASSIST',
        note: question.note || '',
        multiSelect: question.multiSelect || false,
        allowMultiple: question.allowMultiple || false,
        substance: question.substance || '',
        options: question.options && question.options.length > 0 
          ? question.options.map((opt, index) => ({
              id: opt.id || index + 1,
              text: opt.text || '',
              score: opt.score || 0
            }))
          : [
              { id: 1, text: '', score: 0 },
              { id: 2, text: '', score: 0 }
            ]
      });
    } else if (mode === 'create') {
      setFormData({
        question: '',
        type: 'multiple_choice',
        assessment_type: 'ASSIST',
        note: '',
        multiSelect: false,
        allowMultiple: false,
        substance: '',
        options: [
          { id: 1, text: '', score: 0 },
          { id: 2, text: '', score: 0 }
        ]
      });
    }
  }, [question, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId 
          ? { ...opt, [field]: field === 'score' ? parseInt(value) || 0 : value }
          : opt
      )
    }));
  };

  const addOption = () => {
    const newId = Math.max(...formData.options.map(opt => opt.id)) + 1;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '', score: 0 }]
    }));
  };

  const removeOption = (optionId) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter(opt => opt.id !== optionId)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    if (formData.options.some(opt => !opt.text.trim())) {
      alert('Vui lòng điền đầy đủ các tùy chọn');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        question: formData.question,
        type: formData.type,
        assessment_type: formData.assessment_type,
        note: formData.note,
        multiSelect: formData.multiSelect,
        allowMultiple: formData.allowMultiple,
        substance: formData.substance,
        options: formData.options.map((opt, index) => ({
          id: opt.id,
          text: opt.text,
          score: opt.score || 0,
          answer_order: index + 1
        }))
      };

      let response;
      if (mode === 'create') {
        response = await axios.post('http://localhost:3000/api/assessment-questions', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Tạo câu hỏi ASSIST thành công!');
      } else if (mode === 'edit') {
        response = await axios.put(`http://localhost:3000/api/assessment-questions/${question.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật câu hỏi ASSIST thành công!');
      }

      if (onSave) onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error saving ASSIST question:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ border: 'none', borderRadius: '8px' }}>
          <div className="modal-header" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
            <h5 className="modal-title" style={{ color: '#495057', fontWeight: '600' }}>
              {mode === 'create' && 'Tạo câu hỏi ASSIST mới'}
              {mode === 'edit' && 'Chỉnh sửa câu hỏi ASSIST'}
              {mode === 'view' && 'Xem chi tiết câu hỏi ASSIST'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ backgroundColor: '#ffffff', maxHeight: '60vh', overflowY: 'auto' }}>

              {/* Question Text */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
                  Câu hỏi <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  name="question"
                  className="form-control"
                  style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                  rows="3"
                  value={formData.question}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  placeholder="Nhập nội dung câu hỏi..."
                  required
                />
              </div>

              <div className="row">
                {/* Question Type */}
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Loại câu hỏi</label>
                  <select
                    name="type"
                    className="form-select"
                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                  >
                    <option value="multi-select">Trắc nghiệm: Chọn nhiều đáp án</option>
                    <option value="MCQs">Trắc nghiệm</option>
                  </select>
                </div>

                {/* Substance */}
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Chất gây nghiện</label>
                  <input
                    type="text"
                    name="substance"
                    className="form-control"
                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    value={formData.substance}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    placeholder="Ví dụ: Rượu, Cần sa, Cocaine..."
                  />
                </div>
              </div>

              {/* Note */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Ghi chú</label>
                <textarea
                  name="note"
                  className="form-control"
                  style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                  rows="2"
                  value={formData.note}
                  onChange={handleInputChange}
                  disabled={mode === 'view'}
                  placeholder="Ghi chú thêm về câu hỏi..."
                />
              </div>

              {/* Options */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0" style={{ color: '#495057', fontWeight: '500' }}>
                    Các tùy chọn trả lời <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  {mode !== 'view' && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary btn-sm"
                      style={{ borderColor: '#6c757d', color: '#6c757d' }}
                      onClick={addOption}
                    >
                      <FaPlus className="me-1" /> Thêm tùy chọn
                    </button>
                  )}
                </div>

                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '4px',
                  padding: '8px',
                  backgroundColor: '#fafafa'
                }}>
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="mb-2" style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: '4px', padding: '12px' }}>
                      <div className="row align-items-center">
                        <div className="col-1">
                          <span style={{ 
                            backgroundColor: '#6c757d', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <div className="col-7">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                            value={option.text}
                            onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                            disabled={mode === 'view'}
                            placeholder={`Tùy chọn ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                        <div className="col-3">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text" style={{ fontSize: '12px', backgroundColor: '#f8f9fa' }}>Điểm:</span>
                            <input
                              type="number"
                              className="form-control"
                              style={{ border: '1px solid #ced4da', borderRadius: '0 4px 4px 0' }}
                              value={option.score}
                              onChange={(e) => handleOptionChange(option.id, 'score', e.target.value)}
                              disabled={mode === 'view'}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="col-1">
                          {mode !== 'view' && formData.options.length > 2 && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              style={{ borderColor: '#6c757d', color: '#6c757d' }}
                              onClick={() => removeOption(option.id)}
                              title="Xóa tùy chọn"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="modal-footer" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ backgroundColor: '#6c757d', color: 'white', border: 'none' }}
                onClick={onClose}
              >
                Đóng
              </button>
              {mode !== 'view' && (
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ backgroundColor: '#495057', color: 'white', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistQuestionModal;
