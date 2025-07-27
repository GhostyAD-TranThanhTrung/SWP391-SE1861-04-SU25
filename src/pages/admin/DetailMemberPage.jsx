import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/DetailMemberPage.scss";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Image from '../../images/Images.jpg';

const DetailMemberPage = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [writtenBlogs, setWrittenBlogs] = useState([]);
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem('token');
  const {userId} = useParams();

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
  userRole()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
       
        // Fetch enrolled courses first
        const coursesRes = await axios.get("http://localhost:3000/api/programs/my-enrollment-status", {
          userId: userId,
          headers: { Authorization: `Bearer ${token}` }
        });
        // Lọc chỉ lấy các khóa học đã enroll
        const allCourses = coursesRes.data.data || [];
        const enrolledOnly = allCourses.filter(course => course.is_enrolled === 'true');
        setEnrolledCourses(enrolledOnly);
        // Then fetch written blogs
        const blogsRes = await axios.get("http://localhost:3000/api/blogs/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWrittenBlogs(blogsRes.data.data || []);
        // Fetch survey responses by userId
        if (userId) {
          const surveyRes = await axios.get(`http://localhost:3000/api/survey-responses/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSurveyResponses(surveyRes.data.data || []);
        }
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  return(
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
          <div className="enrolled-courses">
            <h3>Khóa học đã đăng ký</h3>
            {enrolledCourses.length === 0 ? (
              <div className="empty">Chưa đăng ký khóa học nào.</div>
            ) : (
              <div className="card-list">
                {enrolledCourses.map((course) => (
                  <div key={course.id || course.program_id} className="card-item">
                    <div className="card-img">
                      <img
                        src={course.img_link || Image}
                        alt={course.title || course.name}
                        onError={e => { e.target.onerror = null; e.target.src = Image; }}
                      />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{
                        course.title
                      }</div>
                      <div className="card-meta">
                        <div><span role="img" aria-label="author">👤</span> <b>Tác giả:</b> {
                          course.create_by
                        }</div>
                        <div><span role="img" aria-label="age">🏷️</span> <b>Nhóm tuổi:</b> {
                          course.age_group
                        }</div>
                        <div><span role="img" aria-label="date">📅</span> {formatDate(course.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="written-blogs">
            <h3>Bài blog đã viết</h3>
            {writtenBlogs.length === 0 ? (
              <div className="empty">Chưa viết blog nào.</div>
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
                        typeof blog.description === 'string' ? blog.description : blog.description ? JSON.stringify(blog.description) : "N/A"
                      }</div>
                      <div className="card-meta">
                        <div><span role="img" aria-label="author">👤</span> <b>Tác giả:</b> {
                          typeof blog.author === 'string' ? blog.author : blog.author ? JSON.stringify(blog.author) :
                          (typeof blog.creator_email === 'string' ? blog.creator_email : blog.creator_email ? JSON.stringify(blog.creator_email) : "N/A")
                        }</div>
                        <div><span role="img" aria-label="date">📅</span> {formatDate(blog.created_at || blog.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="survey-responses">
            <h3>Kết quả khảo sát</h3>
            {surveyResponses.length === 0 ? (
              <div className="empty">Chưa có kết quả khảo sát nào.</div>
            ) : (
              <div className="card-list">
                {surveyResponses.map((resp, idx) => {
                  let answers = [];
                  try {
                    const parsed = typeof resp.answer_json === 'string' ? JSON.parse(resp.answer_json) : resp.answer_json;
                    answers = parsed.responses || [];
                  } catch {
                    answers = [];
                  }
                  return (
                    <div key={resp.response_id || idx} className="card-item survey-item">
                      <div className="card-body">
                        <div className="card-title">Survey #{resp.survey_id}</div>
                        <div className="card-desc">
                          {answers.length === 0 ? (
                            <div className="empty">Không có câu trả lời.</div>
                          ) : (
                            <ul className="survey-qa-list">
                              {answers.map((qa, i) => (
                                <li key={qa.id || i} className="survey-qa-item">
                                  <div className="survey-question"><b>Câu hỏi:</b> {qa.question}</div>
                                  <div className="survey-answer"><b>Trả lời:</b> {qa.answer}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="card-meta">
                          <div><span role="img" aria-label="date">📅</span> {formatDate(resp.submitted_at)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailMemberPage;
