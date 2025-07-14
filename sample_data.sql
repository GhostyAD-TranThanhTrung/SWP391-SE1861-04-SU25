-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
-- Status options: 'active' (can login), 'inactive' (soft deleted, cannot login), 'banned' (cannot login)
INSERT INTO Users (role, password, status, email, img_link) VALUES
('admin', 'hashed_password_123', 'active', 'admin@drugprevention.com', '/uploads/profile-pictures/default-admin.png'),
('consultant', 'hashed_password_456', 'active', 'dr.smith@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_789', 'active', 'therapist.johnson@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_321', 'active', 'counselor.williams@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_654', 'inactive', 'dr.brown@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'), -- Deactivated account
('member', 'hashed_password_987', 'active', 'john.doe@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_147', 'active', 'jane.smith@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_258', 'active', 'mike.wilson@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_369', 'active', 'sarah.davis@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_741', 'banned', 'banned.user@email.com', NULL), -- Banned account
('member', 'hashed_password_999', 'inactive', 'deleted.user@email.com', NULL); -- Soft deleted account (user "deleted" their account)

-- Insert Profiles for all users
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, 'Quản trị viên', '{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', 'Quản trị hệ thống'),
(2, 'Bác sĩ Michael Smith', '{"bio": "Bác sĩ tâm thần nghiện có giấy phép với 15 năm kinh nghiệm trong điều trị và phòng ngừa lạm dụng chất", "education": "MD từ Johns Hopkins, Chứng nhận Hội đồng về Y học Nghiện"}', '1975-03-20', 'Bác sĩ tâm thần nghiện'),
(3, 'Sarah Johnson', '{"bio": "Nhà trị liệu lâm sàng được cấp phép chuyên về tư vấn nghiện và trị liệu gia đình", "education": "Thạc sĩ Tâm lý học Lâm sàng, Tư vấn viên Chuyên nghiệp được cấp phép"}', '1982-08-12', 'Nhà trị liệu lâm sàng'),
(4, 'Robert Williams', '{"bio": "Tư vấn viên lạm dụng chất được chứng nhận với chuyên môn về các chương trình phòng ngừa thanh thiếu niên", "education": "Thạc sĩ Tư vấn Nghiện, Chứng nhận CADC"}', '1978-11-05', 'Tư vấn viên lạm dụng chất'),
(5, 'Bác sĩ Emily Brown', '{"bio": "Nhà tâm lý học lâm sàng chuyên về can thiệp hành vi cho nghiện", "education": "Tiến sĩ Tâm lý học Lâm sàng"}', '1980-01-30', 'Nhà tâm lý học lâm sàng'),
(6, 'John Doe', '{"bio": "Tìm kiếm hỗ trợ cho phục hồi nghiện", "interests": ["thể dục", "đọc sách"]}', '1995-06-10', 'Lập trình viên'),
(7, 'Jane Smith', '{"bio": "Phụ huynh tìm kiếm tài nguyên phòng ngừa cho thanh thiếu niên", "interests": ["làm cha mẹ", "phục vụ cộng đồng"]}', '1978-09-22', 'Giáo viên'),
(8, 'Mike Wilson', '{"bio": "Sinh viên đại học quan tâm đến giáo dục phòng ngừa", "interests": ["thể thao", "âm nhạc"]}', '2001-12-03', 'Sinh viên'),
(9, 'Sarah Davis', '{"bio": "Nhân viên y tế tìm kiếm phát triển chuyên môn về phòng ngừa nghiện", "interests": ["y tế", "đào tạo"]}', '1988-04-17', 'Y tá'),
(10, 'Người dùng bị cấm', '{"bio": "Tài khoản người dùng bị cấm do vi phạm"}', '1990-07-25', 'Không xác định'),
(11, 'Người dùng đã xóa', '{"bio": "Người dùng đã xóa tài khoản (dữ liệu được bảo tồn)"}', '1992-03-18', 'Thành viên cũ');

-- Insert Consultants
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, 'Chứng nhận Hội đồng về Y học Nghiện, Bác sĩ được cấp phép', 'Tâm thần học nghiện, Điều trị hỗ trợ bằng thuốc, Chẩn đoán kép'),
(3, 120.00, 'Tư vấn viên Chuyên nghiệp được cấp phép, Tư vấn viên Nghiện được chứng nhận', 'Trị liệu cá nhân và gia đình, Trị liệu nhận thức hành vi, Chăm sóc thông hiểu chấn thương'),
(4, 100.00, 'Tư vấn viên Rượu và Ma túy được chứng nhận, Chuyên gia Phòng ngừa', 'Chương trình Phòng ngừa Thanh thiếu niên, Trị liệu nhóm, Tiếp cận cộng đồng'),
(5, 130.00, 'Nhà tâm lý học Lâm sàng được cấp phép, Chuyên gia Điều trị Nghiện', 'Can thiệp hành vi, Đánh giá và Định giá, Lập kế hoạch điều trị');

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

-- Insert Consultant Availability
INSERT INTO Consultant_Slot (consultant_id, slot_id, day_of_week) VALUES
-- Dr. Smith (Consultant 1) - Monday to Friday, morning and afternoon
(1, 1, 'Monday'), (1, 2, 'Monday'), (1, 5, 'Monday'), (1, 6, 'Monday'),
(1, 1, 'Tuesday'), (1, 2, 'Tuesday'), (1, 5, 'Tuesday'), (1, 6, 'Tuesday'),
(1, 1, 'Wednesday'), (1, 2, 'Wednesday'), (1, 5, 'Wednesday'), (1, 6, 'Wednesday'),
(1, 1, 'Thursday'), (1, 2, 'Thursday'), (1, 5, 'Thursday'), (1, 6, 'Thursday'),
(1, 1, 'Friday'), (1, 2, 'Friday'), (1, 5, 'Friday'), (1, 6, 'Friday'),

-- Sarah Johnson (Consultant 2) - Monday to Saturday, flexible hours
(2, 3, 'Monday'), (2, 4, 'Monday'), (2, 7, 'Monday'), (2, 8, 'Monday'),
(2, 3, 'Tuesday'), (2, 4, 'Tuesday'), (2, 7, 'Tuesday'), (2, 8, 'Tuesday'),
(2, 3, 'Wednesday'), (2, 4, 'Wednesday'), (2, 7, 'Wednesday'), (2, 8, 'Wednesday'),
(2, 3, 'Thursday'), (2, 4, 'Thursday'), (2, 7, 'Thursday'), (2, 8, 'Thursday'),
(2, 3, 'Friday'), (2, 4, 'Friday'), (2, 7, 'Friday'), (2, 8, 'Friday'),
(2, 2, 'Saturday'), (2, 3, 'Saturday'), (2, 4, 'Saturday'),

-- Robert Williams (Consultant 3) - Monday to Friday, afternoon and evening
(3, 5, 'Monday'), (3, 6, 'Monday'), (3, 7, 'Monday'), (3, 9, 'Monday'),
(3, 5, 'Tuesday'), (3, 6, 'Tuesday'), (3, 7, 'Tuesday'), (3, 9, 'Tuesday'),
(3, 5, 'Wednesday'), (3, 6, 'Wednesday'), (3, 7, 'Wednesday'), (3, 9, 'Wednesday'),
(3, 5, 'Thursday'), (3, 6, 'Thursday'), (3, 7, 'Thursday'), (3, 9, 'Thursday'),
(3, 5, 'Friday'), (3, 6, 'Friday'), (3, 7, 'Friday'), (3, 9, 'Friday'),

-- Dr. Brown (Consultant 4) - Tuesday to Saturday, morning and afternoon
(4, 1, 'Tuesday'), (4, 2, 'Tuesday'), (4, 3, 'Tuesday'), (4, 5, 'Tuesday'),
(4, 1, 'Wednesday'), (4, 2, 'Wednesday'), (4, 3, 'Wednesday'), (4, 5, 'Wednesday'),
(4, 1, 'Thursday'), (4, 2, 'Thursday'), (4, 3, 'Thursday'), (4, 5, 'Thursday'),
(4, 1, 'Friday'), (4, 2, 'Friday'), (4, 3, 'Friday'), (4, 5, 'Friday'),
(4, 1, 'Saturday'), (4, 2, 'Saturday'), (4, 3, 'Saturday'), (4, 5, 'Saturday');

-- Insert Booking Sessions
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link) VALUES
(1, 6, 1, '2024-01-15', 'completed', 'Tư vấn ban đầu để đánh giá nghiện. Bệnh nhân thể hiện sự tham gia tốt.', 'https://meet.google.com/abc-defg-hij'),
(1, 6, 5, '2024-01-22', 'completed', 'Buổi theo dõi. Thảo luận về các lựa chọn điều trị và cân nhắc thuốc.', 'https://meet.google.com/klm-nopq-rst'),
(2, 7, 7, '2024-01-18', 'completed', 'Tư vấn phụ huynh về chiến lược phòng ngừa sử dụng chất ở thanh thiếu niên.', 'https://meet.google.com/uvw-xyz-123'),
(3, 8, 6, '2024-01-20', 'scheduled', 'Buổi giáo dục phòng ngừa cho sinh viên đại học đã được lên lịch.', NULL),
(2, 9, 3, '2024-01-25', 'scheduled', 'Tư vấn phát triển chuyên môn cho nhân viên y tế.', NULL),
(1, 6, 2, '2024-01-29', 'scheduled', 'Buổi lập kế hoạch điều trị đang diễn ra.', NULL),
(4, 7, 1, '2024-01-23', 'cancelled', 'Phụ huynh hủy do xung đột lịch trình.', NULL),
(3, 8, 9, '2024-01-17', 'completed', 'Buổi chuẩn bị trị liệu nhóm hoàn thành thành công.', 'https://meet.google.com/456-789-012');

-- Insert Categories
INSERT INTO Category (name, description) VALUES
('Khoa học nghiện', 'Nội dung giáo dục khám phá nền tảng khoa học của nghiện, hóa học não và tác động thần kinh'),
('Cần sa (Marijuana)', 'Nội dung giáo dục về sử dụng cần sa, tác dụng, rủi ro và cân nhắc pháp lý'),
('Xu hướng ma túy mới', 'Thông tin về các chất mới và đang nổi lên, ma túy tổng hợp và mô hình sử dụng ma túy đang phát triển'),
('Fentanyl', 'Giáo dục quan trọng về fentanyl, sự nguy hiểm, phòng ngừa quá liều và biện pháp an toàn'),
('Giảm tác hại', 'Chiến lược và cách tiếp cận để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng ma túy'),
('Heroin', 'Nội dung giáo dục về nghiện heroin, lựa chọn điều trị và tài nguyên phục hồi'),
('HIV', 'Thông tin về phòng ngừa HIV, xét nghiệm và chăm sóc liên quan đến sử dụng chất'),
('Kratom', 'Nội dung giáo dục về sử dụng kratom, tác dụng và rủi ro tiềm ẩn'),
('Methamphetamine', 'Thông tin về nghiện methamphetamine, tác dụng và cách tiếp cận điều trị'),
('Opioid', 'Giáo dục toàn diện về nghiện opioid, lạm dụng thuốc theo toa và điều trị'),
('Phòng ngừa', 'Chiến lược phòng ngừa dựa trên bằng chứng, chương trình và sáng kiến giáo dục'),
('Thuốc gây ảo giác và phân ly', 'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng'),
('Psilocybin (Nấm ma thuật)', 'Thông tin về nấm psilocybin, tác dụng và cân nhắc an toàn'),
('Kỳ thị và phân biệt đối xử', 'Giải quyết kỳ thị, thúc đẩy hiểu biết và giảm phân biệt đối xử trong nghiện'),
('Chương trình dịch vụ bơm kim tiêm', 'Thông tin về chương trình trao đổi kim tiêm và dịch vụ giảm tác hại'),
('Thuốc lá/Nicotine và Vaping', 'Nội dung giáo dục về sử dụng thuốc lá, nghiện nicotine và rủi ro vaping'),
('Điều trị', 'Thông tin toàn diện về lựa chọn điều trị nghiện, chương trình phục hồi và dịch vụ hỗ trợ'),
('Sự kiện cộng đồng', 'Sự kiện dựa vào cộng đồng, hội thảo và hoạt động thúc đẩy nhận thức phòng ngừa ma túy và hỗ trợ nỗ lực phục hồi');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
-- Chương trình Khoa học Nghiện
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Hiểu biết Khoa học về Nghiện', 'Khám phá toàn diện về khoa học thần kinh đằng sau nghiện, thay đổi não và cơ chế phục hồi', 1, 'active', '18+', GETDATE(), 1),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Não và Nghiện: Góc nhìn Khoa học', 'Tìm hiểu sâu về cách chất tác động đến hóa học não và đường dẫn thần kinh', 1, 'active', '18+', GETDATE(), 1),

-- Chương trình Cần sa
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Giáo dục và Nhận thức về Cần sa', 'Thông tin dựa trên bằng chứng về sử dụng cần sa, tác dụng và cân nhắc pháp lý', 1, 'active', '18+', GETDATE(), 2),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Cần sa và Phát triển Thanh thiếu niên', 'Hiểu tác động của sử dụng cần sa lên não đang phát triển', 1, 'active', '13-25', GETDATE(), 2),

-- Chương trình Xu hướng Ma túy Mới
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Cảnh báo Chất Tâm thần Mới', 'Cập nhật về các loại ma túy tổng hợp và chất mới nổi', 1, 'active', '18+', GETDATE(), 3),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Chương trình Nhận thức Ma túy Tổng hợp', 'Giáo dục về ma túy thiết kế, rủi ro và cách nhận biết', 1, 'active', '16+', GETDATE(), 3),

-- Chương trình Fentanyl
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Ứng phó Khủng hoảng Fentanyl', 'Giáo dục quan trọng về sự nguy hiểm của fentanyl, phòng ngừa quá liều và đào tạo naloxone', 1, 'active', '16+', GETDATE(), 4),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Phòng ngừa và Ứng phó Quá liều', 'Kỹ thuật cứu sống và phản ứng khẩn cấp cho quá liều opioid', 1, 'active', '16+', GETDATE(), 4),

-- Chương trình Giảm Tác hại
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Chiến lược Giảm Tác hại', 'Cách tiếp cận thực tế để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng chất', 1, 'active', '18+', GETDATE(), 5),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Giáo dục Sử dụng An toàn', 'Kỹ thuật giảm tác hại dựa trên bằng chứng và giao thức an toàn', 1, 'active', '18+', GETDATE(), 5),

-- Chương trình Heroin
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Lựa chọn Điều trị Nghiện Heroin', 'Hướng dẫn toàn diện về điều trị nghiện heroin và con đường phục hồi', 1, 'active', '18+', GETDATE(), 6),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Điều trị Hỗ trợ bằng Thuốc cho Heroin', 'Hiểu về methadone, buprenorphine và các loại thuốc điều trị khác', 1, 'active', '18+', GETDATE(), 6),

-- Chương trình HIV
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Phòng ngừa HIV trong Sử dụng Chất', 'Ngăn ngừa lây truyền HIV giữa những người sử dụng ma túy', 1, 'active', '18+', GETDATE(), 7),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Dịch vụ Xét nghiệm và Chăm sóc HIV', 'Tiếp cận xét nghiệm HIV, điều trị và dịch vụ hỗ trợ', 1, 'active', '18+', GETDATE(), 7),

-- Chương trình Kratom
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Kratom: Sự thật và Rủi ro', 'Nội dung giáo dục về sử dụng kratom, tác dụng và rủi ro sức khỏe tiềm ẩn', 1, 'active', '18+', GETDATE(), 8),

-- Chương trình Methamphetamine
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Phục hồi Nghiện Methamphetamine', 'Cách tiếp cận điều trị và chiến lược phục hồi cho nghiện methamphetamine', 1, 'active', '18+', GETDATE(), 9),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Hiểu Tác dụng Methamphetamine', 'Giáo dục toàn diện về sử dụng meth, tác động sức khỏe và rủi ro', 1, 'active', '16+', GETDATE(), 9),

-- Chương trình Opioid
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Nhận thức Khủng hoảng Opioid', 'Hiểu về đại dịch opioid, lạm dụng thuốc theo toa và giải pháp', 1, 'active', '16+', GETDATE(), 10),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'An toàn Thuốc Opioid Kê đơn', 'Sử dụng an toàn, bảo quản và tiêu hủy thuốc opioid kê đơn', 1, 'active', 'Mọi lứa tuổi', GETDATE(), 10),

-- Chương trình Phòng ngừa
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Chương trình Phòng ngừa Ma túy Thanh thiếu niên', 'Chiến lược phòng ngừa dựa trên bằng chứng cho thanh thiếu niên', 1, 'active', '13-18', GETDATE(), 11),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Sáng kiến Phòng ngừa Cộng đồng', 'Xây dựng khả năng phục hồi và năng lực phòng ngừa cộng đồng', 1, 'active', 'Mọi lứa tuổi', GETDATE(), 11),

-- Chương trình Chất gây Ảo giác
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Giáo dục về Chất gây Ảo giác', 'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng', 1, 'active', '18+', GETDATE(), 12),

-- Chương trình Psilocybin
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'An toàn và Tác dụng Psilocybin', 'Thông tin về nấm ma thuật, tác dụng và cân nhắc an toàn', 1, 'active', '18+', GETDATE(), 13),

-- Chương trình Kỳ thị
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Giảm Kỳ thị Nghiện', 'Giải quyết kỳ thị, thúc đẩy hiểu biết và giảm phân biệt đối xử', 1, 'active', 'Mọi lứa tuổi', GETDATE(), 14),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Ngôn ngữ trong Nghiện', 'Sử dụng ngôn ngữ lấy người làm trung tâm và giảm thuật ngữ kỳ thị', 1, 'active', '16+', GETDATE(), 14),

-- Chương trình Dịch vụ Kim tiêm
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Tổng quan Chương trình Dịch vụ Kim tiêm', 'Hiểu về chương trình trao đổi kim tiêm và dịch vụ giảm tác hại', 1, 'active', '18+', GETDATE(), 15),

-- Chương trình Thuốc lá/Vaping
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Chương trình Cai thuốc lá', 'Hỗ trợ cai thuốc toàn diện và liệu pháp thay thế nicotine', 1, 'active', '16+', GETDATE(), 16),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Rủi ro Vaping và Thuốc lá điện tử', 'Hiểu về rủi ro sức khỏe của vaping và sử dụng thuốc lá điện tử', 1, 'active', '13+', GETDATE(), 16),

-- Chương trình Điều trị
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Điều trị Nghiện Toàn diện', 'Tổng quan về lựa chọn điều trị, chương trình phục hồi và dịch vụ hỗ trợ', 1, 'active', '18+', GETDATE(), 17),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Dịch vụ Hỗ trợ Phục hồi', 'Hỗ trợ đồng đẳng, tư vấn và duy trì phục hồi dài hạn', 1, 'active', '18+', GETDATE(), 17),

-- Chương trình Sự kiện Cộng đồng
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Hội chợ Phòng ngừa Cộng đồng', 'Sự kiện cộng đồng tương tác với các gian hàng giáo dục phòng ngừa, chia sẻ tài nguyên và hoạt động thân thiện với gia đình để xây dựng nhận thức và mạng lưới hỗ trợ', 1, 'active', 'Mọi lứa tuổi', GETDATE(), 18),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Đi bộ Phục hồi & Tập trung Hỗ trợ', 'Sự kiện đi bộ cộng đồng thể hiện tình đoàn kết với những người đang phục hồi, giảm kỳ thị và kết nối gia đình với các nguồn hỗ trợ địa phương', 1, 'active', 'Mọi lứa tuổi', GETDATE(), 18);

-- Insert User Enrollments with JSON progress tracking
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
-- User 6 enrolled in Program 2 (Stress Management) - 5 out of 7 content items completed (71% progress)
(6, 2, '2024-01-10 10:00:00', '[{"content_id":8,"complete":true},{"content_id":9,"complete":true},{"content_id":10,"complete":true},{"content_id":11,"complete":true},{"content_id":12,"complete":true},{"content_id":13,"complete":false},{"content_id":14,"complete":false}]'),

-- User 7 enrolled in Program 3 (Mindfulness Meditation) - 3 out of 7 content items completed (43% progress)
(7, 3, '2024-01-12 14:00:00', '[{"content_id":15,"complete":true},{"content_id":16,"complete":true},{"content_id":17,"complete":true},{"content_id":18,"complete":false},{"content_id":19,"complete":false},{"content_id":20,"complete":false},{"content_id":21,"complete":false}]'),

-- User 8 enrolled in Program 1 (Mental Health Basics) - 6 out of 7 content items completed (86% progress)
(8, 1, '2024-01-08 09:00:00', '[{"content_id":1,"complete":true},{"content_id":2,"complete":true},{"content_id":3,"complete":true},{"content_id":4,"complete":true},{"content_id":5,"complete":true},{"content_id":6,"complete":true},{"content_id":7,"complete":false}]'),

-- User 8 also enrolled in Program 3 (Mindfulness Meditation) - 2 out of 7 content items completed (29% progress)
(8, 3, '2024-01-15 16:00:00', '[{"content_id":15,"complete":true},{"content_id":16,"complete":true},{"content_id":17,"complete":false},{"content_id":18,"complete":false},{"content_id":19,"complete":false},{"content_id":20,"complete":false},{"content_id":21,"complete":false}]'),

-- User 9 enrolled in Program 2 (Stress Management) - All 7 content items completed (100% progress)
(9, 2, '2024-01-05 11:00:00', '[{"content_id":8,"complete":true},{"content_id":9,"complete":true},{"content_id":10,"complete":true},{"content_id":11,"complete":true},{"content_id":12,"complete":true},{"content_id":13,"complete":true},{"content_id":14,"complete":true}]');

-- Insert Actions for Assessments
INSERT INTO Action (description, range, type) VALUES
('Đánh giá hoàn tất - Chuyển đến tài nguyên phù hợp', 10000000, 'Referral'),
('Giáo dục ngắn gọn - Thông tin cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu rối loạn sử dụng chất', 0, 'ASSIST'),
('Can thiệp ngắn gọn - Thảo luận tập trung vào bệnh nhân sử dụng khái niệm Phỏng vấn Tạo động lực để nâng cao nhận thức về sử dụng chất và tăng cường động lực thay đổi', 4, 'ASSIST'),
('Can thiệp ngắn gọn (đề xuất các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, giới thiệu là quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên sâu', 27, 'ASSIST'),
('Rủi ro thấp - Cung cấp thông tin về rủi ro sử dụng chất; khen ngợi và khuyến khích', 0, 'CRAFFT'),
('Rủi ro trung bình - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; có thể theo dõi', 1, 'CRAFFT'),
('Rủi ro cao - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; theo dõi; có thể giới thiệu tư vấn/điều trị', 2, 'CRAFFT');

-- Insert Assessments
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id) VALUES
(6, 'Sàng lọc Sử dụng Chất', '{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["sử dụng rượu", "áp lực xã hội"], "recommendations": ["tư vấn", "nhóm hỗ trợ đồng đẳng"]}', '2024-01-15 10:00:00', 2),
(7, 'Đánh giá Tác động Gia đình', '{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["kỹ năng giao tiếp", "thiết lập ranh giới"], "children_affected": 1}', '2024-01-18 14:00:00', 2),
(8, 'Đánh giá Rủi ro Đại học', '{"total_score": 5, "risk_level": "low", "protective_factors": ["hỗ trợ gia đình mạnh mẽ", "tham gia học tập"], "risk_factors": ["ảnh hưởng bạn bè"]}', '2024-01-20 09:00:00', 1),
(9, 'Đánh giá Sẵn sàng Chuyên môn', '{"total_score": 22, "competency_areas": ["nhận diện", "can thiệp", "giới thiệu"], "training_needs": ["phỏng vấn tạo động lực"]}', '2024-01-25 11:00:00', 5);

-- Insert Content
INSERT INTO Content (program_id, title, type, orders, content_file_link, content_type, content_metadata_json) VALUES
-- Chương trình 1: Hiểu biết Khoa học Nghiện (6 nội dung)
(1, 'Khoa học Thần kinh về Nghiện', 'article', 1, '/content/markdown/khoa-hoc-nghien.md', 'markdown', '{"author": "TS. Smith", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(1, 'Cách Thuốc Thay đổi Não bộ', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:30", "format": "youtube", "instructor": "TS. Johnson"}'),
(1, 'Dopamine và Con đường Phần thưởng', 'article', 3, '/content/markdown/dopamine-phan-thuong.md', 'markdown', '{"author": "TS. Williams", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(1, 'Di truyền và Nguy cơ Nghiện', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "12:45", "format": "youtube", "instructor": "TS. Di truyền"}'),
(1, 'Phục hồi Não bộ khi Cai nghiện', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "25:00", "format": "youtube", "host": "Chuyên gia Phục hồi"}'),
(1, 'Cập nhật Nghiên cứu Khoa học Nghiện', 'article', 6, '/content/markdown/nghien-cuu-nghien.md', 'markdown', '{"author": "Nhóm Nghiên cứu", "readingTime": "8 phút", "difficulty": "nâng cao"}'),

-- Chương trình 2: Não bộ và Nghiện: Góc nhìn Khoa học (5 nội dung)
(2, 'Giải phẫu Não bộ và Nghiện', 'article', 1, '/content/markdown/giai-phau-nao-nghien.md', 'markdown', '{"author": "TS. Não bộ", "readingTime": "14 phút", "difficulty": "trung cấp"}'),
(2, 'Chất dẫn truyền Thần kinh và Sử dụng Chất kích thích', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "18:20", "format": "youtube", "instructor": "TS. Thần kinh"}'),
(2, 'Cơ chế Nhờn thuốc và Phụ thuộc', 'article', 3, '/content/markdown/co-che-nhon-thuoc.md', 'markdown', '{"author": "TS. Cơ chế", "readingTime": "11 phút", "difficulty": "nâng cao"}'),
(2, 'Hình ảnh Não trong Nghiên cứu Nghiện', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "22:15", "format": "youtube", "instructor": "TS. Hình ảnh"}'),
(2, 'Tính mềm dẻo Thần kinh và Phục hồi', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "30:00", "format": "youtube", "host": "Chuyên gia Tính mềm dẻo"}'),

-- Chương trình 3: Giáo dục và Nhận thức về Cần sa (7 nội dung)
(3, 'Cần sa: Sự thật và Ngộ nhận', 'article', 1, '/content/markdown/su-that-can-sa.md', 'markdown', '{"author": "Chuyên gia Cần sa", "readingTime": "10 phút", "difficulty": "sơ cấp"}'),
(3, 'THC và CBD: Hiểu về Cannabinoid', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:30", "format": "youtube", "instructor": "TS. Cannabinoid"}'),
(3, 'Cần sa và Sức khỏe Tâm thần', 'article', 3, '/content/markdown/can-sa-tam-than.md', 'markdown', '{"author": "Chuyên gia Sức khỏe Tâm thần", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(3, 'Cần sa Hợp pháp: Điều cần biết', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:45", "format": "youtube", "instructor": "Chuyên gia Pháp lý"}'),
(3, 'Cần sa Y tế và Giải trí', 'article', 5, '/content/markdown/can-sa-y-te-giai-tri.md', 'markdown', '{"author": "Chuyên gia Cần sa Y tế", "readingTime": "9 phút", "difficulty": "trung cấp"}'),
(3, 'Rối loạn Sử dụng Cần sa', 'podcast', 6, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "28:00", "format": "youtube", "host": "Chuyên gia Nghiện"}'),
(3, 'Lái xe và Cần sa: Mối lo An toàn', 'article', 7, '/content/markdown/can-sa-lai-xe.md', 'markdown', '{"author": "Chuyên gia An toàn", "readingTime": "7 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 4: Cần sa và Phát triển Thanh thiếu niên (6 nội dung)
(4, 'Phát triển Não tuổi Teen và Cần sa', 'article', 1, '/content/markdown/nao-tuoi-teen.md', 'markdown', '{"author": "TS. Thanh thiếu niên", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(4, 'Ảnh hưởng Cần sa đến Học tập', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "13:20", "format": "youtube", "instructor": "Chuyên gia Giáo dục"}'),
(4, 'Sử dụng Cần sa sớm: Hậu quả Dài hạn', 'article', 3, '/content/markdown/can-sa-tuoi-tre.md', 'markdown', '{"author": "Chuyên gia Phát triển", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(4, 'Cách Nói chuyện với Teen về Cần sa', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:45", "format": "youtube", "instructor": "Chuyên gia Giáo dục Gia đình"}'),
(4, 'Phòng chống Cần sa trong Trường học', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "32:00", "format": "youtube", "host": "Tư vấn viên Trường học"}'),
(4, 'Lựa chọn Điều trị Cần sa cho Thanh thiếu niên', 'article', 6, '/content/markdown/dieu-tri-tre-em.md', 'markdown', '{"author": "Chuyên gia Điều trị Thanh thiếu niên", "readingTime": "13 phút", "difficulty": "nâng cao"}'),

-- Chương trình 5: Cảnh báo Chất Hướng thần Mới (5 nội dung)
(5, 'Chất Hướng thần Mới là gì?', 'article', 1, '/content/markdown/chat-huong-than-moi.md', 'markdown', '{"author": "Chuyên gia Cảnh báo Ma túy", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),
(5, 'Nhận biết Thuốc Tổng hợp', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "17:30", "format": "youtube", "instructor": "Chuyên gia Giám định"}'),
(5, 'Rủi ro và Tác dụng Thuốc Thiết kế', 'article', 3, '/content/markdown/rui-ro-thuoc-thiet-ke.md', 'markdown', '{"author": "Chuyên gia Đánh giá Rủi ro", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(5, 'Thị trường Ma túy Trực tuyến và An toàn', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "19:15", "format": "youtube", "instructor": "Chuyên gia An ninh Mạng"}'),
(5, 'Báo cáo Xu hướng Ma túy Mới', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "35:00", "format": "youtube", "host": "Nhà Phân tích Xu hướng"}'),

-- Chương trình 6: Chương trình Nhận thức Thuốc Tổng hợp (6 nội dung)
(6, 'Nhận biết Thuốc Tổng hợp', 'article', 1, '/content/markdown/thuoc-tong-hop.md', 'markdown', '{"author": "Chuyên gia Thuốc Tổng hợp", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(6, 'K2/Spice: Cần sa Tổng hợp', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:30", "format": "youtube", "instructor": "Chuyên gia An toàn Ma túy"}'),
(6, 'Bath Salts và Chất Kích thích Tổng hợp', 'article', 3, '/content/markdown/bath-salts.md', 'markdown', '{"author": "Chuyên gia Chất Kích thích", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(6, 'Phương pháp Kiểm tra và Phát hiện', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:45", "format": "youtube", "instructor": "Chuyên gia Xét nghiệm"}'),
(6, 'Xử lý Khẩn cấp Quá liều Tổng hợp', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "28:00", "format": "youtube", "host": "Nhân viên Cấp cứu"}'),
(6, 'Chiến lược Phòng ngừa Thuốc Tổng hợp', 'article', 6, '/content/markdown/phong-ngua-tong-hop.md', 'markdown', '{"author": "Chuyên gia Phòng ngừa", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 7: Ứng phó Khủng hoảng Fentanyl (7 nội dung)
(7, 'Hiểu về Fentanyl và Nguy cơ', 'article', 1, '/content/markdown/nguy-co-fentanyl.md', 'markdown', '{"author": "Chuyên gia Fentanyl", "readingTime": "11 phút", "difficulty": "sơ cấp"}'),
(7, 'Que thử Fentanyl: Cách sử dụng', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "8:30", "format": "youtube", "instructor": "Chuyên gia Giảm hại"}'),
(7, 'Đào tạo Sử dụng Naloxone', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "12:15", "format": "youtube", "instructor": "Huấn luyện viên Cấp cứu"}'),
(7, 'Fentanyl trong Nguồn cung Ma túy', 'article', 4, '/content/markdown/fentanyl-nguon-cung.md', 'markdown', '{"author": "Chuyên gia Nguồn cung Ma túy", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(7, 'Hỗ trợ Gia đình Bị ảnh hưởng Fentanyl', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "35:00", "format": "youtube", "host": "Tư vấn viên Gia đình"}'),
(7, 'Ứng phó Cộng đồng với Khủng hoảng Fentanyl', 'video', 6, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "20:45", "format": "youtube", "instructor": "Lãnh đạo Cộng đồng"}'),
(7, 'Phòng ngừa Fentanyl trong Trường học', 'article', 7, '/content/markdown/fentanyl-truong-hoc.md', 'markdown', '{"author": "Chuyên gia An toàn Trường học", "readingTime": "13 phút", "difficulty": "trung cấp"}'),

-- Chương trình 8: Phòng ngừa và Ứng phó Quá liều (5 nội dung)
(8, 'Nhận biết Dấu hiệu Quá liều', 'article', 1, '/content/markdown/dau-hieu-qua-lieu.md', 'markdown', '{"author": "Chuyên gia Phòng ngừa Quá liều", "readingTime": "8 phút", "difficulty": "sơ cấp"}'),
(8, 'Các bước Ứng phó Khẩn cấp', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "10:30", "format": "youtube", "instructor": "Đội Ứng phó Khẩn cấp"}'),
(8, 'Naloxone: Thuốc Cứu mạng', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:20", "format": "youtube", "instructor": "Nhân viên Y tế"}'),
(8, 'Chăm sóc và Hỗ trợ Sau quá liều', 'article', 4, '/content/markdown/cham-soc-sau-qua-lieu.md', 'markdown', '{"author": "Chuyên gia Phục hồi", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(8, 'Xây dựng Mạng lưới Ứng phó Quá liều', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "30:00", "format": "youtube", "host": "Điều phối viên Mạng lưới"}'),

-- Chương trình 9: Chiến lược Giảm hại (6 nội dung)
(9, 'Giới thiệu về Giảm hại', 'article', 1, '/content/markdown/gioi-thieu-giam-hai.md', 'markdown', '{"author": "Chuyên gia Giảm hại", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),
(9, 'Thực hành Sử dụng An toàn', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "18:45", "format": "youtube", "instructor": "Giáo viên Sử dụng An toàn"}'),
(9, 'Chương trình Trao đổi Bơm kim tiêm', 'article', 3, '/content/markdown/trao-doi-bom-kim.md', 'markdown', '{"author": "Điều phối viên Trao đổi Bơm kim", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(9, 'Lưu trữ và Tiêu hủy An toàn', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "13:30", "format": "youtube", "instructor": "Điều phối viên An toàn"}'),
(9, 'Giảm hại trong Cộng đồng', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "40:00", "format": "youtube", "host": "Tổ chức Cộng đồng"}'),
(9, 'Giảm hại dựa trên Bằng chứng', 'article', 6, '/content/markdown/giam-hai-bang-chung.md', 'markdown', '{"author": "Nhà nghiên cứu Khoa học", "readingTime": "14 phút", "difficulty": "nâng cao"}'),

-- Chương trình 10: Giáo dục Sử dụng An toàn hơn (5 nội dung)
(10, 'Đánh giá và Giảm thiểu Rủi ro', 'article', 1, '/content/markdown/danh-gia-rui-ro.md', 'markdown', '{"author": "Chuyên gia Đánh giá Rủi ro", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(10, 'Kiểm tra Thuốc và Chất pha trộn', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:20", "format": "youtube", "instructor": "Chuyên gia Kiểm tra"}'),
(10, 'Thực hành Tiêm chích An toàn', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:45", "format": "youtube", "instructor": "Chuyên gia Tiêm an toàn"}'),
(10, 'Phòng ngừa Nhiễm trùng và Bệnh tật', 'article', 4, '/content/markdown/phong-ngua-nhiem-trung.md', 'markdown', '{"author": "Chuyên gia Bệnh truyền nhiễm", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(10, 'Khi nào Cần tìm Trợ giúp Y tế', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "25:00", "format": "youtube", "host": "Cố vấn Y tế"}'),

-- Nội dung Chương trình Sự kiện Cộng đồng
-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng (2 nội dung)
(31, 'Lập kế hoạch Hội chợ Phòng ngừa Cộng đồng', 'article', 1, '/content/markdown/hoi-cho-phong-ngua.md', 'markdown', '{"author": "Điều phối viên Sự kiện Cộng đồng", "readingTime": "8 phút", "difficulty": "sơ cấp"}'),
(31, 'Hoạt động Thu hút Mọi lứa tuổi', 'article', 2, '/content/markdown/hoat-dong-hoi-cho.md', 'markdown', '{"author": "Chuyên gia Thu hút Thanh thiếu niên", "readingTime": "6 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ (2 nội dung)
(31, 'Tổ chức Sự kiện Đi bộ Hỗ trợ Phục hồi', 'article', 1, '/content/markdown/to-chuc-di-bo.md', 'markdown', '{"author": "Người vận động Phục hồi", "readingTime": "7 phút", "difficulty": "sơ cấp"}'),
(31, 'Xây dựng Mạng lưới Hỗ trợ Cộng đồng', 'article', 2, '/content/markdown/mang-luoi-ho-tro.md', 'markdown', '{"author": "Tổ chức Cộng đồng", "readingTime": "9 phút", "difficulty": "sơ cấp"}');

-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES

-- ==================== CHƯƠNG TRÌNH KHOA HỌC NGHIỆN ====================

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá trước
(1, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn đánh giá hiểu biết hiện tại của mình về cách nghiện ảnh hưởng đến não bộ như thế nào?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"]}, {"id": 2, "question": "Bạn biết gì về chất dẫn truyền thần kinh và vai trò của chúng trong nghiện?", "options": ["Chưa từng nghe", "Đã nghe nhưng không hiểu", "Hiểu cơ bản", "Hiểu khá", "Hiểu chuyên sâu"]}, {"id": 3, "question": "Bạn quen thuộc thế nào với khái niệm đường dẫn phần thưởng dopamine?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"]}, {"id": 4, "question": "Bạn tin nghiện chủ yếu là sự lựa chọn hay bệnh lý?", "options": ["Hoàn toàn là lựa chọn", "Chủ yếu là lựa chọn", "Cả hai như nhau", "Chủ yếu là bệnh", "Hoàn toàn là bệnh"]}, {"id": 5, "question": "Bạn tự tin thế nào khi giải thích khoa học về nghiện cho người khác?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 6, "question": "Điều gì hấp dẫn bạn nhất khi học về khoa học nghiện?", "options": ["Cơ chế não bộ", "Ứng dụng điều trị", "Chiến lược phòng ngừa", "Phương pháp nghiên cứu", "Hiểu biết cá nhân", "Tất cả khía cạnh"]}]}'),

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá sau  
(1, 'post-assessment', '{"questions": [{"id": 1, "question": "Sau khi hoàn thành chương trình, bạn hiểu thế nào về cách nghiện thay đổi cấu trúc và chức năng não?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"]}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào khi giải thích vai trò chất dẫn truyền thần kinh trong nghiện?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 3, "question": "Khía cạnh nào của khoa học nghiện bạn thấy sáng tỏ nhất?", "options": ["Đường dẫn phần thưởng dopamine", "Tính mềm dẻo và phục hồi não", "Yếu tố di truyền", "Ảnh hưởng môi trường", "Cơ chế điều trị", "Tất cả đều quan trọng"]}, {"id": 4, "question": "Chương trình đã thay đổi nhận thức của bạn về nghiện như bệnh lý thế nào?", "options": ["Hiểu biết tăng đáng kể", "Hiểu biết tăng vừa phải", "Hiểu biết tăng nhẹ", "Không thay đổi", "Giảm hiểu biết"]}, {"id": 5, "question": "Khả năng bạn chia sẻ kiến thức khoa học nghiện với người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}, {"id": 6, "question": "Đánh giá hiệu quả chương trình khoa học nghiện này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 7, "question": "Bạn cảm thấy chuẩn bị thế nào để nhận biết dấu hiệu nghiện ở bản thân/người khác?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}]}'),

-- Chương trình 2: Não bộ và Nghiện - Đánh giá trước
(2, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với giải phẫu não liên quan đến nghiện?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"]}, {"id": 2, "question": "Bạn biết gì về hệ thống phần thưởng của não?", "options": ["Không biết gì", "Rất ít", "Khái niệm cơ bản", "Hiểu khá", "Hiểu toàn diện"]}, {"id": 3, "question": "Bạn hiểu thế nào về cơ chế dung nạp và phụ thuộc?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"]}, {"id": 4, "question": "Bạn quen thuộc với kỹ thuật chụp não trong nghiên cứu nghiện?", "options": ["Chưa từng nghe", "Đã nghe nhưng không hiểu", "Nhận thức cơ bản", "Hiểu khá", "Rất am hiểu"]}, {"id": 5, "question": "Điều gì hấp dẫn bạn nhất về khoa học não và nghiện?", "options": ["Cách nghiện phát triển", "Quá trình phục hồi não", "Khác biệt cá nhân", "Ứng dụng điều trị", "Phương pháp nghiên cứu", "Tất cả khía cạnh"]}, {"id": 6, "question": "Bạn tự tin thế nào về khái niệm tính mềm dẻo thần kinh?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}]}'),

-- Chương trình 2: Não bộ và Nghiện - Đánh giá sau
(2, 'post-assessment', '{"questions": [{"id": 1, "question": "Bây giờ bạn hiểu thế nào về giải phẫu não liên quan đến nghiện?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"]}, {"id": 2, "question": "Sau chương trình, bạn tự tin thế nào khi giải thích hệ thống phần thưởng của não?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 3, "question": "Khái niệm khoa học não nào có giá trị nhất để học?", "options": ["Chức năng chất dẫn truyền", "Cơ chế dung nạp", "Kết quả chụp não", "Tính mềm dẻo và phục hồi", "Khác biệt não cá nhân", "Tất cả đều giá trị"]}, {"id": 4, "question": "Việc học khoa học não đã thay đổi hiểu biết của bạn về phục hồi nghiện thế nào?", "options": ["Hiểu biết cải thiện đáng kể", "Hiểu biết cải thiện vừa phải", "Hiểu biết cải thiện nhẹ", "Không thay đổi", "Làm tôi bối rối hơn"]}, {"id": 5, "question": "Khả năng bạn tiếp tục học về khoa học thần kinh và nghiện?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}, {"id": 6, "question": "Đánh giá hiệu quả chương trình khoa học não này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 7, "question": "Bạn có thể giải thích tính mềm dẻo thần kinh cho người khác thế nào?", "options": ["Không thể giải thích", "Giải thích cơ bản", "Giải thích vừa phải", "Giải thích tốt", "Giải thích chuyên sâu"]}]}'),

-- ==================== CHƯƠNG TRÌNH GIÁO DỤC CẦN SA ====================

-- Chương trình 3: Giáo dục và Nhận thức Cần sa - Đánh giá trước
(3, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức hiện tại về cần sa và tác dụng?", "options": ["Rất hạn chế", "Hạn chế", "Trung bình", "Tốt", "Sâu rộng"]}, {"id": 2, "question": "Bạn biết gì về sự khác biệt giữa THC và CBD?", "options": ["Không biết gì", "Rất ít", "Khác biệt cơ bản", "Hiểu khá", "Hiểu toàn diện"]}, {"id": 3, "question": "Bạn quen thuộc thế nào với luật cần sa ở khu vực?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"]}, {"id": 4, "question": "Điều gì bạn lo ngại nhất về sử dụng cần sa?", "options": ["Ảnh hưởng sức khỏe", "Vấn đề pháp lý", "Tác động sức khỏe tâm thần", "Khả năng nghiện", "Hậu quả xã hội", "Không lo ngại"]}, {"id": 5, "question": "Bạn tự tin thế nào khi thảo luận chủ đề cần sa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 6, "question": "Động lực nào thúc đẩy bạn học về giáo dục cần sa?", "options": ["Quan tâm cá nhân", "Lo ngại gia đình", "Phát triển nghề nghiệp", "Tình huống áp lực bạn bè", "Nhận thức sức khỏe", "Tất cả trên"]}]}'),

-- Chương trình 3: Giáo dục và Nhận thức Cần sa - Đánh giá sau
(3, 'post-assessment', '{"questions": [{"id": 1, "question": "Sau khi hoàn thành, bạn đánh giá kiến thức cần sa của mình?", "options": ["Rất hạn chế", "Hạn chế", "Trung bình", "Tốt", "Sâu rộng"]}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào khi giải thích khác biệt THC vs CBD?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 3, "question": "Khía cạnh nào của giáo dục cần sa có giá trị nhất?", "options": ["Sử dụng y tế vs giải trí", "Xem xét pháp lý", "Rủi ro và lợi ích sức khỏe", "Sự thật và ngộ nhận", "Tác động sức khỏe tâm thần", "Tất cả đều giá trị"]}, {"id": 4, "question": "Chương trình đã ảnh hưởng thế nào đến quan điểm của bạn về sử dụng cần sa?", "options": ["Thay đổi đáng kể quan điểm", "Thay đổi vừa phải quan điểm", "Thay đổi nhẹ quan điểm", "Củng cố quan điểm hiện có", "Không thay đổi"]}, {"id": 5, "question": "Bạn cảm thấy chuẩn bị thế nào để ra quyết định sáng suốt về cần sa?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}, {"id": 6, "question": "Đánh giá hiệu quả chương trình giáo dục cần sa này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 7, "question": "Khả năng bạn chia sẻ sự thật về cần sa để bác bỏ ngộ nhận?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}]}'),

-- ==================== CHƯƠNG TRÌNH SỰ KIỆN CỘNG ĐỒNG ====================

-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng - Đánh giá trước
(25, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với việc tổ chức sự kiện phòng ngừa cộng đồng?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"]}, {"id": 2, "question": "Bạn có kinh nghiệm gì với hoạt động thu hút cộng đồng?", "options": ["Không kinh nghiệm", "Rất ít kinh nghiệm", "Một số kinh nghiệm", "Kinh nghiệm tốt", "Kinh nghiệm sâu rộng"]}, {"id": 3, "question": "Bạn tự tin thế nào về lập kế hoạch hoạt động hội chợ phòng ngừa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 4, "question": "Thách thức nào bạn dự đoán khi tổ chức hội chợ phòng ngừa?", "options": ["Thu hút cộng đồng", "Phối hợp nguồn lực", "Lập kế hoạch hoạt động", "Quản lý tình nguyện viên", "Hậu cần và chuẩn bị", "Tất cả trên"]}, {"id": 5, "question": "Bạn mong học gì về lập kế hoạch hội chợ phòng ngừa?", "options": ["Hậu cần sự kiện", "Thiết kế hoạt động", "Tiếp cận cộng đồng", "Quản lý nguồn lực", "Đo lường tác động", "Tất cả khía cạnh"]}, {"id": 6, "question": "Bạn đánh giá tầm quan trọng của hội chợ phòng ngừa với sức khỏe cộng đồng?", "options": ["Không quan trọng", "Hơi quan trọng", "Quan trọng vừa phải", "Rất quan trọng", "Cực kỳ quan trọng"]}]}'),

-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng - Đánh giá sau
(25, 'post-assessment', '{"questions": [{"id": 1, "question": "Sau chương trình, bạn tự tin thế nào về tổ chức hội chợ phòng ngừa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 2, "question": "Khía cạnh nào của lập kế hoạch hội chợ có giá trị nhất?", "options": ["Thiết kế hoạt động cho mọi lứa tuổi", "Chiến lược tiếp cận cộng đồng", "Phối hợp nguồn lực", "Quản lý tình nguyện viên", "Đo lường tác động", "Tất cả đều giá trị"]}, {"id": 3, "question": "Khả năng bạn tổ chức hoặc giúp hội chợ phòng ngừa trong cộng đồng?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}, {"id": 4, "question": "Thành phần nào của hội chợ phòng ngừa có tác động nhất?", "options": ["Gian hàng giáo dục", "Hoạt động tương tác", "Phân phối tài nguyên", "Kết nối cộng đồng", "Thu hút gia đình", "Tất cả thành phần cùng nhau"]}, {"id": 5, "question": "Chương trình đã thay đổi hiểu biết của bạn về công tác phòng ngừa cộng đồng?", "options": ["Hiểu biết tăng đáng kể", "Hiểu biết tăng vừa phải", "Hiểu biết tăng nhẹ", "Không thay đổi", "Giảm hiểu biết"]}, {"id": 6, "question": "Đánh giá hiệu quả chương trình lập kế hoạch hội chợ này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 7, "question": "Bạn chuẩn bị thế nào để thu hút thành viên cộng đồng đa dạng vào hoạt động phòng ngừa?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}]}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ - Đánh giá trước
(26, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với sự kiện hỗ trợ phục hồi và mục đích?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"]}, {"id": 2, "question": "Bạn có kinh nghiệm gì với sự kiện sức khỏe cộng đồng?", "options": ["Không kinh nghiệm", "Rất ít kinh nghiệm", "Một số kinh nghiệm", "Kinh nghiệm tốt", "Kinh nghiệm sâu rộng"]}, {"id": 3, "question": "Bạn thoải mái thế nào khi thảo luận chủ đề phục hồi và sức khỏe tâm thần?", "options": ["Rất không thoải mái", "Không thoải mái", "Trung lập", "Thoải mái", "Rất thoải mái"]}, {"id": 4, "question": "Bạn mong đạt gì từ việc học về đi bộ phục hồi?", "options": ["Kỹ năng lập kế hoạch sự kiện", "Hiểu hỗ trợ phục hồi", "Kiến thức xây dựng cộng đồng", "Chiến lược giảm kỳ thị", "Phát triển cá nhân", "Tất cả trên"]}, {"id": 5, "question": "Bạn đánh giá tầm quan trọng của sự kiện hỗ trợ phục hồi với cộng đồng?", "options": ["Không quan trọng", "Hơi quan trọng", "Quan trọng vừa phải", "Rất quan trọng", "Cực kỳ quan trọng"]}, {"id": 6, "question": "Bạn lo ngại gì về tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Riêng tư và bảo mật", "Chấp nhận cộng đồng", "Yêu cầu nguồn lực", "Xem xét an toàn", "Nhu cầu hỗ trợ tinh thần", "Không lo ngại"]}]}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ - Đánh giá sau
(26, 'post-assessment', '{"questions": [{"id": 1, "question": "Sau chương trình, bạn tự tin thế nào về tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 2, "question": "Khía cạnh nào của lập kế hoạch đi bộ phục hồi sáng tỏ nhất?", "options": ["Tạo môi trường bao trùm", "Quản lý an toàn tinh thần", "Xây dựng quan hệ đối tác", "Tôn vinh hành trình phục hồi", "Giảm kỳ thị", "Tất cả đều quan trọng"]}, {"id": 3, "question": "Khả năng bạn tham gia hoặc tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}, {"id": 4, "question": "Bạn nghĩ đi bộ phục hồi tác động thế nào đến thái độ cộng đồng?", "options": ["Không tác động", "Tác động tối thiểu", "Tác động vừa phải", "Tác động đáng kể", "Tác động chuyển đổi"]}, {"id": 5, "question": "Chương trình đã ảnh hưởng thế nào đến hiểu biết của bạn về phục hồi và hỗ trợ?", "options": ["Hiểu biết sâu sắc hơn đáng kể", "Hiểu biết sâu sắc hơn vừa phải", "Hiểu biết sâu sắc hơn nhẹ", "Không thay đổi", "Làm tôi bối rối hơn"]}, {"id": 6, "question": "Đánh giá hiệu quả chương trình hỗ trợ phục hồi này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 7, "question": "Bạn chuẩn bị thế nào để tạo môi trường hỗ trợ người phục hồi?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}]}'),

-- ==================== CHƯƠNG TRÌNH PHÒNG NGỪA CHUNG ====================

-- Khảo sát Đánh giá trước cho Tất cả Chương trình Phòng ngừa
(NULL, 'pre-assessment', '{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức tổng thể về phòng ngừa lạm dụng chất?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"]}, {"id": 2, "question": "Bạn tự tin thế nào về khả năng quyết định lành mạnh liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 3, "question": "Động lực nào thúc đẩy bạn tham gia chương trình giáo dục phòng ngừa?", "options": ["Quan tâm cá nhân", "Lo ngại gia đình", "Phát triển nghề nghiệp", "Tham gia cộng đồng", "Nhận thức sức khỏe", "Tất cả trên"]}, {"id": 4, "question": "Bạn thường tìm kiếm thông tin về chủ đề sức khỏe?", "options": ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Thường xuyên", "Luôn luôn"]}, {"id": 5, "question": "Nguồn hỗ trợ chính cho quyết định lành mạnh của bạn?", "options": ["Gia đình", "Bạn bè", "Nhà cung cấp y tế", "Chương trình cộng đồng", "Tài nguyên trực tuyến", "Nhiều nguồn"]}, {"id": 6, "question": "Bạn chuẩn bị thế nào để giúp người khác ra quyết định sáng suốt về chất kích thích?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}]}'),

-- Khảo sát Đánh giá sau cho Tất cả Chương trình Phòng ngừa  
(NULL, 'post-assessment', '{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức về phòng ngừa lạm dụng chất sau khi hoàn thành?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"]}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào về quyết định sáng suốt liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"]}, {"id": 3, "question": "Thành phần chương trình nào có lợi nhất cho việc học của bạn?", "options": ["Tài liệu giáo dục", "Hoạt động tương tác", "Bài tập thực hành", "Thảo luận nhóm", "Thông tin tài nguyên", "Tất cả thành phần"]}, {"id": 4, "question": "Khả năng bạn áp dụng kiến thức từ chương trình này?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}, {"id": 5, "question": "Hiểu biết của bạn về tài nguyên phòng ngừa và hỗ trợ đã thay đổi?", "options": ["Cải thiện đáng kể", "Cải thiện vừa phải", "Cải thiện nhẹ", "Không thay đổi", "Giảm sút"]}, {"id": 6, "question": "Bây giờ bạn chuẩn bị thế nào để hỗ trợ người khác ra quyết định lành mạnh?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"]}, {"id": 7, "question": "Đánh giá hiệu quả tổng thể chương trình phòng ngừa này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"]}, {"id": 8, "question": "Khả năng bạn giới thiệu chương trình này cho người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"]}]}');
-- Insert Survey Responses

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, 'Hiểu về Khoa học Nghiện', 'Nghiện là một bệnh lý phức tạp ảnh hưởng đến hệ thống khen thưởng, động lực và trí nhớ của não bộ. Trong bài viết này, chúng ta khám phá những thay đổi sinh học thần kinh xảy ra khi sử dụng chất gây nghiện và cách hiểu biết về những thay đổi này có thể giảm kỳ thị và cải thiện kết quả điều trị...', '2024-01-10 09:00:00', 'published', '/uploads/blog-images/science-addiction.jpg'),

(3, '5 Cách Hỗ trợ Người thân Đang Phục hồi', 'Hỗ trợ người đang phục hồi có thể đầy thách thức nhưng cũng vô cùng ý nghĩa. Dưới đây là 5 chiến lược dựa trên bằng chứng mà thành viên gia đình và bạn bè có thể áp dụng để hỗ trợ hiệu quả: 1. Tìm hiểu kiến thức về nghiện, 2. Thiết lập ranh giới lành mạnh...', '2024-01-12 14:00:00', 'published', '/uploads/blog-images/support-recovery.jpg'),

(4, 'Chiến lược Phòng ngừa Thực sự Hiệu quả', 'Nghiên cứu cho thấy các chương trình phòng ngừa hiệu quả có chung nhiều đặc điểm quan trọng. Bài viết này phân tích các chiến lược phòng ngừa dựa trên bằng chứng và cách triển khai trong trường học, cộng đồng và gia đình...', '2024-01-15 11:00:00', 'published', '/uploads/blog-images/prevention-strategies.jpg'),

(1, 'Nghiên cứu Mới về Phát triển Não Tuổi teen và Sử dụng Chất kích thích', 'Nghiên cứu thần kinh học gần đây tiết lộ những hiểu biết quan trọng về sự phát triển não bộ tuổi vị thành niên và tính dễ tổn thương với chất kích thích. Hiểu các yếu tố phát triển này là rất quan trọng để thiết kế chương trình phòng ngừa hiệu quả...', '2024-01-18 16:00:00', 'draft', '/uploads/blog-images/teen-brain.jpg');
-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, 'Nội dung chứa thông tin y tế cần được chuyên gia xem xét trước khi xuất bản', '2024-01-19 10:00:00');