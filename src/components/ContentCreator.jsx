import React, { useState, useRef, useEffect } from "react";
import { 
  FaPlus, FaTrash, FaSave, FaTimes, FaImage, FaCode, FaEye, FaBold, FaItalic, 
  FaLink, FaListUl, FaListOl, FaQuoteLeft, FaTable, FaUndo, FaRedo,
  FaHeading, FaStrikethrough, FaExpand, FaCompress, FaVideo, FaExternalLinkAlt
} from "react-icons/fa";
import { MdCancel, MdSave, MdPreview, MdVerticalSplit, MdFullscreen } from "react-icons/md";
import "../styles/ContentCreator.scss";

const ContentCreator = ({ 
  program, 
  contents, 
  onSave, 
  onCancel, 
  onDelete,
  onUpdate 
}) => {
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // New state for video URL
  const [editingContent, setEditingContent] = useState(null);
  const [editorMode, setEditorMode] = useState('split'); // 'edit', 'preview', 'split'
  const [uploadedImages, setUploadedImages] = useState([]); // Store uploaded image paths
  const [showImagePanel, setShowImagePanel] = useState(false); // Toggle image panel
  const textareaRef = useRef(null);
  
  const [newContent, setNewContent] = useState({
    title: "",
    type: "markdown",
    orders: 1,
    content_file_link: "",
    content_type: "markdown",
    content_metadata_json: JSON.stringify({
      author: "Admin",
      readingTime: "5 min",
      difficulty: "beginner"
    })
  });

  // Auto-save content to localStorage
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (markdownContent && newContent.type === 'markdown') {
        localStorage.setItem('markdown-draft', markdownContent);
      }
      if (videoUrl && newContent.type === 'video') {
        localStorage.setItem('video-url-draft', videoUrl);
      }
    }, 1000);
    return () => clearTimeout(autoSave);
  }, [markdownContent, videoUrl, newContent.type]);

  // Load draft from localStorage
  useEffect(() => {
    if (!editingContent) {
      const markdownDraft = localStorage.getItem('markdown-draft');
      const videoDraft = localStorage.getItem('video-url-draft');
      
      if (markdownDraft && newContent.type === 'markdown') {
        setMarkdownContent(markdownDraft);
      }
      if (videoDraft && newContent.type === 'video') {
        setVideoUrl(videoDraft);
      }
    }
  }, [editingContent, newContent.type]);

  // Clear draft when content type changes
  useEffect(() => {
    setMarkdownContent("");
    setVideoUrl("");
    localStorage.removeItem('markdown-draft');
    localStorage.removeItem('video-url-draft');
  }, [newContent.type]);

  const insertAtCursor = (text, selectionStart = null, selectionEnd = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const before = markdownContent.substring(0, start);
    const after = markdownContent.substring(end);
    
    setMarkdownContent(before + text + after);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const wrapSelection = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    
    if (selectedText) {
      insertAtCursor(before + selectedText + after, start, end);
    } else {
      insertAtCursor(before + after, start, end);
      // Position cursor between the markers
      setTimeout(() => {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  const formatMarkdown = (markdown) => {
    if (!markdown) return '';

    let html = markdown
      // Headers
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images - convert relative paths to absolute URLs for live preview
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        console.log('Image found in markdown:', { match, alt, src });
        
        let finalSrc = src;
        
        // Handle different path formats and convert to API endpoint
        if (src.startsWith('../image/')) {
          const filename = src.replace('../image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted ../image/ path:', finalSrc);
        } else if (src.startsWith('./image/')) {
          const filename = src.replace('./image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted ./image/ path:', finalSrc);
        } else if (src.startsWith('/image/')) {
          const filename = src.replace('/image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted /image/ path:', finalSrc);
        } else if (src.includes('/image/')) {
          // Handle any path containing /image/
          const filename = src.substring(src.lastIndexOf('/image/') + 7);
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted generic /image/ path:', finalSrc);
        } else if (!src.startsWith('http') && !src.startsWith('data:')) {
          // If it's not an external URL or data URL, treat it as a filename
          const filename = src.replace(/^[.\/]*/, ''); // Remove leading ./ or /
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted plain filename to API path:', finalSrc);
        }
        // If it's already a valid HTTP URL or data URL, keep it as is
        
        const imgTag = `<img src="${finalSrc}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onError="console.error('Image failed to load:', '${finalSrc}'); this.style.border='2px dashed #dc3545'; this.style.padding='20px'; this.style.backgroundColor='#f8d7da'; this.style.color='#721c24'; this.innerHTML='❌ Image failed to load: ${alt || 'Unknown'}'; this.style.textAlign='center';" />`;
        console.log('Generated img tag:', imgTag);
        return imgTag;
      })
      // Lists
      .replace(/^\d+\.\s+(.*$)/gim, '<li class="ordered">$1</li>')
      .replace(/^[-*+]\s+(.*$)/gim, '<li class="unordered">$1</li>')
      // Blockquotes
      .replace(/^>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---+$/gim, '<hr>')
      // Line breaks
      .replace(/\n/gim, '<br/>');

    // Wrap lists
    html = html.replace(/(<li class="ordered">.*?<\/li>(?:\s*<br\/>\s*<li class="ordered">.*?<\/li>)*)/gims, '<ol>$1</ol>');
    html = html.replace(/(<li class="unordered">.*?<\/li>(?:\s*<br\/>\s*<li class="unordered">.*?<\/li>)*)/gims, '<ul>$1</ul>');
    
    // Clean up
    html = html.replace(/<br\/>\s*(<[ou]l>)/gim, '$1');
    html = html.replace(/(<\/[ou]l>)\s*<br\/>/gim, '$1');
    html = html.replace(/<br\/>\s*(<h[1-6]>)/gim, '$1');
    html = html.replace(/(<\/h[1-6]>)\s*<br\/>/gim, '$1');
    html = html.replace(/<br\/>\s*(<blockquote>)/gim, '$1');
    html = html.replace(/(<\/blockquote>)\s*<br\/>/gim, '$1');

    return html;
  };

  const toolbarActions = {
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    strikethrough: () => wrapSelection('~~', '~~'),
    heading1: () => insertAtCursor('# '),
    heading2: () => insertAtCursor('## '),
    heading3: () => insertAtCursor('### '),
    link: () => wrapSelection('[', '](url)'),
    image: () => wrapSelection('![', '](image-url)'),
    unorderedList: () => insertAtCursor('- '),
    orderedList: () => insertAtCursor('1. '),
    blockquote: () => insertAtCursor('> '),
    code: () => wrapSelection('`', '`'),
    codeBlock: () => insertAtCursor('\n```\n\n```\n'),
    table: () => insertAtCursor('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'),
    horizontalRule: () => insertAtCursor('\n---\n')
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Get image dimensions before upload
    const getImageDimensions = (file) => {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve({ width: 0, height: 0 });
        };
        img.src = url;
      });
    };
    
    try {
      console.log("Uploading image:", file.name);
      
      // Get file size and dimensions
      const fileSizeKB = Math.round(file.size / 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const dimensions = await getImageDimensions(file);
      
      const res = await fetch("http://localhost:3000/api/images/upload", {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Upload response:", data);
        if (data.success) {
          const imageUrl = data.imageUrl || data.data.relativePath;
          const imageMarkdown = `![Image](${imageUrl})`;
          
          // Create preview URL for the uploaded image using the correct API endpoint
          const previewUrl = `http://localhost:3000/api/images/${data.data.filename}`;
          
          // Add to uploaded images list with enhanced data
          const newImage = {
            id: Date.now(),
            filename: data.data.filename,
            originalName: data.data.originalName,
            path: imageUrl,
            markdown: imageMarkdown,
            uploadedAt: new Date().toLocaleString(),
            fileSize: fileSizeKB < 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`,
            dimensions: dimensions,
            previewUrl: previewUrl,
            mimeType: file.type
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          setShowImagePanel(true); // Auto-show the panel when image is uploaded
        } else {
          alert("Failed to upload image: " + data.message);
        }
      } else {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        alert("Failed to upload image: " + (errorData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image: " + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Copied to clipboard!");
      } catch (err) {
        alert("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    });
  };

  const testImageUrl = async (imageUrl) => {
    try {
      console.log('Testing image URL:', imageUrl);
      const response = await fetch(imageUrl, { method: 'HEAD' });
      console.log('Image URL test response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Image URL test failed:', error);
      return false;
    }
  };

  const clearUploadedImages = () => {
    setUploadedImages([]);
  };

  const handleCreateContent = () => {
    setShowMarkdownEditor(true);
    setEditingContent(null);
    setNewContent({
      title: "",
      type: "markdown",
      orders: contents.length + 1,
      content_file_link: "",
      content_type: "markdown",
      content_metadata_json: JSON.stringify({
        author: "Admin",
        readingTime: "5 min",
        difficulty: "beginner"
      })
    });
    setMarkdownContent("");
    localStorage.removeItem('markdown-draft');
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setShowMarkdownEditor(true);
    setNewContent({
      title: content.title,
      type: content.type,
      orders: content.orders,
      content_file_link: content.content_file_link,
      content_type: content.content_type,
      content_metadata_json: content.content_metadata_json
    });
    
    // Set content based on type
    if (content.type === 'video' || content.content_type === 'video') {
      setVideoUrl(content.content_file_link || "");
      setMarkdownContent("");
    } else {
      setMarkdownContent(content.content_file_link || "");
      setVideoUrl("");
    }
    
    localStorage.removeItem('markdown-draft');
    localStorage.removeItem('video-url-draft');
  };

  const handleSaveContent = () => {
    if (!newContent.title.trim()) {
      alert("Please enter a content title.");
      return;
    }

    if (!markdownContent.trim() && newContent.type === 'markdown') {
      alert("Please enter some content for markdown.");
      return;
    }

    if (!videoUrl && newContent.type === 'video') {
      alert("Please enter a video URL for video content.");
      return;
    }

    const contentData = {
      ...newContent,
      content_file_link: markdownContent, // For markdown, it's the markdown content
      program_id: program.program_id
    };

    if (newContent.type === 'video') {
      contentData.content_file_link = videoUrl; // For video, it's the video URL
    }

    if (editingContent) {
      onUpdate(editingContent.content_id, contentData);
    } else {
      onSave(contentData);
    }

    setShowMarkdownEditor(false);
    setEditingContent(null);
    setNewContent({
      title: "",
      type: "markdown",
      orders: 1,
      content_file_link: "",
      content_type: "markdown",
      content_metadata_json: JSON.stringify({
        author: "Admin",
        readingTime: "5 min",
        difficulty: "beginner"
      })
    });
    setMarkdownContent("");
    setVideoUrl("");
    localStorage.removeItem('markdown-draft');
    localStorage.removeItem('video-url-draft');
  };

  const handleCancelEdit = () => {
    const hasChanges = (newContent.type === 'markdown' && markdownContent) || 
                      (newContent.type === 'video' && videoUrl);
    
    if (hasChanges && window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      setShowMarkdownEditor(false);
      setEditingContent(null);
      setMarkdownContent("");
      setVideoUrl("");
      localStorage.removeItem('markdown-draft');
      localStorage.removeItem('video-url-draft');
    } else if (!hasChanges) {
      setShowMarkdownEditor(false);
      setEditingContent(null);
      setMarkdownContent("");
      setVideoUrl("");
      localStorage.removeItem('markdown-draft');
      localStorage.removeItem('video-url-draft');
    }
  };

  const handleDeleteContent = (contentId, contentTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contentTitle}"?`)) {
      onDelete(contentId);
    }
  };

  const handleMoveContentUp = (content) => {
    const sortedContents = [...contents].sort((a, b) => a.orders - b.orders);
    const currentIndex = sortedContents.findIndex(c => c.content_id === content.content_id);
    
    if (currentIndex > 0) {
      const currentContent = sortedContents[currentIndex];
      const previousContent = sortedContents[currentIndex - 1];
      
      // Swap orders
      const tempOrder = currentContent.orders;
      currentContent.orders = previousContent.orders;
      previousContent.orders = tempOrder;
      
      // Update both contents
      onUpdate(currentContent.content_id, currentContent);
      onUpdate(previousContent.content_id, previousContent);
    }
  };

  const handleMoveContentDown = (content) => {
    const sortedContents = [...contents].sort((a, b) => a.orders - b.orders);
    const currentIndex = sortedContents.findIndex(c => c.content_id === content.content_id);
    
    if (currentIndex < sortedContents.length - 1) {
      const currentContent = sortedContents[currentIndex];
      const nextContent = sortedContents[currentIndex + 1];
      
      // Swap orders
      const tempOrder = currentContent.orders;
      currentContent.orders = nextContent.orders;
      nextContent.orders = tempOrder;
      
      // Update both contents
      onUpdate(currentContent.content_id, currentContent);
      onUpdate(nextContent.content_id, nextContent);
    }
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toolbarActions.bold();
          break;
        case 'i':
          e.preventDefault();
          toolbarActions.italic();
          break;
        case 'k':
          e.preventDefault();
          toolbarActions.link();
          break;
        case 's':
          e.preventDefault();
          handleSaveContent();
          break;
      }
    }
    
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
    }
  };

  const renderToolbar = () => (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.heading1()} title="Heading 1" className="toolbar-btn">
          <FaHeading />1
        </button>
        <button onClick={() => toolbarActions.heading2()} title="Heading 2" className="toolbar-btn">
          <FaHeading />2
        </button>
        <button onClick={() => toolbarActions.heading3()} title="Heading 3" className="toolbar-btn">
          <FaHeading />3
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.bold()} title="Bold (Ctrl+B)" className="toolbar-btn">
          <FaBold />
        </button>
        <button onClick={() => toolbarActions.italic()} title="Italic (Ctrl+I)" className="toolbar-btn">
          <FaItalic />
        </button>
        <button onClick={() => toolbarActions.strikethrough()} title="Strikethrough" className="toolbar-btn">
          <FaStrikethrough />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.unorderedList()} title="Bullet List" className="toolbar-btn">
          <FaListUl />
        </button>
        <button onClick={() => toolbarActions.orderedList()} title="Numbered List" className="toolbar-btn">
          <FaListOl />
        </button>
        <button onClick={() => toolbarActions.blockquote()} title="Quote" className="toolbar-btn">
          <FaQuoteLeft />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.link()} title="Link (Ctrl+K)" className="toolbar-btn">
          <FaLink />
        </button>
        <button onClick={() => toolbarActions.image()} title="Image" className="toolbar-btn">
          <FaImage />
        </button>
        <button onClick={() => toolbarActions.table()} title="Table" className="toolbar-btn">
          <FaTable />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.code()} title="Inline Code" className="toolbar-btn">
          <FaCode />
        </button>
        <button onClick={() => toolbarActions.codeBlock()} title="Code Block" className="toolbar-btn">
          <FaCode />
          <span style={{fontSize: '0.8em'}}>□</span>
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          style={{display: 'none'}}
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        <button 
          onClick={() => document.getElementById('imageUpload').click()}
          title="Upload Image"
          className="toolbar-btn"
        >
          <FaImage /> Upload
        </button>
        <button 
          onClick={() => setShowImagePanel(!showImagePanel)}
          title="Toggle Image Panel"
          className={`toolbar-btn ${showImagePanel ? 'active' : ''}`}
        >
          <FaImage /> Panel {uploadedImages.length > 0 && `(${uploadedImages.length})`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="content-creator">
      <div className="creator-header">
        <h5>{program?.title}</h5>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateContent}
          >
            <FaPlus className="me-1" /> Create New Content
          </button>
        </div>
      </div>

      <div className="creator-content">
        {showMarkdownEditor ? (
          <div className="markdown-editor">
            <div className="editor-header">
              <h6>{editingContent ? 'Edit Content' : 'Create New Content'}</h6>
              <div className="mode-controls">
                <button 
                  className={`btn btn-sm ${editorMode === 'edit' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('edit')}
                  title="Edit Mode"
                >
                  <FaCode className="me-1" /> Edit
                </button>
                <button 
                  className={`btn btn-sm ${editorMode === 'split' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('split')}
                  title="Split Mode"
                >
                  <MdVerticalSplit className="me-1" /> Split
                </button>
                <button 
                  className={`btn btn-sm ${editorMode === 'preview' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('preview')}
                  title="Preview Mode"
                >
                  <FaEye className="me-1" /> Preview
                </button>
                <button 
                  className="btn btn-sm btn-success me-2"
                  onClick={handleSaveContent}
                  title="Save (Ctrl+S)"
                >
                  <FaSave className="me-1" /> Save
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                  title="Cancel"
                >
                  <FaTimes className="me-1" /> Cancel
                </button>
              </div>
            </div>

            {/* Content Details Form - Moved to Top */}
            <div className="content-details-form">
              <h6>Content Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Content Title *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Enter content title..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Content Type</label>
                  <select 
                    className="form-control"
                    value={newContent.type}
                    onChange={(e) => setNewContent({...newContent, type: e.target.value, content_type: e.target.value})}
                  >
                    <option value="markdown">📝 Markdown</option>
                    <option value="video">🎥 Video</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Order</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1"
                    value={newContent.orders}
                    onChange={(e) => setNewContent({...newContent, orders: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Content Input based on Type */}
            {newContent.type === 'video' && (
              <div className="video-input-section">
                <h6>Video Content</h6>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Video URL *</label>
                    <input 
                      type="url" 
                      className="form-control"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                    <small className="form-text text-muted">
                      Supported: YouTube, Vimeo, and direct video file URLs
                    </small>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Preview</label>
                    <div className="video-preview">
                      {videoUrl ? (
                        <div className="video-preview-card">
                          <FaVideo className="me-2" />
                          <span>Video URL Set</span>
                          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                            <FaExternalLinkAlt />
                          </a>
                        </div>
                      ) : (
                        <div className="video-preview-placeholder">
                          <FaVideo className="me-2" />
                          <span>No video URL</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newContent.type === 'markdown' && renderToolbar()}

            {/* Image Panel - Only show for markdown */}
            {newContent.type === 'markdown' && showImagePanel && (
              <div className="image-panel">
                <div className="image-panel-header">
                  <h6>Uploaded Images</h6>
                  <div className="panel-actions">
                    {uploadedImages.length > 0 && (
                      <button 
                        className="btn btn-sm btn-outline-danger me-2"
                        onClick={clearUploadedImages}
                        title="Clear all images"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowImagePanel(false)}
                      title="Close panel"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="image-panel-content">
                  {uploadedImages.length === 0 ? (
                    <div className="no-images">
                      <p>No images uploaded yet. Use the "Upload" button to add images.</p>
                    </div>
                  ) : (
                    <div className="image-list">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="image-item" style={{border: '1px solid #dee2e6', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#fff'}}>
                          <div className="image-preview-section" style={{display: 'flex', gap: '15px', marginBottom: '10px'}}>
                            <div className="image-preview">
                              <img 
                                src={image.previewUrl} 
                                alt={image.originalName}
                                style={{
                                  maxWidth: '120px',
                                  maxHeight: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #dee2e6',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onError={(e) => {
                                  console.error('Image preview failed to load:', image.previewUrl);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                                onLoad={() => {
                                  console.log('Image preview loaded successfully:', image.previewUrl);
                                }}
                              />
                              <div 
                                style={{
                                  display: 'none',
                                  width: '120px',
                                  height: '80px',
                                  backgroundColor: '#f8f9fa',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  color: '#6c757d'
                                }}
                              >
                                Preview failed
                              </div>
                            </div>
                            <div className="image-meta" style={{flex: 1}}>
                              <div className="image-dimensions" style={{marginBottom: '5px'}}>
                                <span style={{color: '#0066cc', fontWeight: '600', fontSize: '14px'}}>
                                  {image.dimensions.width} × {image.dimensions.height} px
                                </span>
                              </div>
                              <div className="image-size" style={{marginBottom: '3px'}}>
                                <small className="text-muted">
                                  <i className="bi bi-file-earmark" style={{marginRight: '5px'}}></i>
                                  {image.fileSize}
                                </small>
                              </div>
                              <div className="image-type">
                                <small className="text-muted">
                                  <i className="bi bi-image" style={{marginRight: '5px'}}></i>
                                  {image.mimeType}
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="image-info">
                            <div className="image-name">
                              <strong>{image.originalName}</strong>
                              <small className="text-muted"> ({image.filename})</small>
                            </div>
                            <div className="image-date">
                              <small className="text-muted">Uploaded: {image.uploadedAt}</small>
                            </div>
                          </div>
                          <div className="image-paths">
                            <div className="path-item">
                              <label>Markdown:</label>
                              <div className="path-input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={image.markdown}
                                  readOnly
                                />
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => copyToClipboard(image.markdown)}
                                  title="Copy markdown"
                                >
                                  Copy
                                </button>
                                <button
                                  className="btn btn-sm btn-success ms-1"
                                  onClick={() => {
                                    const textarea = textareaRef.current;
                                    if (textarea) {
                                      const cursorPos = textarea.selectionStart;
                                      const before = markdownContent.substring(0, cursorPos);
                                      const after = markdownContent.substring(cursorPos);
                                      setMarkdownContent(before + '\n' + image.markdown + '\n' + after);
                                      // Focus and position cursor after the inserted image
                                      setTimeout(() => {
                                        textarea.focus();
                                        const newPos = cursorPos + image.markdown.length + 2;
                                        textarea.setSelectionRange(newPos, newPos);
                                      }, 0);
                                    }
                                  }}
                                  title="Insert into editor"
                                >
                                  Insert
                                </button>
                                <button
                                  className="btn btn-sm btn-info ms-1"
                                  onClick={async () => {
                                    const apiUrl = `http://localhost:3000/api/images/${image.filename}`;
                                    const isWorking = await testImageUrl(apiUrl);
                                    alert(isWorking ? 
                                      `✅ Image API is working!\nURL: ${apiUrl}` : 
                                      `❌ Image API failed!\nURL: ${apiUrl}\nCheck browser console for details.`
                                    );
                                  }}
                                  title="Test image API"
                                >
                                  Test API
                                </button>
                              </div>
                            </div>
                            <div className="path-item">
                              <label>Path:</label>
                              <div className="path-input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={image.path}
                                  readOnly
                                />
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => copyToClipboard(image.path)}
                                  title="Copy path"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Markdown Editor - Only show for markdown content */}
            {newContent.type === 'markdown' && (
              <div className="row">
                {(editorMode === 'edit' || editorMode === 'split') && (
                  <div className={editorMode === 'split' ? 'col-md-6' : 'col-12'}>
                    <div className="editor-section">
                      <div className="editor-section-header">
                        <span>Markdown Editor</span>
                        <span className="character-count">{markdownContent.length} characters</span>
                      </div>
                      <textarea
                        ref={textareaRef}
                        className="form-control markdown-textarea"
                        rows="20"
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="# Start writing your markdown here...

You can use the toolbar above or keyboard shortcuts:
- Ctrl+B for **bold**
- Ctrl+I for *italic*  
- Ctrl+K for [links](url)
- Tab for indentation
- Ctrl+S to save"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                )}

                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className={editorMode === 'split' ? 'col-md-6' : 'col-12'}>
                    <div className="preview-section">
                      <div className="editor-section-header">
                        <span>Live Preview</span>
                        <span className="word-count">{markdownContent.split(' ').filter(w => w).length} words</span>
                      </div>
                      <div className="markdown-preview">
                        {markdownContent ? (
                          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(markdownContent) }} />
                        ) : (
                          <div className="preview-placeholder">
                            <p>Your markdown preview will appear here as you type...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Markdown Guide - Only show for markdown content */}
                {newContent.type === 'markdown' && (
                  <div className="col-md-6">
                    <div className="markdown-guide">
                      <h6>Markdown Guide</h6>
                      <div className="guide-examples">
                        <div className="guide-item">
                          <code># H1</code>
                          <span>Heading 1</span>
                        </div>
                        <div className="guide-item">
                          <code>**bold**</code>
                          <span>Bold text</span>
                        </div>
                        <div className="guide-item">
                          <code>*italic*</code>
                          <span>Italic text</span>
                        </div>
                        <div className="guide-item">
                          <code>[link](url)</code>
                          <span>Link</span>
                        </div>
                        <div className="guide-item">
                          <code>![img](url)</code>
                          <span>Image</span>
                        </div>
                        <div className="guide-item">
                          <code>- item</code>
                          <span>List item</span>
                        </div>
                        <div className="guide-item">
                          <code>`code`</code>
                          <span>Inline code</span>
                        </div>
                        <div className="guide-item">
                          <code>&gt; quote</code>
                          <span>Blockquote</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="content-list">
            <div className="content-header">
              <h6>Content List ({contents.length} items)</h6>
            </div>
            
            {contents.length === 0 ? (
              <div className="no-content">
                <p>No content found for this program.</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateContent}
                >
                  <FaPlus className="me-1" /> Create First Content
                </button>
              </div>
            ) : (
              <div className="content-table">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.sort((a, b) => a.orders - b.orders).map((content, index) => (
                      <tr key={content.content_id}>
                        <td>{content.orders}</td>
                        <td>{content.title}</td>
                        <td>
                          <span className={`badge bg-${content.type === 'markdown' ? 'primary' : 
                            content.type === 'video' ? 'success' : 
                            content.type === 'podcast' ? 'warning' : 'info'}`}>
                            {content.type}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons d-flex align-items-center gap-1">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleMoveContentUp(content)}
                              disabled={index === 0}
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleMoveContentDown(content)}
                              disabled={index === contents.length - 1}
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEditContent(content)}
                              title="Edit"
                            >
                              <FaCode />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteContent(content.content_id, content.title)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCreator; 