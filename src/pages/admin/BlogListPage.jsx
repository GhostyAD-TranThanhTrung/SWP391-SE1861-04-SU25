import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaFlag, FaUsers } from "react-icons/fa";
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

  // Statistics state - no longer needed as we'll calculate from filtered data

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
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
  useEffect(() => {
    (async () => {
      await userRole()
    })()
  }, [])
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


  // Filter blogs
  const filteredBlogs = blogs.filter(b => filterStatus === 'all' || b.status === filterStatus);

  // Calculate statistics from all blogs data
  const publishedCount = blogs.filter(b => b.status === 'published' || b.status === 'Đã xuất bản').length;
  const draftCount = blogs.filter(b => b.status === 'draft').length;
  const pendingCount = blogs.filter(b => b.status === 'pending').length;

  return (
    <div className={`blog-list-container ${showPopup ? 'modal-open' : ''}`}>

      <div className="row g-4 mb-4">
        {/* Total Blogs Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle">
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Tổng số blog</div>
                <div className="h3 mb-0 fw-bold">{blogs.length}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Published Blogs Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle">
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Blog đã xuất bản</div>
                <div className="h3 mb-0 fw-bold">{publishedCount}</div>
                <div className="small text-muted">được xuất bản</div>
              </div>
            </div>
          </div>
        </div>

        {/* Draft Blogs Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle">
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Bản nháp</div>
                <div className="h3 mb-0 fw-bold">{draftCount}</div>
                <div className="small text-muted">Nháp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Blogs Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle">
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Chờ duyệt</div>
                <div className="h3 mb-0 fw-bold">{pendingCount}</div>
                <div className="small text-muted">Chờ duyệt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <button className="btn btn-primary shadow-sm" onClick={handleOpenPopup}>
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

            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select shadow-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="pending">Chờ duyệt</option>
                <option value="draft">Bản nháp</option>
                <option value="rejected">Bị từ chối</option>
              </select>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control shadow-sm"
                  placeholder="Tìm kiếm blog..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="btn btn-outline-secondary shadow-sm" onClick={handleSearchClick}>
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-cards-wrapper">
        <div className="row g-4">
          {filteredBlogs.map((blog) => (
            <div key={blog.blog_id} className="col-xl-3 col-lg-4 col-md-6">
              <div className="blog-card">
                <div className="blog-card-header">
                  <div className="blog-image">
                    {blog.img_link ? (
                      <img
                        src={blog.img_link}
                        alt="Blog"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="no-image">
                        <FaUsers />
                      </div>
                    )}
                  </div>
                  <div className="blog-status">
                    <span className={`badge bg-${getStatusBadge(blog.status)}`}>
                      {blog.status || 'draft'}
                    </span>
                    {blog.status === 'hidden' && (
                      <span className="badge bg-warning text-dark ms-1">
                        Ẩn
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="blog-card-body">
                  <h5 className="blog-title">
                    {truncateText(blog.title, 60)}
                  </h5>
                  <p className="blog-content">
                    {truncateText(blog.body, 120)}
                  </p>
                  
                  <div className="blog-meta">
                    <div className="meta-item">
                      <span className="meta-label">Tác giả:</span>
                      <span className="meta-value">{blog.author?.name || blog.author?.email}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Ngày tạo:</span>
                      <span className="meta-value">
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Báo cáo:</span>
                      <span className={`badge ${blogFlagCounts[blog.blog_id] >= 3
                        ? 'bg-danger'
                        : blogFlagCounts[blog.blog_id] >= 1
                          ? 'bg-warning'
                          : 'bg-success'
                        }`}>
                        {blogFlagCounts[blog.blog_id] || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="blog-card-footer">
                  <div className="action-buttons">
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => window.open(`/blog/${blog.blog_id}`, '_blank')}
                      title="Xem blog"
                    >
                      <FaEye />
                    </button>
                    
                    {blog.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleStatusChange(blog.blog_id, 'published')}
                          title="Phê duyệt"
                        >
                          <MdApproval />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleStatusChange(blog.blog_id, 'rejected')}
                          title="Từ chối"
                        >
                          <MdBlock />
                        </button>
                      </>
                    )}
                    
                    <button
                      className={`btn btn-sm ${blogFlagStatus[blog.blog_id]?.flagged
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
                      className="btn btn-outline-secondary btn-sm"
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-5">
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h4>Không có blog nào để hiển thị</h4>
              <p>Hãy tạo blog mới hoặc thay đổi bộ lọc để xem kết quả</p>
            </div>
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
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title fw-bold">Tạo blog mới</h4>
                <button type="button" className="btn-close" onClick={handleClosePopup} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Title Input */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Tiêu đề blog <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="Nhập tiêu đề cho blog của bạn..."
                        value={newBlog.title}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '1rem', padding: '0.75rem' }}
                      />
                    </div>

                    {/* Content Editor */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">
                          Nội dung blog <span className="text-danger">*</span>
                        </label>
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
                      <div style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '0.375rem',
                        backgroundColor: '#fff'
                      }}>
                        <ReactQuill
                          theme="snow"
                          value={newBlog.body}
                          onChange={handleQuillChange}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Viết nội dung blog của bạn..."
                          style={{
                            minHeight: '300px',
                            backgroundColor: '#fff'
                          }}
                        />
                      </div>
                    </div>

                    {/* Image Link and Status Row */}
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Link hình ảnh (không bắt buộc)</label>
                      <input
                        type="url"
                        name="img_link"
                        className="form-control"
                        placeholder="https://example.com/image.jpg"
                        value={newBlog.img_link}
                        onChange={handleChange}
                        style={{ fontSize: '1rem', padding: '0.75rem' }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Trạng thái <span className="text-danger">*</span>
                      </label>
                      <select
                        name="status"
                        className="form-select"
                        value={newBlog.status}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '1rem', padding: '0.75rem' }}
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="rejected">Bị từ chối</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClosePopup}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  style={{ minWidth: '100px' }}
                >
                  Tạo blog
                </button>
              </div>
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
