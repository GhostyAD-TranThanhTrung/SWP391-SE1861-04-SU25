import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/DetailMemberPage.scss";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Image from '../../images/Images.jpg';
import { assessRiskLevel as assessCrafftRisk, hasSubstanceUseInPartA, hasCarRisk } from "../../QuizData/Crafft-Data";
import { assessRiskLevel as assessAssistRisk } from "../../QuizData/Assist_Data";

const DetailMemberPage = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [writtenBlogs, setWrittenBlogs] = useState([]);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssessments, setShowAssessments] = useState(true);
  const [showCourses, setShowCourses] = useState(true);
  const [showBlogs, setShowBlogs] = useState(true);
  const [showBookings, setShowBookings] = useState(true);
  const [bookingSessions, setBookingSessions] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingSortOrder, setBookingSortOrder] = useState('desc');
  const [assessmentSortOrder, setAssessmentSortOrder] = useState('desc'); // 'asc', 'desc' for time
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all'); // 'all', 'crafft', 'assist'
  const token = sessionStorage.getItem('token');
  const { memberId } = useParams();

  // Use memberId as userId for consistency with the backend
  const userId = memberId;

  // Debug logging
  console.log('DetailMemberPage - memberId from params:', memberId);
  console.log('DetailMemberPage - userId (derived):', userId);

  const userRole = async () => {
    try {
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const res = await axios.get('http://localhost:3000/api/user/role/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff'))) {
        navigate('/admin/login');
      }
    } catch {
      navigate('/admin/login');
    }
  };

  // Call userRole on component mount
  useEffect(() => {
    userRole();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Check if userId is available
      if (!userId) {
        setError("ID thành viên không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching member details from: http://localhost:3000/api/members/detailed/${userId}`);

        // Fetch member details first
        const memberRes = await axios.get(`http://localhost:3000/api/members/detailed/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Member details response:', memberRes.data);

        // The API returns nested structure: { data: { user: {...}, profile: {...} } }
        const responseData = memberRes.data.data;
        if (responseData) {
          // Flatten the structure to match our component expectations
          const flattenedData = {
            ...responseData.user,
            profile: responseData.profile,
            assessments: responseData.assessments
          };
          console.log('Flattened member data:', flattenedData);
          console.log('Assessment data specifically:', flattenedData.assessments);
          setMemberDetails(flattenedData);
        } else {
          setMemberDetails(null);
        }

        // Fetch enrolled courses for the specific user using the new admin endpoint
        const coursesRes = await axios.get(`http://localhost:3000/api/programs/user/${userId}/enrollment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrolledCourses(coursesRes.data.data || []);

        // Fetch written blogs for the specific user  
        // Note: This might need to be adjusted based on available blog endpoints
        try {
          const blogsRes = await axios.get(`http://localhost:3000/api/blogs/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWrittenBlogs(blogsRes.data.data || []);
        } catch (blogError) {
          console.warn('Could not fetch user blogs:', blogError);
          // If user-specific blog endpoint doesn't exist, try generic endpoint
          try {
            const blogsRes = await axios.get("http://localhost:3000/api/blogs/my", {
              headers: { Authorization: `Bearer ${token}` }
            });
            setWrittenBlogs(blogsRes.data.data || []);
          } catch (fallbackError) {
            console.warn('Could not fetch blogs with fallback:', fallbackError);
            setWrittenBlogs([]);
          }
        }

        // Fetch booking sessions for the specific member
        try {
          setLoadingBookings(true);
          const bookingsRes = await axios.get(`http://localhost:3000/api/booking-sessions/member/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Booking sessions response:', bookingsRes.data);
          setBookingSessions(bookingsRes.data.data || []);
        } catch (bookingError) {
          console.warn('Could not fetch member booking sessions:', bookingError);
          setBookingSessions([]);
        } finally {
          setLoadingBookings(false);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchData();
    } else if (!token) {
      navigate('/admin/login');
    }
  }, [userId, token, navigate]);

  // Helper to translate status from Vietnamese to English
  const translateStatus = (status) => {
    if (!status) return 'Không xác định';

    const statusTranslations = {
      'Hoạt động': 'Hoạt động',
      'Không hoạt động': 'Không hoạt động',
      'Bị cấm': 'Bị cấm',
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'banned': 'Bị cấm'
    };

    return statusTranslations[status] || status;
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  // Helper function to calculate risk level from assessment data
  const calculateRiskLevel = (assessment) => {
    try {
      const actionMapping ={
        '2':'Thấp',
        '3':'Trung Bình',
        '4':'Cao',
        '5':'Thấp',
        '6':'Trung Bình',
        '7':'Cao',
      }

      const riskLevel = actionMapping[assessment.action?.action_id] || 'demo';
      
      const resultData = typeof assessment.result_json === 'string'
        ? JSON.parse(assessment.result_json)
        : assessment.result_json;

      const score = resultData.score;

      return { riskLevel, score };
    } catch (error) {
      console.error('Error calculating risk level:', error);
    }
  };
  

  // Get risk level color class
  const getRiskLevelClass = (riskLevel) => {
    // Ensure riskLevel is a string
    const riskLevelStr = typeof riskLevel === 'string' ? riskLevel : 'không xác định';
    
    switch (riskLevelStr.toLowerCase()) {
      case 'thấp':
        return 'bg-success';
      case 'trung bình':
        return 'bg-warning';
      case 'cao':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Helper to translate age group
  const translateAgeGroup = (ageGroup) => {
    const translations = {
      'children': 'Trẻ em',
      'teenager': 'Thiếu niên',
      'adult': 'Người lớn',
      'elderly': 'Người cao tuổi',
      'all': 'Tất cả độ tuổi'
    };
    return translations[ageGroup] || ageGroup;
  };

  // Sort and filter assessments function
  const sortAndFilterAssessments = (assessments) => {
    if (!assessments || assessments.length === 0) return [];

    // First filter by type
    let filtered = [...assessments];
    if (assessmentTypeFilter !== 'all') {
      filtered = filtered.filter(assessment =>
        assessment.type?.toLowerCase() === assessmentTypeFilter.toLowerCase()
      );
    }

    // Then sort by time
    return filtered.sort((a, b) => {
      const dateA = new Date(a.create_at);
      const dateB = new Date(b.create_at);
      const comparison = dateA - dateB;
      return assessmentSortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // Booking helper functions (similar to BookingPage)
  const formatTime = (timeString) => {
    if (!timeString) return '';

    // Handle different time formats
    if (timeString.includes('T')) {
      // ISO format: "1900-01-01T09:00:00.000Z"
      const date = new Date(timeString);
      return date.toTimeString().substring(0, 5); // Returns "09:00"
    } else if (timeString.includes(':')) {
      // Direct time format: "09:00:00"
      return timeString.substring(0, 5); // Returns "09:00"
    }

    return timeString;
  };

  // Format booking date with day of week and dd/mm/yyyy
  const formatBookingDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = dayNames[date.getDay()];
    const formattedDate = date.toLocaleDateString('vi-VN');

    return `${dayOfWeek}, ${formattedDate}`;
  };

  // Get status info for booking
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Đang chờ xác nhận':
        return { className: 'bg-warning text-dark', text: 'Đang chờ xác nhận' };
      case 'Xác nhận thành công':
        return { className: 'bg-success text-white', text: 'Xác nhận thành công' };
      case 'Đã hoàn thành':
        return { className: 'bg-info text-white', text: 'Đã hoàn thành' };
      case 'Đã hủy':
        return { className: 'bg-danger text-white', text: 'Đã hủy' };
      default:
        return { className: 'bg-light text-dark', text: status || 'Không xác định' };
    }
  };

  // Check if booking is today
  const isBookingToday = (booking) => {
    if (!booking.booking_date) return false;

    const today = new Date();
    const bookingDate = new Date(booking.booking_date);

    return today.toDateString() === bookingDate.toDateString();
  };

  // Get row styling based on booking status and date
  const getBookingRowStyle = (booking) => {
    const today = new Date();
    const bookingDate = new Date(booking.booking_date);

    if (booking.status === 'Đã hủy' || booking.status === 'Bỏ lỡ') {
      return { backgroundColor: '#f8f9fa', opacity: '0.7' };
    }

    if (bookingDate < today && booking.status !== 'Đã hoàn thành') {
      return { backgroundColor: '#fff3cd' }; // Light yellow for overdue
    }

    if (isBookingToday(booking)) {
      return { backgroundColor: '#d4edda' }; // Light green for today
    }

    return {};
  };

  // Sort and filter booking sessions function
  const sortAndFilterBookings = (bookings) => {
    if (!bookings || bookings.length === 0) return [];

    // First filter by status
    let filtered = [...bookings];
    if (bookingStatusFilter !== 'all') {
      filtered = filtered.filter(booking =>
        booking.status === bookingStatusFilter
      );
    }

    // Then sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.booking_date);
      const dateB = new Date(b.booking_date);
      const comparison = dateA - dateB;
      return bookingSortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // Render enrolled course card (adapted for program data structure)
  const renderEnrolledCourseCard = (program) => {
    // Filter out programs that are not enrolled
    if (!program.enrollment_status?.is_enrolled) {
      return null;
    }

    return (
      <div className="col-12 mb-3" key={program.program_id}>
        <div className="enrolled-course-card" style={{
          background: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div className="row align-items-center">
            {/* Tên khóa học */}
            <div className="col-md-4">
              <div className="text-center">
                <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
                  {program.title || program.program_title || 'Không có tiêu đề'}
                </h6>
                <small className={`badge ${program.enrollment_status?.has_complete ? 'bg-success' : 'bg-primary'}`}>
                  {program.enrollment_status?.has_complete ? 'Đã hoàn thành' : 'Đang học'}
                </small>
              </div>
            </div>

            {/* Thông tin khóa học */}
            <div className="col-md-4">
              <div className="text-center">
                <p className="mb-1 small text-muted" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: '0.85rem'
                }}>
                  {program.description || program.program_description || 'Không có mô tả'}
                </p>
                <div className="d-flex flex-column align-items-center gap-1">
                  <small className="text-muted">
                    <i className="bi bi-person me-1"></i>
                    <strong>Tác giả:</strong> {program.creator?.name || program.creator?.email || program.create_by || 'Không xác định'}
                  </small>
                  <small className="text-muted d-block">
                    <i className="bi bi-tag me-1"></i>
                    <strong>Nhóm tuổi:</strong> {translateAgeGroup(program.age_group) || 'Tất cả độ tuổi'}
                  </small>
                </div>
              </div>
            </div>

            {/* Tiến độ khóa học */}
            <div className="col-md-4">
              <div className="text-center">
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${program.enrollment_status?.progress_percentage || 0}%`,
                      backgroundColor: program.enrollment_status?.has_complete ? '#28a745' : '#007bff'
                    }}
                  ></div>
                </div>
                <small className="fw-bold" style={{
                  color: program.enrollment_status?.has_complete ? '#28a745' : '#007bff'
                }}>
                  {program.enrollment_status?.progress_percentage || 0}% Hoàn thành
                </small>
                <br />
                <small className="text-muted">
                  {program.enrollment_status?.completed_content || 0} / {program.enrollment_status?.total_content || 0} bài học
                </small>
                <div className="mt-2">
                  <small className="text-muted d-block">
                    <i className="bi bi-calendar-plus me-1"></i>
                    Đăng ký: {formatDate(program.enrollment_status?.enrollment_date)}
                  </small>
                  {program.enrollment_status?.completion_date && (
                    <small className="text-success d-block">
                      <i className="bi bi-calendar-check me-1"></i>
                      Hoàn thành: {formatDate(program.enrollment_status.completion_date)}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="detail-member-page">
      <button
        className="btn btn-outline-secondary mb-2"
        onClick={() => navigate('/member-list')}
      >
        <FaArrowLeft className="me-2" />
        Quay lại danh sách thành viên
      </button>
      <h2>Thông tin thành viên</h2>
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="member-content">
          {/* Member Basic Information */}
          {memberDetails && (
            <div className="member-basic-info mb-4">
              <h3>Thông tin cơ bản</h3>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-item mb-2">
                        <strong>ID thành viên:</strong> {memberDetails.user_id}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Họ và tên:</strong> {memberDetails.profile?.name || 'Chưa cập nhật'}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Email:</strong> {memberDetails.email || 'Chưa cập nhật'}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Nghề nghiệp:</strong> {memberDetails.profile?.job || 'Chưa cập nhật'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-item mb-2">
                        <strong>Ngày sinh:</strong> {memberDetails.profile?.date_of_birth ? formatDate(memberDetails.profile.date_of_birth) : 'Chưa cập nhật'}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Vai trò:</strong> {memberDetails.role || 'Member'}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Trạng thái:</strong> {translateStatus(memberDetails.status)}
                      </div>
                      <div className="info-item mb-2">
                        <strong>Ngày bắt đầu:</strong> {formatDate(memberDetails.start_at || memberDetails.date_create)}
                      </div>
                    </div>
                  </div>
                  {memberDetails.profile?.bio_json && (
                    <div className="info-item mt-3">
                      <strong>Tiểu sử:</strong>
                      <div className="mt-2 p-2 bg-light rounded">
                        {(() => {
                          try {
                            const bioData = typeof memberDetails.profile.bio_json === 'string'
                              ? JSON.parse(memberDetails.profile.bio_json)
                              : memberDetails.profile.bio_json;
                            return bioData?.bio || bioData?.biography || 'Chưa cập nhật tiểu sử';
                          } catch (error) {
                            // If it's not valid JSON, treat as plain text
                            return memberDetails.profile.bio_json;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assessment Section */}
          {memberDetails && (
            <div className="assessment-section mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">Đánh giá rủi ro</h3>
                <div className="d-flex gap-2">
                  {showAssessments && memberDetails.assessments && memberDetails.assessments.length > 0 && (
                    <>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={assessmentTypeFilter}
                        onChange={(e) => setAssessmentTypeFilter(e.target.value)}
                      >
                        <option value="all">Tất cả loại đánh giá</option>
                        <option value="crafft">CRAFFT</option>
                        <option value="assist">ASSIST</option>
                      </select>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={assessmentSortOrder}
                        onChange={(e) => setAssessmentSortOrder(e.target.value)}
                      >
                        <option value="desc">Mới nhất trước</option>
                        <option value="asc">Cũ nhất trước</option>
                      </select>
                    </>
                  )}
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAssessments(!showAssessments)}
                  >
                    {showAssessments ? 'Ẩn' : 'Hiện'} đánh giá
                  </button>
                </div>
              </div>

              {showAssessments && (
                <div className="card">
                  <div className="card-body">
                    {/* Assessment Summary */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="info-item">
                          <strong>Số lần đánh giá:</strong> {
                            assessmentTypeFilter === 'all'
                              ? (memberDetails.assessments?.length || 0)
                              : (sortAndFilterAssessments(memberDetails.assessments).length || 0)
                          } lần
                          {assessmentTypeFilter !== 'all' && (
                            <small className="text-muted ms-2">
                              (Đã lọc theo {assessmentTypeFilter.toUpperCase()})
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <strong>Đánh giá gần nhất:</strong> {
                            (() => {
                              const filteredAssessments = sortAndFilterAssessments(memberDetails.assessments);
                              return filteredAssessments && filteredAssessments.length > 0
                                ? formatDate(filteredAssessments[0].create_at)
                                : 'Chưa có đánh giá';
                            })()
                          }
                        </div>
                      </div>
                    </div>

                    {/* Assessment Details */}
                    {memberDetails.assessments && memberDetails.assessments.length > 0 ? (
                      <div className="assessment-details">
                        <h5 className="mb-3">Lịch sử đánh giá chi tiết</h5>
                        {(() => {
                          const filteredAndSortedAssessments = sortAndFilterAssessments(memberDetails.assessments);

                          if (filteredAndSortedAssessments.length === 0) {
                            return (
                              <div className="text-center text-muted p-4">
                                <p>Không có đánh giá nào phù hợp với bộ lọc đã chọn.</p>
                              </div>
                            );
                          }

                          return filteredAndSortedAssessments.map((assessment, index) => {
                            // Parse result_json to extract meaningful data
                            let parsedResult = null;
                            let totalScore = 0;
                            let questionCount = 0;

                            console.log(`Assessment ${index + 1}:`, assessment);
                            console.log(`Assessment type: ${assessment.type}`);
                            console.log(`Assessment result_json:`, assessment.result_json);

                            try {
                              if (assessment.result_json) {
                                parsedResult = JSON.parse(assessment.result_json);
                                console.log(`Parsed result for assessment ${index + 1}:`, parsedResult);

                                if (parsedResult.result && Array.isArray(parsedResult.result)) {
                                  questionCount = parsedResult.result.length;
                                  totalScore = parsedResult.score || 0;
                                  console.log(`Question count: ${questionCount}, Total score: ${totalScore}`);
                                  console.log('Individual questions:', parsedResult.result);
                                }
                              }
                            } catch (e) {
                              console.error(`Error parsing assessment ${index + 1} result:`, e);
                              console.error('Raw result_json:', assessment.result_json);
                            }

                            const { riskLevel, score } = calculateRiskLevel(assessment);
                            const riskLevelClass = getRiskLevelClass(riskLevel);

                            console.log(`Assessment ${index + 1} risk calculation:`, {
                              riskLevel,
                              score,
                              riskLevelClass,
                              assessmentType: assessment.type
                            });

                            return (
                              <div key={index} className="assessment-item mb-4 p-3 border rounded">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="info-item mb-2">
                                      <strong>Loại đánh giá:</strong>
                                      <span className={`ms-2 badge ${assessment.type === 'assist' ? 'bg-success' :
                                        assessment.type === 'crafft' ? 'bg-primary' : 'bg-secondary'
                                        }`}>
                                        {assessment.type?.toUpperCase() || 'Chưa xác định'}
                                      </span>
                                    </div>
                                    <div className="info-item mb-2">
                                      <strong>Ngày thực hiện:</strong> {formatDate(assessment.create_at)}
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="info-item mb-2">
                                      <strong>Tổng điểm:</strong>
                                      <span className={`ms-2 fw-bold ${score >= 15 ? 'text-danger' :
                                        score >= 10 ? 'text-warning' :
                                          score >= 5 ? 'text-info' : 'text-success'
                                        }`}>
                                        {score}
                                      </span>
                                    </div>
                                    <div className="info-item mb-2">
                                      <strong>Mức độ rủi ro:</strong>
                                      <span className={`ms-2 badge ${riskLevelClass}`}>
                                        {riskLevel}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {parsedResult && parsedResult.result && (
                                  <div className="question-details mt-3">
                                    <h6 className="mb-2">Chi tiết câu trả lời:</h6>
                                    <div className="bg-light p-2 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                      {parsedResult.result.map((question, qIndex) => (
                                        <div key={qIndex} className={`p-2 mb-1 rounded small ${question.score > 2 ? 'bg-danger bg-opacity-10 border-start border-danger border-3' :
                                          'bg-success bg-opacity-10 border-start border-success border-3'
                                          }`}>
                                          <div className="mb-1">
                                            <strong>Q{question.questionId}:</strong>
                                            {(question.questionText || question.question) && (
                                              <div className="text-muted small mt-1" style={{ fontStyle: 'italic' }}>
                                                "{question.questionText || question.question}"
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <strong>Trả lời:</strong> {question.selectedOption}
                                            <span className={`ms-2 fw-bold ${question.score > 2 ? 'text-danger' : 'text-success'}`}>
                                              ({question.score} điểm)
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div className="text-center text-muted p-4">
                        <p>Thành viên chưa thực hiện đánh giá rủi ro nào.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Section */}
          <div className="enrolled-courses mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Khóa học đã đăng ký</h3>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowCourses(!showCourses)}
              >
                {showCourses ? 'Ẩn' : 'Hiện'} khóa học
              </button>
            </div>

            {showCourses && (
              <div className="card">
                <div className="card-body">
                  {enrolledCourses.filter(program => program.enrollment_status?.is_enrolled).length === 0 ? (
                    <div className="text-center text-muted p-4">
                      <p>Chưa đăng ký khóa học nào.</p>
                    </div>
                  ) : (
                    <div className="enrolled-courses-section">
                      {/* Course Header */}
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            Tên khóa học
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            Thông tin khóa học
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="fw-bold text-muted text-center p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            Tiến độ khóa học
                          </div>
                        </div>
                      </div>

                      {/* Enrolled Courses List */}
                      <div className="row g-3">
                        {enrolledCourses
                          .filter(program => program.enrollment_status?.is_enrolled)
                          .map(program => renderEnrolledCourseCard(program))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Blogs Section */}
          <div className="written-blogs mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Bài blog đã viết</h3>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowBlogs(!showBlogs)}
              >
                {showBlogs ? 'Ẩn' : 'Hiện'} blog
              </button>
            </div>

            {showBlogs && (
              <div className="card">
                <div className="card-body">
                  {writtenBlogs.length === 0 ? (
                    <div className="text-center text-muted p-4">
                      <p>Chưa viết blog nào.</p>
                    </div>
                  ) : (
                    <div className="card-list">
                      {writtenBlogs.map((blog) => (
                        <div key={blog.id || blog.blog_id} className="card-item">
                          <div className="card-img">
                            <img
                              src={blog.img_link || Image}
                              alt={blog.title}
                              onError={e => { e.target.onerror = null; e.target.src = Image; }}
                            />
                          </div>
                          <div className="card-body">
                            <div className="card-title">{
                              typeof blog.title === 'string' ? blog.title : blog.title ? JSON.stringify(blog.title) : ''
                            }</div>
                            <div className="card-desc">{
                              typeof blog.body === 'string' ? blog.body : blog.body ? JSON.stringify(blog.body) : "N/A"
                            }</div>
                            <div className="card-meta">
                              <div><b>Tác giả:</b> {
                                memberDetails.profile?.name || 'N/A'
                              }</div>
                              <div>{formatDate(blog.created_at || blog.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sessions Section */}
          <div className="booking-sessions mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Lịch hẹn tư vấn</h3>
              <div className="d-flex gap-2">
                {showBookings && bookingSessions && bookingSessions.length > 0 && (
                  <>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="Đang chờ xác nhận">Đang chờ xác nhận</option>
                      <option value="Xác nhận thành công">Xác nhận thành công</option>
                      <option value="Đã hoàn thành">Đã hoàn thành</option>
                      <option value="Đã hủy">Đã hủy</option>
                      <option value="Bỏ lỡ">Bỏ lỡ</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={bookingSortOrder}
                      onChange={(e) => setBookingSortOrder(e.target.value)}
                    >
                      <option value="desc">Mới nhất trước</option>
                      <option value="asc">Cũ nhất trước</option>
                    </select>
                  </>
                )}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowBookings(!showBookings)}
                >
                  {showBookings ? 'Ẩn' : 'Hiện'} lịch hẹn
                </button>
              </div>
            </div>

            {showBookings && (
              <div className="card">
                <div className="card-body">
                  {loadingBookings ? (
                    <div className="text-center text-muted p-4">
                      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                      Đang tải lịch hẹn...
                    </div>
                  ) : bookingSessions.length === 0 ? (
                    <div className="text-center text-muted p-4">
                      <p>Chưa có lịch hẹn nào.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      {/* Filter Summary */}
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="info-item">
                            <strong>Số lịch hẹn hiển thị:</strong> {
                              bookingStatusFilter === 'all'
                                ? bookingSessions.length
                                : sortAndFilterBookings(bookingSessions).length
                            } / {bookingSessions.length} lịch hẹn
                            {bookingStatusFilter !== 'all' && (
                              <small className="text-muted ms-2">
                                (Đã lọc theo trạng thái: {bookingStatusFilter})
                              </small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="info-item">
                            <strong>Lịch hẹn gần nhất:</strong> {
                              (() => {
                                const filteredBookings = sortAndFilterBookings(bookingSessions);
                                return filteredBookings && filteredBookings.length > 0
                                  ? formatBookingDate(filteredBookings[0].booking_date)
                                  : 'Không có lịch hẹn';
                              })()
                            }
                          </div>
                        </div>
                      </div>

                      <table className="table table-striped table-hover">
                        <thead className="table-primary">
                          <tr>
                            <th scope="col">Ngày hẹn</th>
                            <th scope="col">Thời gian</th>
                            <th scope="col">Chuyên gia tư vấn</th>
                            <th scope="col">Trạng thái</th>
                            <th scope="col">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredAndSortedBookings = sortAndFilterBookings(bookingSessions);

                            if (filteredAndSortedBookings.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="5" className="text-center text-muted p-4">
                                    <p>Không có lịch hẹn nào phù hợp với bộ lọc đã chọn.</p>
                                  </td>
                                </tr>
                              );
                            }

                            return filteredAndSortedBookings.map((booking, index) => {
                              const statusInfo = getStatusInfo(booking.status);
                              const rowStyle = getBookingRowStyle(booking);

                              return (
                                <tr key={booking.booking_id || index} style={rowStyle}>
                                  <td>
                                    <div>
                                      <strong>{formatBookingDate(booking.booking_date)}</strong>
                                      {isBookingToday(booking) && (
                                        <div>
                                          <small className="badge bg-success ms-2">Hôm nay</small>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="fw-bold">
                                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                    </span>
                                  </td>
                                  <td>
                                    <div>
                                      <strong>{booking.consultant_name || 'Chưa xác định'}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge ${statusInfo.className}`}>
                                      {statusInfo.text}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ maxWidth: '200px' }}>
                                      {booking.notes ? (
                                        <small className="text-muted">
                                          {booking.notes.length > 50
                                            ? `${booking.notes.substring(0, 50)}...`
                                            : booking.notes}
                                        </small>
                                      ) : (
                                        <small className="text-muted">Không có ghi chú</small>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>

                      {/* Summary Statistics */}
                      <div className="mt-3 p-3 bg-light rounded">
                        <div className="row text-center">
                          <div className="col-md-3">
                            <div className="fw-bold text-primary">
                              {bookingStatusFilter === 'all' ? bookingSessions.length : sortAndFilterBookings(bookingSessions).length}
                            </div>
                            <small className="text-muted">
                              {bookingStatusFilter === 'all' ? 'Tổng số lịch hẹn' : 'Lịch hẹn đã lọc'}
                            </small>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold text-success">
                              {bookingStatusFilter === 'all'
                                ? bookingSessions.filter(b => b.status === 'Đã hoàn thành').length
                                : sortAndFilterBookings(bookingSessions).filter(b => b.status === 'Đã hoàn thành').length
                              }
                            </div>
                            <small className="text-muted">Đã hoàn thành</small>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold text-warning">
                              {bookingStatusFilter === 'all'
                                ? bookingSessions.filter(b => b.status === 'Đang chờ xác nhận' || b.status === 'Xác nhận thành công').length
                                : sortAndFilterBookings(bookingSessions).filter(b => b.status === 'Đang chờ xác nhận' || b.status === 'Xác nhận thành công').length
                              }
                            </div>
                            <small className="text-muted">Đang chờ/Xác nhận thành công</small>
                          </div>
                          <div className="col-md-3">
                            <div className="fw-bold text-danger">
                              {bookingStatusFilter === 'all'
                                ? bookingSessions.filter(b => b.status === 'Đã hủy' || b.status === 'Bỏ lỡ').length
                                : sortAndFilterBookings(bookingSessions).filter(b => b.status === 'Đã hủy' || b.status === 'Bỏ lỡ').length
                              }
                            </div>
                            <small className="text-muted">Đã hủy/Bỏ lỡ</small>
                          </div>
                        </div>

                        {/* Additional Filter Info */}
                        {bookingStatusFilter !== 'all' && (
                          <div className="mt-3 text-center">
                            <small className="text-muted">
                              <i className="bi bi-funnel me-1"></i>
                              Hiển thị {sortAndFilterBookings(bookingSessions).length} trong tổng số {bookingSessions.length} lịch hẹn
                            </small>
                            <button
                              className="btn btn-sm btn-outline-secondary ms-2"
                              onClick={() => setBookingStatusFilter('all')}
                            >
                              Xóa bộ lọc
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailMemberPage;
