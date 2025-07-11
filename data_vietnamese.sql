-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
-- Status options: 'active' (can login), 'inactive' (soft deleted, cannot login), 'banned' (cannot login)
INSERT INTO Users (role, password, status, email, img_link) VALUES
(N'admin', N'hashed_password_123', N'active', N'admin@drugprevention.com', N'/uploads/profile-pictures/default-admin.png')

-- Insert Profiles for all users
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, N'Quản trị viên', N'{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', N'Quản trị hệ thống')



-- Insert Time Slots
INSERT INTO Slot (start_time, end_time) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00');


-- Insert Categories
INSERT INTO Category (name, description) VALUES
(N'Khoa học nghiện', N'Nội dung giáo dục khám phá nền tảng khoa học của nghiện, hóa học não và tác động thần kinh'),
(N'Cần sa (Marijuana)', N'Nội dung giáo dục về sử dụng cần sa, tác dụng, rủi ro và cân nhắc pháp lý'),
(N'Xu hướng ma túy mới', N'Thông tin về các chất mới và đang nổi lên, ma túy tổng hợp và mô hình sử dụng ma túy đang phát triển'),
(N'Sự kiện cộng đồng', N'Sự kiện dựa vào cộng đồng, hội thảo và hoạt động thúc đẩy nhận thức phòng ngừa ma túy và hỗ trợ nỗ lực phục hồi');

-- Insert Actions for Assessments
INSERT INTO Action (description, range, type) VALUES
(N'Đánh giá hoàn tất - Chuyển đến tài nguyên phù hợp', 10000000, 'Referral'),
(N'Giáo dục ngắn gọn - Thông tin cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu rối loạn sử dụng chất', 0, 'ASSIST'),
(N'Can thiệp ngắn gọn - Thảo luận tập trung vào bệnh nhân sử dụng khái niệm Phỏng vấn Tạo động lực để nâng cao nhận thức về sử dụng chất và tăng cường động lực thay đổi', 4, 'ASSIST'),
(N'Can thiệp ngắn gọn (đề xuất các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, giới thiệu là quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên sâu', 27, 'ASSIST'),
(N'Rủi ro thấp - Cung cấp thông tin về rủi ro sử dụng chất; khen ngợi và khuyến khích', 0, 'CRAFFT'),
(N'Rủi ro trung bình - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; có thể theo dõi', 1, 'CRAFFT'),
(N'Rủi ro cao - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; theo dõi; có thể giới thiệu tư vấn/điều trị', 2, 'CRAFFT');
