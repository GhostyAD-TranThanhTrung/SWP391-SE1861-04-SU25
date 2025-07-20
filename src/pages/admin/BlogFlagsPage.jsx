import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFlag, FaUser, FaCalendar, FaTrash } from "react-icons/fa";
import { getBlogFlags, removeFlag } from "../../service/api";
import axios from "axios";

const BlogFlagsPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [flags, setFlags] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem("token");

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
    fetchBlogAndFlags();
  }, [blogId]);

  const fetchBlogAndFlags = async () => {
    try {
      setLoading(true);

      // Fetch blog details
      const blogResponse = await axios.get(`http://localhost:3000/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (blogResponse.data.success) {
        setBlog(blogResponse.data.data);
      }

      // Fetch flags for the blog
      const flagsResponse = await getBlogFlags(blogId);
      setFlags(flagsResponse.data || []);

    } catch (err) {
      console.error("Error fetching blog flags:", err);
      setError("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlag = async (flagId) => {
    if (!window.confirm('Bạn có chắc muốn xóa báo cáo này không?')) return;

    try {
      const response = await removeFlag(flagId);

      if (response.success) {
        // Remove the flag from the list
        setFlags(prev => prev.filter(flag => flag.flag_id !== flagId));
        alert('Đã xóa báo cáo thành công.');

        // Check if blog was unhidden
        if (response.blogUnhidden) {
          alert('Bài viết đã được hiển thị lại do không còn báo cáo nào.');
          // Refresh blog data to update status
          fetchBlogAndFlags();
        }
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa báo cáo: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getReasonBadge = (reason) => {
    const reasonMap = {
      'spam': { color: 'warning', text: 'Spam' },
      'inappropriate': { color: 'danger', text: 'Không phù hợp' },
      'harassment': { color: 'danger', text: 'Quấy rối' },
      'misinformation': { color: 'info', text: 'Thông tin sai' },
      'other': { color: 'secondary', text: 'Khác' }
    };

    const reasonInfo = reasonMap[reason] || { color: 'secondary', text: reason || 'Không rõ' };
    return reasonInfo;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải danh sách báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Lỗi</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/blog-list')}>
            <FaArrowLeft className="me-2" />
            Quay lại danh sách blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            className="btn btn-outline-secondary mb-2"
            onClick={() => navigate('/blog-list')}
          >
            <FaArrowLeft className="me-2" />
            Quay lại danh sách blog
          </button>
          <h2 className="mb-0">
            <FaFlag className="me-2 text-warning" />
            Báo cáo cho bài viết
          </h2>
        </div>
        <div className="text-end">
          <span className={`badge fs-6 ${flags.length >= 3 ? 'bg-danger' : flags.length >= 1 ? 'bg-warning' : 'bg-success'
            }`}>
            {flags.length} báo cáo
          </span>
        </div>
      </div>

      {/* Blog Info */}
      {blog && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Thông tin bài viết</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <h6><strong>Tiêu đề:</strong> {blog.title}</h6>
                <p><strong>Nội dung:</strong> {blog.body?.substring(0, 200)}...</p>
                <p><strong>Tác giả:</strong> {blog.author?.name || blog.author_id}</p>
                <p><strong>Ngày tạo:</strong> {formatDate(blog.created_at)}</p>
              </div>
              <div className="col-md-4">
                <div className="d-flex flex-column">
                  <span className={`badge bg-${blog.status === 'published' || blog.status === 'Đã xuất bản' ? 'success' :
                    blog.status === 'hidden' ? 'dark' :
                      blog.status === 'pending' ? 'warning' :
                        blog.status === 'draft' ? 'secondary' : 'danger'
                    } mb-2`}>
                    Trạng thái: {blog.status || 'draft'}
                  </span>
                  {blog.status === 'hidden' && (
                    <span className="badge bg-warning text-dark">
                      Đã bị ẩn do báo cáo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flags List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Danh sách báo cáo ({flags.length})</h5>
        </div>
        <div className="card-body">
          {flags.length === 0 ? (
            <div className="text-center text-muted py-4">
              <FaFlag size={48} className="mb-3 opacity-50" />
              <h5>Không có báo cáo nào</h5>
              <p>Bài viết này chưa nhận được báo cáo từ người dùng.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Người báo cáo</th>
                    <th>Lý do</th>
                    <th>Ngày báo cáo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((flag, index) => {
                    const reasonInfo = getReasonBadge(flag.reason);
                    return (
                      <tr key={flag.flag_id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUser className="me-2 text-muted" />
                            <div>
                              <div>{flag.user?.name || 'Người dùng ẩn danh'}</div>
                              <small className="text-muted">
                                ID: {flag.flagged_by}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${reasonInfo.color}`}>
                            {reasonInfo.text}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendar className="me-2 text-muted" />
                            {formatDate(flag.created_at)}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveFlag(flag.flag_id)}
                            title="Xóa báo cáo"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {flags.length > 0 && (
        <div className="card mt-4">
          <div className="card-body">
            <h6>Hướng dẫn:</h6>
            <ul className="mb-0">
              <li>Bài viết sẽ tự động bị <strong>ẩn</strong> khi có 1 báo cáo trở lên</li>
              <li>Bài viết sẽ tự động bị <strong>xóa</strong> khi có 3 báo cáo trở lên</li>
              <li>Bạn có thể xóa từng báo cáo để gỡ ẩn bài viết nếu cần thiết</li>
              <li>Khi xóa hết báo cáo, bài viết sẽ được hiển thị lại tự động</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogFlagsPage;
