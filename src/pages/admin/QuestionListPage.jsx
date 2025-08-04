import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaEyeSlash, FaTrash, FaSort, FaSortUp, FaSortDown, FaQuestionCircle, FaClipboardList } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/StaffListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination.jsx";
import { Assist_Data } from "../../QuizData/Assist_Data";
import { Crafft_Data } from "../../QuizData/Crafft-Data";
import AssistQuestionModal from "../../components/AssistQuestionModal.jsx";
import CrafftQuestionModal from "../../components/CrafftQuestionModal.jsx";

const QuestionListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [actions, setActions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeView, setActiveView] = useState('actions'); // 'actions', 'assist', 'crafft'
  const [questionsRefreshTrigger, setQuestionsRefreshTrigger] = useState(0);
  const [newAction, setNewAction] = useState({
    description: "",
    range: "",
    type: "",
  });

  // Question modal states
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionType, setQuestionType] = useState('ASSIST'); // 'ASSIST' or 'CRAFFT'
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  const [editingActionId, setEditingActionId] = useState(null);
  const [editActionData, setEditActionData] = useState(null);
  const [viewingActionId, setViewingActionId] = useState(null);
  const [viewActionData, setViewActionData] = useState(null);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Removed - delete functionality disabled
  const [actionIdToDelete, setActionIdToDelete] = useState(null);
  const token = sessionStorage.getItem("token");
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const navigate = useNavigate();

  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff'))) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }
  }
  
  userRole();

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/actions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActions(res.data.data.filter(item => item.type !== "Referral"));
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const fetchAssistQuestions = async () => {
    try {
        Assist_Data.isLoading = true;
        Assist_Data.error = null;
        
        console.log('🔄 Fetching ASSIST questions from API...');
        
        // Use the correct endpoint from index.js
        const response = await axios.get('http://localhost:3000/api/assessment-questions/type/ASSIST');
        
        console.log('📡 ASSIST API Response:', response);
        console.log('📊 ASSIST Response Data:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
            console.log('✅ ASSIST Questions found:', response.data.data.length);
            console.log('📝 ASSIST Raw Questions:', response.data.data);
            
            // Transform API data to match expected format
            Assist_Data.questions = response.data.data.map(question => ({
                id: question.assessment_question_id,
                question: question.question,
                note: question.note,
                type: question.type,
                multiSelect: question.multiSelect,
                allowMultiple: question.allowMultiple,
                options: question.options.map(option => ({
                    id: option.id,
                    text: option.text,
                    score: option.score
                }))
            }));
            
                    console.log('🔄 ASSIST Transformed Questions:', Assist_Data.questions);
        console.log('✅ ASSIST Data loaded successfully!');
      } else {
        console.warn('⚠️ No ASSIST questions found in response');
        throw new Error('No ASSIST questions found');
      }
    } catch (error) {
      console.error('❌ Error fetching ASSIST questions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      Assist_Data.error = error.message;
      // Fallback to empty array if API fails
      Assist_Data.questions = [];
    } finally {
      Assist_Data.isLoading = false;
      console.log('🏁 ASSIST fetch completed. Loading:', Assist_Data.isLoading);
      setQuestionsRefreshTrigger(prev => prev + 1);
    }
};


const fetchCrafftQuestions = async () => {
  try {
      Crafft_Data.isLoading = true;
      Crafft_Data.error = null;
      
      console.log('🔄 Fetching CRAFFT questions from API...');
      
      // Use the correct endpoint from index.js
      const response = await axios.get('http://localhost:3000/api/assessment-questions/type/CRAFFT');
      
      console.log('📡 CRAFFT API Response:', response);
      console.log('📊 CRAFFT Response Data:', response.data);
      
      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
          console.log('✅ CRAFFT Questions found:', response.data.data.length);
          console.log('📝 CRAFFT Raw Questions:', response.data.data);
          
          // Transform API data to match expected format
          Crafft_Data.questions = response.data.data.map(question => ({
              id: question.assessment_question_id,
              question: question.question,
              note: question.note,
              type: question.type,
              category: question.category,        // Use database value
              substance: question.substance,      // Use database value
              letter: question.letter,            // Use database value
              options: question.options.map(option => ({
                  id: option.id,
                  text: option.text,
                  score: option.score
              }))
          }));
          
                  console.log('🔄 CRAFFT Transformed Questions:', Crafft_Data.questions);
        console.log('✅ CRAFFT Data loaded successfully!');
      } else {
        console.warn('⚠️ No CRAFFT questions found in response');
        throw new Error('No CRAFFT questions found');
      }
    } catch (error) {
      console.error('❌ Error fetching CRAFFT questions:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      Crafft_Data.error = error.message;
      // Fallback to empty array if API fails
      Crafft_Data.questions = [];
    } finally {
      Crafft_Data.isLoading = false;
      console.log('🏁 CRAFFT fetch completed. Loading:', Crafft_Data.isLoading);
      setQuestionsRefreshTrigger(prev => prev + 1);
    }
};


   useEffect(() => {
    fetchActions();
    fetchAssistQuestions();
    fetchCrafftQuestions();
  }, []);

  // Combine questions from both sources and update when data changes
  useEffect(() => {
    const combinedQuestions = [];
    
    if (Assist_Data.questions && Assist_Data.questions.length > 0) {
      const assistQuestions = Assist_Data.questions.map(q => ({
        ...q,
        source: 'ASSIST',
        type: 'ASSIST'
      }));
      combinedQuestions.push(...assistQuestions);
    }
    
    if (Crafft_Data.questions && Crafft_Data.questions.length > 0) {
      const crafftQuestions = Crafft_Data.questions.map(q => ({
        ...q,
        source: 'CRAFFT',
        type: 'CRAFFT'
      }));
      combinedQuestions.push(...crafftQuestions);
    }
    
    setQuestions(combinedQuestions);
    console.log('📊 Combined Questions:', combinedQuestions);
  }, [Assist_Data.questions, Crafft_Data.questions, questionsRefreshTrigger]);

  // Removed create action functionality - only allow edit
  // const handleOpenPopup = () => {
  //   setShowPopup(true);
  //   setNewAction({
  //     description: "",
  //     range: "",
  //     type: "",
  //   });
  // };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingActionId(null);
    setEditActionData(null);
    setViewingActionId(null);
    setViewActionData(null);
    setNewAction({
      description: "",
      range: "",
      type: "",
    });
  };

  const handleChange = (e) => {
    setNewAction({ ...newAction, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditActionData({ ...editActionData, [e.target.name]: e.target.value });
  };

  // Removed create functionality - only edit is allowed now
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Redirect to update function since we only allow editing
    if (editingActionId) {
      handleUpdateSubmit(e);
    } else {
      alert("Tính năng tạo mới đã bị vô hiệu hóa.");
    }
  };

  const handleEdit = (actionId) => {
    const action = actions.find((a) => a.action_id === actionId);
    if (action) {
      setEditActionData(action);
      setEditingActionId(actionId);
      setViewingActionId(null);
      setViewActionData(null);
      setShowPopup(true);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:3000/api/actions/${editingActionId}`,
        editActionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Cập nhật gợi ý thành công!");
        fetchActions();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật gợi ý:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật gợi ý. Vui lòng thử lại.");
      }
    }
  };

  // Removed delete functionality per user request
  // const handleOpenDeleteDialog = (actionId) => {
  //   setActionIdToDelete(actionId);
  //   setDeleteDialogOpen(true);
  // };

  // const handleCloseDeleteDialog = () => {
  //   setDeleteDialogOpen(false);
  //   setActionIdToDelete(null);
  // };

  // const handleConfirmDelete = async () => {
  //   if (!actionIdToDelete) return;
  //   try {
  //     const res = await axios.delete(
  //       `http://localhost:3000/api/actions/${actionIdToDelete}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (res.data.success) {
  //       alert("Xóa gợi ý thành công!");
  //       fetchActions();
  //     }
  //   } catch (err) {
  //     console.error("Lỗi khi xóa action:", err);
  //     if (err.response?.data?.message) {
  //       alert(`Lỗi: ${err.response.data.message}`);
  //     } else {
  //       alert("Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.");
  //     }
  //   }
  //   handleCloseDeleteDialog();
  // };

  // Question modal handlers
  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setQuestionType(question.source || question.type);
    setQuestionModalMode('view');
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setQuestionType(question.source || question.type);
    setQuestionModalMode('edit');
    setShowQuestionModal(true);
  };

  const handleCreateQuestion = (type) => {
    setSelectedQuestion(null);
    setQuestionType(type);
    setQuestionModalMode('create');
    setShowQuestionModal(true);
  };

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false);
    setSelectedQuestion(null);
    setQuestionModalMode('view');
  };

  const handleSaveQuestion = (savedQuestion) => {
    // Refresh questions data
    refreshQuestions();
    console.log('Question saved:', savedQuestion);
  };

  // Refresh questions when they change
  const refreshQuestions = () => {
    fetchAssistQuestions();
    fetchCrafftQuestions();
    setQuestionsRefreshTrigger(prev => prev + 1);
  };

  // Delete question handlers
  const handleOpenDeleteDialog = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/assessment-questions/${questionToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        alert("Xóa câu hỏi thành công!");
        // Refresh questions data
        refreshQuestions();
      }
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi xóa câu hỏi. Vui lòng thử lại.");
      }
    }
    handleCloseDeleteDialog();
  };

  const handleTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortDirection === 'asc' ?
      <FaSortUp className="ms-1 text-primary" /> :
      <FaSortDown className="ms-1 text-primary" />;
  };

  // Get current data based on active view
  const getCurrentData = () => {
    switch (activeView) {
      case 'assist':
        return questions.filter(q => q.source === 'ASSIST');
      case 'crafft':
        return questions.filter(q => q.source === 'CRAFFT');
      case 'actions':
      default:
        return actions.filter(action => {
          const typeMatch = filterType === 'all' || action.type === filterType;
          return typeMatch;
        });
    }
  };

  const currentData = getCurrentData();

  // Sort current data
  const sortedData = [...currentData].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  

  const translationPartCrafft = (part) =>{
    const translateArray = {
      "partA":"Loại A",
      "partB":"Loại B"
    }

    return translateArray[part]
  }

  // Pagination logic
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count by type
  const typeCounts = actions.reduce((acc, action) => {
    acc[action.type] = (acc[action.type] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filterType, actions]);

  return (
    <div className="staff-container">
      <div className="row g-4 mb-4">
        {/* Total Items Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  {activeView === 'actions' ? '📋' : '❓'}
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">
                  {activeView === 'actions' ? 'Tổng số gợi ý' : 
                   activeView === 'assist' ? 'ASSIST Questions' : 'CRAFFT Questions'}
                </div>
                <div className="h3 mb-0 fw-bold">{totalItems}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Count */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  📋
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Gợi ý</div>
                <div className="h3 mb-0 fw-bold">{actions.length}</div>
                <div className="small text-muted">actions</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSIST Questions Count */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  🔍
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">ASSIST</div>
                <div className="h3 mb-0 fw-bold">{questions.filter(q => q.source === 'ASSIST').length}</div>
                <div className="small text-muted">questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* CRAFFT Questions Count */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  🚗
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">CRAFFT</div>
                <div className="h3 mb-0 fw-bold">{questions.filter(q => q.source === 'CRAFFT').length}</div>
                <div className="small text-muted">questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`btn shadow-sm ${activeView === 'actions' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('actions')}
              >
                <FaClipboardList className="me-1" /> Gợi ý
              </button>
              <button 
                className={`btn shadow-sm ${activeView === 'assist' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setActiveView('assist')}
              >
                <FaQuestionCircle className="me-1" /> ASSIST Questions
              </button>
              <button 
                className={`btn shadow-sm ${activeView === 'crafft' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setActiveView('crafft')}
              >
                <FaQuestionCircle className="me-1" /> CRAFFT Questions
              </button>
            </div>
            
            <div className="d-flex gap-2 flex-wrap">
              {activeView === 'actions' && (
                <>
                  <select
                    className="form-select shadow-sm"
                    style={{ minWidth: "300px" }}
                    value={filterType}
                    onChange={handleTypeChange}
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="ASSIST">ASSIST</option>
                    <option value="CRAFFT">CRAFFT</option>
                  </select>
                </>
              )}
              
              {activeView === 'assist' && (
                <button 
                  className="btn btn-success shadow-sm" 
                  onClick={() => handleCreateQuestion('ASSIST')}
                >
                  <FaPlus className="me-1" /> Tạo câu hỏi ASSIST
                </button>
              )}
              
              {activeView === 'crafft' && (
                <button 
                  className="btn btn-info shadow-sm" 
                  onClick={() => handleCreateQuestion('CRAFFT')}
                >
                  <FaPlus className="me-1" /> Tạo câu hỏi CRAFFT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              {activeView === 'actions' ? (
                <>
                  <th
                    onClick={() => handleSort('description')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by description"
                  >
                    Mô tả {getSortIcon('description')}
                  </th>
                  <th
                    onClick={() => handleSort('range')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by range"
                  >
                    Phạm vi {getSortIcon('range')}
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by type"
                  >
                    Loại {getSortIcon('type')}
                  </th>
                  <th>Thao tác</th>
                </>
              ) : (
                <>
                  <th
                    onClick={() => handleSort('question')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by question"
                  >
                    Câu hỏi {getSortIcon('question')}
                  </th>
                  
                  {activeView === 'crafft' && (
                    <>
                      <th>Phân loại</th>
                      <th>Letter</th>
                    </>
                  )}
                  <th>Số đáp án</th>
                  <th>Thao tác</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={activeView === 'actions' ? item.action_id : item.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                {activeView === 'actions' ? (
                  <>
                    <td>{item.description}</td>
                    <td>{item.range}</td>
                    <td>{item.type}</td>
                    <td className="action-buttons">
                      <button className="btn btn-light" onClick={() => handleEdit(item.action_id)} title="Chỉnh sửa">
                        <FaEdit color="orange" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{item.question}</td>
                   
                    {activeView === 'crafft' && (
                      <>
                        <td>{translationPartCrafft(item.category)}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{item.letter || 'N/A'}</span>
                        </td>
                      </>
                    )}
                    <td>
                      <small className="text-muted">
                        {item.options ? `${item.options.length} lựa chọn` : 'Error: Xin hãy thêm lựu chọn vào'}
                      </small>
                    </td>
                    <td className="action-buttons">
                      <button className="btn btn-light me-2" onClick={() => handleViewQuestion(item)} title="Xem chi tiết">
                        <FaEye color="blue" />
                      </button>
                      <button className="btn btn-light me-2" onClick={() => handleEditQuestion(item)} title="Chỉnh sửa">
                        <FaEdit color="orange" />
                      </button>
                      <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(item)} title="Xóa">
                        <FaTrash color="red" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination below the table */}
      <PaginationComp
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        maxPageNumbersToShow={maxPageNumbersToShow}
        onPageChange={setCurrentPage}
      />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>
                {viewingActionId ? "Xem chi tiết gợi ý" :
                  editingActionId ? "Chỉnh sửa gợi ý" : "Tạo gợi ý mới"}
              </h2>
              <form className="form-grid" onSubmit={editingActionId ? handleUpdateSubmit : handleSubmit}>

                <div className="form-group">
                  <label className="form-label">Phạm vi</label>
                  <input
                    type="number"
                    name="range"
                    min="0"
                    value={viewingActionId ? viewActionData?.range || "" :
                      editingActionId ? editActionData?.range || "" : newAction.range}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    disabled={viewingActionId}
                    className="form-input"
                    placeholder="Nhập phạm vi (số)"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loại *</label>
                  <select
                    name="type"
                    value={viewingActionId ? viewActionData?.type || "" :
                      editingActionId ? editActionData?.type || "" : newAction.type}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={true}
                    className="form-select"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  >
                    <option value="">Chọn loại</option>
                    <option value="ASSIST">ASSIST</option>
                    <option value="CRAFFT">CRAFFT</option>

                  </select>
                </div>

                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Mô tả *</label>
                  <textarea
                    name="description"
                    value={viewingActionId ? viewActionData?.description || "" :
                      editingActionId ? editActionData?.description || "" : newAction.description}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập mô tả chi tiết của gợi ý..."
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      resize: viewingActionId ? 'none' : 'vertical',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                {!viewingActionId && (
                  <button type="submit" className="form-button form-grid-col-span-2">
                    Cập nhật
                  </button>
                )}
                {viewingActionId && (
                  <button type="button" className="form-button form-grid-col-span-2" onClick={handleClosePopup}>
                    Đóng
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Modals */}
      {showQuestionModal && questionType === 'ASSIST' && (
        <AssistQuestionModal
          show={showQuestionModal}
          onClose={handleCloseQuestionModal}
          question={selectedQuestion}
          mode={questionModalMode}
          onSave={handleSaveQuestion}
        />
      )}
      
      {showQuestionModal && questionType === 'CRAFFT' && (
        <CrafftQuestionModal
          show={showQuestionModal}
          onClose={handleCloseQuestionModal}
          question={selectedQuestion}
          mode={questionModalMode}
          onSave={handleSaveQuestion}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="popup">
          <div className="popup-content">
            <div className="form">
              <h2>Xác nhận xóa</h2>
              <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
              <p><strong>"{questionToDelete?.question}"</strong></p>
              <div className="d-flex gap-2 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleConfirmDelete}
                >
                  Xóa
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseDeleteDialog}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionListPage;
