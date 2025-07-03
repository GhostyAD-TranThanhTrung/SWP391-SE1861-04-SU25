import React, { useState } from 'react';
import '../styles/FlagModal.scss';

const FlagModal = ({ isOpen, onClose, onSubmit, blogId, blogTitle }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const predefinedReasons = [
        'Nội dung không phù hợp',
        'Thông tin sai lệch',
        'Spam hoặc quảng cáo',
        'Nội dung xúc phạm',
        'Vi phạm bản quyền',
        'Nội dung bạo lực',
        'Khác (ghi rõ lý do)'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedReason) {
            alert('Vui lòng chọn lý do báo cáo');
            return;
        }

        if (selectedReason === 'Khác (ghi rõ lý do)' && !customReason.trim()) {
            alert('Vui lòng nhập lý do cụ thể');
            return;
        }

        setIsSubmitting(true);

        try {
            const reason = selectedReason === 'Khác (ghi rõ lý do)' ? customReason : selectedReason;
            await onSubmit(reason);

            // Reset form
            setSelectedReason('');
            setCustomReason('');
            onClose();
        } catch (error) {
            console.error('Error submitting flag:', error);
            alert('Có lỗi xảy ra khi gửi báo cáo: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason('');
            setCustomReason('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="flag-modal-overlay" onClick={handleClose}>
            <div className="flag-modal" onClick={(e) => e.stopPropagation()}>
                <div className="flag-modal-header">
                    <h4>Báo cáo bài viết</h4>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="flag-modal-body">
                    <div className="blog-info">
                        <p><strong>Bài viết:</strong> {blogTitle}</p>
                        <p className="text-muted">Vui lòng chọn lý do báo cáo bài viết này:</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="reason-options">
                            {predefinedReasons.map((reason, index) => (
                                <label key={index} className="reason-option">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="reason-text">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {selectedReason === 'Khác (ghi rõ lý do)' && (
                            <div className="custom-reason">
                                <label htmlFor="customReason">Lý do cụ thể:</label>
                                <textarea
                                    id="customReason"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                                    rows={3}
                                    disabled={isSubmitting}
                                    maxLength={255}
                                />
                                <small className="text-muted">
                                    {customReason.length}/255 ký tự
                                </small>
                            </div>
                        )}

                        <div className="flag-modal-footer">
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-flag"
                                disabled={isSubmitting || !selectedReason}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-flag me-2"></i>
                                        Báo cáo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FlagModal;
