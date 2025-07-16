import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaFlag } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel, MdApproval, MdBlock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FlagModal from "../../components/FlagModal";
import { flagBlog, removeFlag, checkUserFlaggedBlog, getBlogFlags, isAuthenticated, getUserFromToken } from "../../service/api";
import "../../styles/BlogListPage.scss";
import PaginationComp from "../../components/Pagination";

const BlogListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    body: "",
    status: "draft",
    img_link: "",
  });

  // ReactQuill configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['blockquote', 'code-block'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link',
    'color', 'background',
    'align', 'script',
    'code-block'
  ];

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'pending', 'published', 'draft'
  const [filterStatus, setFilterStatus] = useState('all');

  // Flag functionality state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedBlogForFlag, setSelectedBlogForFlag] = useState(null);
  const [blogFlagStatus, setBlogFlagStatus] = useState({}); // Store flag status for each blog
  const [blogFlagCounts, setBlogFlagCounts] = useState({}); // Store flag counts for each blog
  const [currentUser, setCurrentUser] = useState(null);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalBlogs, setTotalBlogs] = useState(0);

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'staff')) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }

  }
  userRole()
  const fetchBlogs = async (page = currentPage) => {
    try {
      let endpoint = "http://localhost:3000/api/admin/blogs";
      let params = { page, limit: itemsPerPage };
      // Choose endpoint based on view mode
      switch (viewMode) {
        case 'pending':
          endpoint = "http://localhost:3000/api/blogs/pending";
          break;
        case 'my':
          endpoint = "http://localhost:3000/api/blogs/my";
          break;
        case 'draft':
          endpoint = "http://localhost:3000/api/blogs/draft";
          break;
        case 'published':
          endpoint = "http://localhost:3000/api/blogs/published";
          break;
        default:
          endpoint = "http://localhost:3000/api/admin/blogs";
      }
      const res = await axios.get(endpoint, {
        params,
        headers: viewMode !== 'all' ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data.success) {
        setBlogs(res.data.data);
        setTotalBlogs(res.data.total || res.data.count || res.data.data.length);
        await loadFlagStatusForBlogs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when viewMode changes
  }, [viewMode]);

  useEffect(() => {
    fetchBlogs(currentPage);
    checkAuthAndLoadUser();
  }, [viewMode, currentPage]);

  const checkAuthAndLoadUser = async () => {
    const authenticated = isAuthenticated();
    setUserAuthenticated(authenticated);

    if (authenticated) {
      try {
        const user = getUserFromToken();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting user from token:', error);
      }
    }
  };

  const loadFlagStatusForBlogs = async (blogList) => {
    const flagStatusMap = {};
    const flagCountsMap = {};

    for (const blog of blogList) {
      try {
        // Get total flag count for this blog (always load for admin)
        const flagsResponse = await getBlogFlags(blog.blog_id);
        flagCountsMap[blog.blog_id] = flagsResponse.count || 0;

        // Get user's flag status for this blog (only if authenticated)
        if (userAuthenticated && currentUser) {
          const flagInfo = await checkUserFlaggedBlog(blog.blog_id);
          flagStatusMap[blog.blog_id] = flagInfo;
        } else {
          flagStatusMap[blog.blog_id] = { flagged: false, flagId: null };
        }
      } catch (error) {
        console.error(`Error checking flag status for blog ${blog.blog_id}:`, error);
        flagStatusMap[blog.blog_id] = { flagged: false, flagId: null };
        flagCountsMap[blog.blog_id] = 0;
      }
    }

    setBlogFlagStatus(flagStatusMap);
    setBlogFlagCounts(flagCountsMap);
  };

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewBlog({
      title: "",
      body: "",
      status: "draft",
      img_link: "",
    });
  };

  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };

  const handleQuillChange = (content) => {
    setNewBlog({ ...newBlog, body: content });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the content is not empty (ReactQuill might have empty HTML tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newBlog.body;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (!textContent.trim()) {
      alert("Vui lòng nhập nội dung blog!");
      return;
    }

    try {
      const payload = {
        ...newBlog,
        created_at: new Date().toISOString(),
      };

      console.log("Payload gửi:", payload);

      const res = await axios.post("http://localhost:3000/api/blogs", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchBlogs();
        handleClosePopup();
        alert("Tạo blog thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm blog:", err);
      alert("Có lỗi xảy ra khi tạo blog");
    }
  };



  const handleOpenDeleteDialog = (blogId) => {
    setBlogIdToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBlogIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!blogIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/blogs/${blogIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchBlogs();
        alert("Xóa blog thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa blog:", err);
      alert("Có lỗi xảy ra khi xóa blog");
    }
    handleCloseDeleteDialog();
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      const endpoint = newStatus === 'published'
        ? `http://localhost:3000/api/blogs/${blogId}/approve`
        : `http://localhost:3000/api/blogs/${blogId}/reject`;

      const res = await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchBlogs();
        alert(`Blog đã được ${newStatus === 'published' ? 'phê duyệt' : 'từ chối'}!`);
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái blog:", err);
      alert("Có lỗi xảy ra khi thay đổi trạng thái blog");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === "") {
      fetchBlogs();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/blogs/${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setBlogs([res.data.data]);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm blog:", err);
      // If single blog search fails, try to filter current blogs
      const filtered = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.body?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBlogs(filtered);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'published': 'success',
      'Đã xuất bản': 'success',
      'draft': 'secondary',
      'pending': 'warning',
      'rejected': 'danger',
      'hidden': 'dark'
    };
    return statusColors[status] || 'secondary';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Flag functionality handlers
  const handleFlagClick = (blog) => {
    if (!userAuthenticated) {
      alert('Vui lòng đăng nhập để báo cáo bài viết.');
      return;
    }

    const flagStatus = blogFlagStatus[blog.blog_id];
    if (flagStatus?.flagged) {
      handleRemoveFlag(blog.blog_id, flagStatus.flagId);
    } else {
      setSelectedBlogForFlag(blog);
      setFlagModalOpen(true);
    }
  };

  const handleFlagSubmit = async (reason) => {
    if (!selectedBlogForFlag) return;

    try {
      const response = await flagBlog(selectedBlogForFlag.blog_id, reason);

      if (response.success) {
        // Update flag status
        setBlogFlagStatus(prev => ({
          ...prev,
          [selectedBlogForFlag.blog_id]: { flagged: true, flagId: response.data.flag_id }
        }));

        // Update flag count
        setBlogFlagCounts(prev => ({
          ...prev,
          [selectedBlogForFlag.blog_id]: response.flagCount || 0
        }));

        alert('Báo cáo đã được gửi thành công. Cảm ơn bạn đã đóng góp để cải thiện chất lượng nội dung.');

        // Check if blog was deleted (3+ flags)
        if (response.blogDeleted) {
          alert('Bài viết đã bị xóa khỏi hệ thống do nhận quá nhiều báo cáo (3 báo cáo trở lên).');
          fetchBlogs(); // Refresh the list to remove deleted blog
        } else if (response.blogHidden) {
          // Blog was hidden (1-2 flags)
          alert('Bài viết đã bị ẩn do nhận báo cáo.');
          fetchBlogs(); // Refresh the list to show hidden status
        }

        // Check if author was banned
        if (response.authorBanned) {
          alert(`Thông báo: Tác giả của bài viết này đã bị khóa tài khoản do có ${response.flaggedPostsCount} bài viết bị báo cáo.`);
        }
      }
    } catch (error) {
      if (error.message.includes('already flagged')) {
        alert('Bạn đã báo cáo bài viết này rồi.');
        // Refresh flag status
        const flagInfo = await checkUserFlaggedBlog(selectedBlogForFlag.blog_id);
        setBlogFlagStatus(prev => ({
          ...prev,
          [selectedBlogForFlag.blog_id]: flagInfo
        }));
      } else {
        alert('Có lỗi xảy ra khi gửi báo cáo: ' + error.message);
      }
    }
  };

  const handleRemoveFlag = async (blogId, flagId) => {
    if (!flagId) return;

    if (!window.confirm('Bạn có chắc muốn gỡ báo cáo này không?')) return;

    try {
      const response = await removeFlag(flagId);

      if (response.success) {
        // Update flag status
        setBlogFlagStatus(prev => ({
          ...prev,
          [blogId]: { flagged: false, flagId: null }
        }));

        // Update flag count
        setBlogFlagCounts(prev => ({
          ...prev,
          [blogId]: response.remainingFlags
        }));

        alert('Đã gỡ báo cáo thành công.');

        // Check if blog was unhidden
        if (response.blogUnhidden) {
          alert('Bài viết đã được hiển thị lại do không còn báo cáo nào.');
          fetchBlogs(); // Refresh the list to reflect status change
        }
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi gỡ báo cáo: ' + error.message);
    }
  };


  // Filter blogs theo status
  const filteredBlogs = blogs.filter(b => filterStatus === 'all' || b.status === filterStatus);

  return (
    <div className={`blog-list-container ${showPopup ? 'modal-open' : ''}`}>

       <div className="card">
          <div>Tổng số blog trong danh sách</div>
          <h4>{filteredBlogs.length}</h4>
          <small>blog</small>
        </div>

      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <button className="btn btn-primary me-3" onClick={handleOpenPopup}>
            <FaPlus className="me-2" /> Tạo blog mới
          </button>

          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('all')}
            >
              Tất cả
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setViewMode('pending')}
            >
              Chờ duyệt
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'my' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setViewMode('my')}
            >
              Blog của tôi
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2" style={{ maxWidth: '500px' }}>
          <select
            className="form-select status-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm blog..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-outline-secondary" onClick={handleSearchClick}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Báo cáo</th>
              <th>Tác giả</th>
              <th>Ngày tạo</th>
              <th>Hình ảnh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map((blog, index) => (
              <tr key={blog.blog_id}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ maxWidth: '200px' }}>
                    {truncateText(blog.title, 50)}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '300px' }}>
                    {truncateText(blog.body, 100)}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column align-items-start">
                    <span className={`badge bg-${getStatusBadge(blog.status)} mb-1`}>
                      {blog.status || 'draft'}
                    </span>
                    {blog.status === 'hidden' && (
                      <span className="badge bg-warning text-dark">
                        Ẩn
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <span className={`badge ${blogFlagCounts[blog.blog_id] >= 3
                      ? 'bg-danger'
                      : blogFlagCounts[blog.blog_id] >= 1
                        ? 'bg-warning'
                        : 'bg-success'
                      }`}>
                      {blogFlagCounts[blog.blog_id] || 0} báo cáo
                    </span>
                  </div>
                </td>
                <td>{blog.author?.name || blog.author_id}</td>
                <td>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {blog.img_link ? (
                    <img
                      src={blog.img_link}
                      alt="Blog"
                      style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : 'Không có'}
                </td>
                <td className="action-buttons">
                  <button
                    className="btn btn-outline-info btn-sm me-1"
                    onClick={() => window.open(`/blog/${blog.blog_id}`, '_blank')}
                    title="Xem blog"
                  >
                    <FaEye />
                  </button>
                  {blog.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-outline-success btn-sm me-1"
                        onClick={() => handleStatusChange(blog.blog_id, 'published')}
                        title="Phê duyệt"
                      >
                        <MdApproval />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm me-1"
                        onClick={() => handleStatusChange(blog.blog_id, 'rejected')}
                        title="Từ chối"
                      >
                        <MdBlock />
                      </button>
                    </>
                  )}
                  <button
                    className={`btn btn-sm me-1 ${blogFlagStatus[blog.blog_id]?.flagged
                      ? 'btn-warning'
                      : 'btn-outline-warning'
                      }`}
                    onClick={() => handleFlagClick(blog)}
                    title={
                      blogFlagStatus[blog.blog_id]?.flagged
                        ? 'Gỡ báo cáo'
                        : 'Báo cáo bài viết'
                    }
                  >
                    <FaFlag />
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm me-1"
                    onClick={() => window.open(`/admin/flags/blog/${blog.blog_id}`, '_blank')}
                    title="Xem tất cả báo cáo"
                  >
                    <FaFlag />
                    <small className="ms-1">({blogFlagCounts[blog.blog_id] || 0})</small>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleOpenDeleteDialog(blog.blog_id)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-4">
            <p>Không có blog nào để hiển thị.</p>
          </div>
        )}
      </div>

      {/* Pagination below table */}
      <PaginationComp
        totalItems={totalBlogs}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        maxPageNumbersToShow={5}
        onPageChange={page => setCurrentPage(page)}
      />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>Tạo blog mới</h2>
              <form className="form-grid" onSubmit={handleSubmit}>
                <div style={{ gridColumn: 'span 2' }} className="title-input-container">
                  <label className="form-label">Tiêu đề blog *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Nhập tiêu đề cho blog của bạn..."
                    value={newBlog.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }} className="quill-editor-container">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label text-start mb-0">Nội dung blog *</label>
                    <small className="text-muted">
                      {(() => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newBlog.body;
                        const textContent = tempDiv.textContent || tempDiv.innerText || '';
                        const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
                        return `${textContent.length} ký tự, ${wordCount} từ`;
                      })()}
                    </small>
                  </div>
                  <ReactQuill
                    theme="snow"
                    value={newBlog.body}
                    onChange={handleQuillChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Viết nội dung blog của bạn..."
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '5px',
                      minHeight: '200px'
                    }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }} className="image-input-container">
                  <label className="form-label">Link hình ảnh (không bắt buộc)</label>
                  <input
                    type="url"
                    name="img_link"
                    placeholder="https://example.com/image.jpg"
                    value={newBlog.img_link}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ gridColumn: 'span 1' }} className="select-container">
                  <label className="form-label">Trạng thái *</label>
                  <select
                    name="status"
                    value={newBlog.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button type="submit" className="form-button">
                  Tạo
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content position-relative">
              <button type="button" className="close position-absolute top-0 end-0 m-2"
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
                style={{ border: 'none', background: 'none' }}>
                <span><MdCancel size={20} /></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận xóa</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa blog này không? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FlagModal
        isOpen={flagModalOpen}
        onClose={() => {
          setFlagModalOpen(false);
          setSelectedBlogForFlag(null);
        }}
        onSubmit={handleFlagSubmit}
        blogId={selectedBlogForFlag?.blog_id}
        blogTitle={selectedBlogForFlag?.title || 'Bài viết'}
      />
    </div>
  );
};

export default BlogListPage;
