-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
-- Status options: 'active' (can login), 'inactive' (soft deleted, cannot login), 'banned' (cannot login)
INSERT INTO Users (role, password, status, email, img_link) VALUES
(N'admin', N'hashed_password_123', N'active', N'admin@drugprevention.com', N'/uploads/profile-pictures/default-admin.png'),
(N'admin', N'hashed_password_456', N'active', N'dr.smith@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_789', N'active', N'therapist.johnson@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_321', N'active', N'counselor.williams@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_654', N'inactive', N'dr.brown@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'), -- Deactivated account
(N'member', N'hashed_password_987', N'active', N'john.doe@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_147', N'active', N'jane.smith@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_258', N'active', N'mike.wilson@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_369', N'active', N'sarah.davis@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_741', N'banned', N'banned.user@email.com', NULL), -- Banned account
(N'member', N'hashed_password_999', N'inactive', N'deleted.user@email.com', NULL); -- Soft deleted account (user "deleted" their account)

-- Insert Profiles for all users
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, N'Quản trị viên', N'{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', N'Quản trị hệ thống'),
(2, N'Bác sĩ Michael Smith', N'{"bio": "Bác sĩ tâm thần nghiện có giấy phép với 15 năm kinh nghiệm trong điều trị và phòng ngừa lạm dụng chất", "education": "MD từ Johns Hopkins, Chứng nhận Hội đồng về Y học Nghiện"}', '1975-03-20', N'Bác sĩ tâm thần nghiện'),
(3, N'Sarah Johnson', N'{"bio": "Nhà trị liệu lâm sàng được cấp phép chuyên về tư vấn nghiện và trị liệu gia đình", "education": "Thạc sĩ Tâm lý học Lâm sàng, Tư vấn viên Chuyên nghiệp được cấp phép"}', '1982-08-12', N'Nhà trị liệu lâm sàng'),
(4, N'Robert Williams', N'{"bio": "Tư vấn viên lạm dụng chất được chứng nhận với chuyên môn về các chương trình phòng ngừa thanh thiếu niên", "education": "Thạc sĩ Tư vấn Nghiện, Chứng nhận CADC"}', '1978-11-05', N'Tư vấn viên lạm dụng chất'),
(5, N'Bác sĩ Emily Brown', N'{"bio": "Nhà tâm lý học lâm sàng chuyên về can thiệp hành vi cho nghiện", "education": "Tiến sĩ Tâm lý học Lâm sàng"}', '1980-01-30', N'Nhà tâm lý học lâm sàng'),
(6, N'John Doe', N'{"bio": "Tìm kiếm hỗ trợ cho phục hồi nghiện", "interests": ["thể dục", "đọc sách"]}', '1995-06-10', N'Lập trình viên'),
(7, N'Jane Smith', N'{"bio": "Phụ huynh tìm kiếm tài nguyên phòng ngừa cho thanh thiếu niên", "interests": ["làm cha mẹ", "phục vụ cộng đồng"]}', '1978-09-22', N'Giáo viên'),
(8, N'Mike Wilson', N'{"bio": "Sinh viên đại học quan tâm đến giáo dục phòng ngừa", "interests": ["thể thao", "âm nhạc"]}', '2001-12-03', N'Sinh viên'),
(9, N'Sarah Davis', N'{"bio": "Nhân viên y tế tìm kiếm phát triển chuyên môn về phòng ngừa nghiện", "interests": ["y tế", "đào tạo"]}', '1988-04-17', N'Y tá'),
(10, N'Người dùng bị cấm', N'{"bio": "Tài khoản người dùng bị cấm do vi phạm"}', '1990-07-25', N'Không xác định'),
(11, N'Người dùng đã xóa', N'{"bio": "Người dùng đã xóa tài khoản (dữ liệu được bảo tồn)"}', '1992-03-18', N'Thành viên cũ');

-- Insert Consultants
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, N'Chứng nhận Hội đồng về Y học Nghiện, Bác sĩ được cấp phép', N'Tâm thần học nghiện, Điều trị hỗ trợ bằng thuốc, Chẩn đoán kép'),
(3, 120.00, N'Tư vấn viên Chuyên nghiệp được cấp phép, Tư vấn viên Nghiện được chứng nhận', N'Trị liệu cá nhân và gia đình, Trị liệu nhận thức hành vi, Chăm sóc thông hiểu chấn thương'),
(4, 100.00, N'Tư vấn viên Rượu và Ma túy được chứng nhận, Chuyên gia Phòng ngừa', N'Chương trình Phòng ngừa Thanh thiếu niên, Trị liệu nhóm, Tiếp cận cộng đồng'),
(5, 130.00, N'Nhà tâm lý học Lâm sàng được cấp phép, Chuyên gia Điều trị Nghiện', N'Can thiệp hành vi, Đánh giá và Định giá, Lập kế hoạch điều trị');

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
(1, 1, N'Thứ Hai'), (1, 2, N'Thứ Hai'), (1, 5, N'Thứ Hai'), (1, 6, N'Thứ Hai'),
(1, 1, N'Thứ Ba'), (1, 2, N'Thứ Ba'), (1, 5, N'Thứ Ba'), (1, 6, N'Thứ Ba'),
(1, 1, N'Thứ Tư'), (1, 2, N'Thứ Tư'), (1, 5, N'Thứ Tư'), (1, 6, N'Thứ Tư'),
(1, 1, N'Thứ Năm'), (1, 2, N'Thứ Năm'), (1, 5, N'Thứ Năm'), (1, 6, N'Thứ Năm'),
(1, 1, N'Thứ Sáu'), (1, 2, N'Thứ Sáu'), (1, 5, N'Thứ Sáu'), (1, 6, N'Thứ Sáu'),

-- Sarah Johnson (Consultant 2) - Monday to Saturday, flexible hours
(2, 3, N'Thứ Hai'), (2, 4, N'Thứ Hai'), (2, 7, N'Thứ Hai'), (2, 8, N'Thứ Hai'),
(2, 3, N'Thứ Ba'), (2, 4, N'Thứ Ba'), (2, 7, N'Thứ Ba'), (2, 8, N'Thứ Ba'),
(2, 3, N'Thứ Tư'), (2, 4, N'Thứ Tư'), (2, 7, N'Thứ Tư'), (2, 8, N'Thứ Tư'),
(2, 3, N'Thứ Năm'), (2, 4, N'Thứ Năm'), (2, 7, N'Thứ Năm'), (2, 8, N'Thứ Năm'),
(2, 3, N'Thứ Sáu'), (2, 4, N'Thứ Sáu'), (2, 7, N'Thứ Sáu'), (2, 8, N'Thứ Sáu'),
(2, 2, N'Thứ Bảy'), (2, 3, N'Thứ Bảy'), (2, 4, N'Thứ Bảy'),

-- Robert Williams (Consultant 3) - Monday to Friday, afternoon and evening
(3, 5, N'Thứ Hai'), (3, 6, N'Thứ Hai'), (3, 7, N'Thứ Hai'), (3, 9, N'Thứ Hai'),
(3, 5, N'Thứ Ba'), (3, 6, N'Thứ Ba'), (3, 7, N'Thứ Ba'), (3, 9, N'Thứ Ba'),
(3, 5, N'Thứ Tư'), (3, 6, N'Thứ Tư'), (3, 7, N'Thứ Tư'), (3, 9, N'Thứ Tư'),
(3, 5, N'Thứ Năm'), (3, 6, N'Thứ Năm'), (3, 7, N'Thứ Năm'), (3, 9, N'Thứ Năm'),
(3, 5, N'Thứ Sáu'), (3, 6, N'Thứ Sáu'), (3, 7, N'Thứ Sáu'), (3, 9, N'Thứ Sáu'),

-- Dr. Brown (Consultant 4) - Tuesday to Saturday, morning and afternoon
(4, 1, N'Thứ Ba'), (4, 2, N'Thứ Ba'), (4, 3, N'Thứ Ba'), (4, 5, N'Thứ Ba'),
(4, 1, N'Thứ Tư'), (4, 2, N'Thứ Tư'), (4, 3, N'Thứ Tư'), (4, 5, N'Thứ Tư'),
(4, 1, N'Thứ Năm'), (4, 2, N'Thứ Năm'), (4, 3, N'Thứ Năm'), (4, 5, N'Thứ Năm'),
(4, 1, N'Thứ Sáu'), (4, 2, N'Thứ Sáu'), (4, 3, N'Thứ Sáu'), (4, 5, N'Thứ Sáu'),
(4, 1, N'Thứ Bảy'), (4, 2, N'Thứ Bảy'), (4, 3, N'Thứ Bảy'), (4, 5, N'Thứ Bảy');

-- Insert Booking Sessions
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link) VALUES
(1, 6, 1, '2024-01-15', N'Hoàn thành', N'Tư vấn ban đầu để đánh giá nghiện. Bệnh nhân thể hiện sự tham gia tốt.', N'https://meet.google.com/abc-defg-hij'),
(1, 6, 5, '2024-01-22', N'Hoàn thành', N'Buổi theo dõi. Thảo luận về các lựa chọn điều trị và cân nhắc thuốc.', N'https://meet.google.com/klm-nopq-rst'),
(2, 7, 7, '2024-01-18', N'Hoàn thành', N'Tư vấn phụ huynh về chiến lược phòng ngừa sử dụng chất ở thanh thiếu niên.', N'https://meet.google.com/uvw-xyz-123'),
(3, 8, 6, '2024-01-20', N'Lên lịch', N'Buổi giáo dục phòng ngừa cho sinh viên đại học đã được lên lịch.', NULL),
(2, 9, 3, '2024-01-25', N'Lên lịch', N'Tư vấn phát triển chuyên môn cho nhân viên y tế.', NULL),
(1, 6, 2, '2024-01-29', N'Lên lịch', N'Buổi lập kế hoạch điều trị đang diễn ra.', NULL),
(4, 7, 1, '2024-01-23', N'Đã hủy', N'Phụ huynh hủy do xung đột lịch trình.', NULL),
(3, 8, 9, '2024-01-17', N'Hoàn thành', N'Buổi chuẩn bị trị liệu nhóm hoàn thành thành công.', N'https://meet.google.com/456-789-012');

-- Insert Categories
INSERT INTO Category (name, description) VALUES
(N'Khoa học nghiện', N'Nội dung giáo dục khám phá nền tảng khoa học của nghiện, hóa học não và tác động thần kinh'),
(N'Cần sa (Marijuana)', N'Nội dung giáo dục về sử dụng cần sa, tác dụng, rủi ro và cân nhắc pháp lý'),
(N'Xu hướng ma túy mới', N'Thông tin về các chất mới và đang nổi lên, ma túy tổng hợp và mô hình sử dụng ma túy đang phát triển'),
(N'Fentanyl', N'Giáo dục quan trọng về fentanyl, sự nguy hiểm, phòng ngừa quá liều và biện pháp an toàn'),
(N'Giảm tác hại', N'Chiến lược và cách tiếp cận để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng ma túy'),
(N'Heroin', N'Nội dung giáo dục về nghiện heroin, lựa chọn điều trị và tài nguyên phục hồi'),
(N'HIV', N'Thông tin về phòng ngừa HIV, xét nghiệm và chăm sóc liên quan đến sử dụng chất'),
(N'Kratom', N'Nội dung giáo dục về sử dụng kratom, tác dụng và rủi ro tiềm ẩn'),
(N'Methamphetamine', N'Thông tin về nghiện methamphetamine, tác dụng và cách tiếp cận điều trị'),
(N'Opioid', N'Giáo dục toàn diện về nghiện opioid, lạm dụng thuốc theo toa và điều trị'),
(N'Phòng ngừa', N'Chiến lược phòng ngừa dựa trên bằng chứng, chương trình và sáng kiến giáo dục'),
(N'Thuốc gây ảo giác và phân ly', N'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng'),
(N'Psilocybin (Nấm ma thuật)', N'Thông tin về nấm psilocybin, tác dụng và cân nhắc an toàn'),
(N'Kỳ thị và phân biệt đối xử', N'Giải quyết kỳ thị, thúc đẩy hiểu biết và giảm phân biệt đối xử trong nghiện'),
(N'Chương trình dịch vụ bơm kim tiêm', N'Thông tin về chương trình trao đổi kim tiêm và dịch vụ giảm tác hại'),
(N'Thuốc lá/Nicotine và Vaping', N'Nội dung giáo dục về sử dụng thuốc lá, nghiện nicotine và rủi ro vaping'),
(N'Điều trị', N'Thông tin toàn diện về lựa chọn điều trị nghiện, chương trình phục hồi và dịch vụ hỗ trợ'),
(N'Sự kiện cộng đồng', N'Sự kiện dựa vào cộng đồng, hội thảo và hoạt động thúc đẩy nhận thức phòng ngừa ma túy và hỗ trợ nỗ lực phục hồi');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
-- Chương trình Khoa học Nghiện
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Hiểu biết Khoa học về Nghiện', N'Khám phá toàn diện về khoa học thần kinh đằng sau nghiện, thay đổi não và cơ chế phục hồi', 1, N'active', N'18+', GETDATE(), 1),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Não và Nghiện: Góc nhìn Khoa học', N'Tìm hiểu sâu về cách chất tác động đến hóa học não và đường dẫn thần kinh', 1, N'active', N'18+', GETDATE(), 1),

-- Chương trình Cần sa
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục và Nhận thức về Cần sa', N'Thông tin dựa trên bằng chứng về sử dụng cần sa, tác dụng và cân nhắc pháp lý', 1, N'active', N'18+', GETDATE(), 2),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Cần sa và Phát triển Thanh thiếu niên', N'Hiểu tác động của sử dụng cần sa lên não đang phát triển', 1, N'active', N'13-25', GETDATE(), 2),

-- Chương trình Xu hướng Ma túy Mới
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Cảnh báo Chất Tâm thần Mới', N'Cập nhật về các loại ma túy tổng hợp và chất mới nổi', 1, N'active', N'18+', GETDATE(), 3),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chương trình Nhận thức Ma túy Tổng hợp', N'Giáo dục về ma túy thiết kế, rủi ro và cách nhận biết', 1, N'active', N'16+', GETDATE(), 3),

-- Chương trình Fentanyl
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Ứng phó Khủng hoảng Fentanyl', N'Giáo dục quan trọng về sự nguy hiểm của fentanyl, phòng ngừa quá liều và đào tạo naloxone', 1, N'active', N'16+', GETDATE(), 4),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Phòng ngừa và Ứng phó Quá liều', N'Kỹ thuật cứu sống và phản ứng khẩn cấp cho quá liều opioid', 1, N'active', N'16+', GETDATE(), 4),

-- Chương trình Giảm Tác hại
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chiến lược Giảm Tác hại', N'Cách tiếp cận thực tế để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng chất', 1, N'active', N'18+', GETDATE(), 5),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục Sử dụng An toàn', N'Kỹ thuật giảm tác hại dựa trên bằng chứng và giao thức an toàn', 1, N'active', N'18+', GETDATE(), 5),

-- Chương trình Heroin
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Lựa chọn Điều trị Nghiện Heroin', N'Hướng dẫn toàn diện về điều trị nghiện heroin và con đường phục hồi', 1, N'active', N'18+', GETDATE(), 6),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Điều trị Hỗ trợ bằng Thuốc cho Heroin', N'Hiểu về methadone, buprenorphine và các loại thuốc điều trị khác', 1, N'active', N'18+', GETDATE(), 6),

-- Chương trình HIV
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Phòng ngừa HIV trong Sử dụng Chất', N'Ngăn ngừa lây truyền HIV giữa những người sử dụng ma túy', 1, N'active', N'18+', GETDATE(), 7),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Dịch vụ Xét nghiệm và Chăm sóc HIV', N'Tiếp cận xét nghiệm HIV, điều trị và dịch vụ hỗ trợ', 1, N'active', N'18+', GETDATE(), 7),

-- Chương trình Kratom
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Kratom: Sự thật và Rủi ro', N'Nội dung giáo dục về sử dụng kratom, tác dụng và rủi ro sức khỏe tiềm ẩn', 1, N'active', N'18+', GETDATE(), 8),

-- Chương trình Methamphetamine
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Phục hồi Nghiện Methamphetamine', N'Cách tiếp cận điều trị và chiến lược phục hồi cho nghiện methamphetamine', 1, N'active', N'18+', GETDATE(), 9),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Hiểu Tác dụng Methamphetamine', N'Giáo dục toàn diện về sử dụng meth, tác động sức khỏe và rủi ro', 1, N'active', N'16+', GETDATE(), 9),

-- Chương trình Opioid
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Nhận thức Khủng hoảng Opioid', N'Hiểu về đại dịch opioid, lạm dụng thuốc theo toa và giải pháp', 1, N'active', N'16+', GETDATE(), 10),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'An toàn Thuốc Opioid Kê đơn', N'Sử dụng an toàn, bảo quản và tiêu hủy thuốc opioid kê đơn', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 10),

-- Chương trình Phòng ngừa
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chương trình Phòng ngừa Ma túy Thanh thiếu niên', N'Chiến lược phòng ngừa dựa trên bằng chứng cho thanh thiếu niên', 1, N'active', N'13-18', GETDATE(), 11),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Sáng kiến Phòng ngừa Cộng đồng', N'Xây dựng khả năng phục hồi và năng lực phòng ngừa cộng đồng', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 11),

-- Chương trình Chất gây Ảo giác
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục về Chất gây Ảo giác', N'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng', 1, N'active', N'18+', GETDATE(), 12),

-- Chương trình Psilocybin
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'An toàn và Tác dụng Psilocybin', N'Thông tin về nấm ma thuật, tác dụng và cân nhắc an toàn', 1, N'active', N'18+', GETDATE(), 13),

-- Chương trình Kỳ thị
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giảm Kỳ thị Nghiện', N'Giải quyết kỳ thị, thúc đẩy hiểu biết và giảm phân biệt đối xử', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 14),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Ngôn ngữ trong Nghiện', N'Sử dụng ngôn ngữ lấy người làm trung tâm và giảm thuật ngữ kỳ thị', 1, N'active', N'16+', GETDATE(), 14),

-- Chương trình Dịch vụ Kim tiêm
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Tổng quan Chương trình Dịch vụ Kim tiêm', N'Hiểu về chương trình trao đổi kim tiêm và dịch vụ giảm tác hại', 1, N'active', N'18+', GETDATE(), 15),

-- Chương trình Thuốc lá/Vaping
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chương trình Cai thuốc lá', N'Hỗ trợ cai thuốc toàn diện và liệu pháp thay thế nicotine', 1, N'active', N'16+', GETDATE(), 16),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Rủi ro Vaping và Thuốc lá điện tử', N'Hiểu về rủi ro sức khỏe của vaping và sử dụng thuốc lá điện tử', 1, N'active', N'13+', GETDATE(), 16),

-- Chương trình Điều trị
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Điều trị Nghiện Toàn diện', N'Tổng quan về lựa chọn điều trị, chương trình phục hồi và dịch vụ hỗ trợ', 1, N'active', N'18+', GETDATE(), 17),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Dịch vụ Hỗ trợ Phục hồi', N'Hỗ trợ đồng đẳng, tư vấn và duy trì phục hồi dài hạn', 1, N'active', N'18+', GETDATE(), 17),

-- Chương trình Sự kiện Cộng đồng
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Hội chợ Phòng ngừa Cộng đồng', N'Sự kiện cộng đồng tương tác với các gian hàng giáo dục phòng ngừa, chia sẻ tài nguyên và hoạt động thân thiện với gia đình để xây dựng nhận thức và mạng lưới hỗ trợ', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 18),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Đi bộ Phục hồi & Tập trung Hỗ trợ', N'Sự kiện đi bộ cộng đồng thể hiện tình đoàn kết với những người đang phục hồi, giảm kỳ thị và kết nối gia đình với các nguồn hỗ trợ địa phương', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 18);

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
(N'Đánh giá hoàn tất - Chuyển đến tài nguyên phù hợp', 10000000, 'Referral'),
(N'Giáo dục ngắn gọn - Thông tin cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu rối loạn sử dụng chất', 0, 'ASSIST'),
(N'Can thiệp ngắn gọn - Thảo luận tập trung vào bệnh nhân sử dụng khái niệm Phỏng vấn Tạo động lực để nâng cao nhận thức về sử dụng chất và tăng cường động lực thay đổi', 4, 'ASSIST'),
(N'Can thiệp ngắn gọn (đề xuất các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, giới thiệu là quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên sâu', 27, 'ASSIST'),
(N'Rủi ro thấp - Cung cấp thông tin về rủi ro sử dụng chất; khen ngợi và khuyến khích', 0, 'CRAFFT'),
(N'Rủi ro trung bình - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; có thể theo dõi', 1, 'CRAFFT'),
(N'Rủi ro cao - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; theo dõi; có thể giới thiệu tư vấn/điều trị', 2, 'CRAFFT');

-- Insert Assessments
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id) VALUES
(6, N'Sàng lọc Sử dụng Chất', N'{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["sử dụng rượu", "áp lực xã hội"], "recommendations": ["tư vấn", "nhóm hỗ trợ đồng đẳng"]}', '2024-01-15 10:00:00', 2),
(7, N'Đánh giá Tác động Gia đình', N'{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["kỹ năng giao tiếp", "thiết lập ranh giới"], "children_affected": 1}', '2024-01-18 14:00:00', 2),
(8, N'Đánh giá Rủi ro Đại học', N'{"total_score": 5, "risk_level": "low", "protective_factors": ["hỗ trợ gia đình mạnh mẽ", "tham gia học tập"], "risk_factors": ["ảnh hưởng bạn bè"]}', '2024-01-20 09:00:00', 1),
(9, N'Đánh giá Sẵn sàng Chuyên môn', N'{"total_score": 22, "competency_areas": ["nhận diện", "can thiệp", "giới thiệu"], "training_needs": ["phỏng vấn tạo động lực"]}', '2024-01-25 11:00:00', 5);

-- Insert Content
INSERT INTO Content (program_id, title, type, orders, content_file_link, content_type, content_metadata_json) VALUES
-- Chương trình 1: Hiểu biết Khoa học Nghiện (6 nội dung)
(1, N'Khoa học Thần kinh về Nghiện', N'article', 1, N'/content/markdown/addiction-science.md', N'markdown', N'{"author": "TS. Smith", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(1, N'Cách Thuốc Thay đổi Não bộ', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "15:30", "format": "youtube", "instructor": "TS. Johnson"}'),
(1, N'Dopamine và Con đường Phần thưởng', N'article', 3, N'/content/markdown/dopamine-reward.md', N'markdown', N'{"author": "TS. Williams", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(1, N'Di truyền và Nguy cơ Nghiền', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "12:45", "format": "youtube", "instructor": "TS. Di truyền"}'),
(1, N'Phục hồi Não bộ khi Cai nghiện', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "25:00", "format": "youtube", "host": "Chuyên gia Phục hồi"}'),
(1, N'Cập nhật Nghiên cứu Khoa học Nghiện', N'article', 6, N'/content/markdown/addiction-research.md', N'markdown', N'{"author": "Nhóm Nghiên cứu", "readingTime": "8 phút", "difficulty": "nâng cao"}'),

-- Chương trình 2: Não bộ và Nghiện: Góc nhìn Khoa học (5 nội dung)
(2, N'Giải phẫu Não bộ và Nghiện', N'article', 1, N'/content/markdown/brain-anatomy-addiction.md', N'markdown', N'{"author": "TS. Não bộ", "readingTime": "14 phút", "difficulty": "trung cấp"}'),
(2, N'Chất dẫn truyền Thần kinh và Sử dụng Chất kích thích', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "18:20", "format": "youtube", "instructor": "TS. Thần kinh"}'),
(2, N'Cơ chế Nhờn thuốc và Phụ thuộc', N'article', 3, N'/content/markdown/tolerance-dependence.md', N'markdown', N'{"author": "TS. Cơ chế", "readingTime": "11 phút", "difficulty": "nâng cao"}'),
(2, N'Hình ảnh Não trong Nghiên cứu Nghiện', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "22:15", "format": "youtube", "instructor": "TS. Hình ảnh"}'),
(2, N'Tính mềm dẻo Thần kinh và Phục hồi', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "30:00", "format": "youtube", "host": "Chuyên gia Tính mềm dẻo"}'),

-- Chương trình 3: Giáo dục và Nhận thức về Cần sa (7 nội dung)
(3, N'Cần sa: Sự thật và Ngộ nhận', N'article', 1, N'/content/markdown/cannabis-facts.md', N'markdown', N'{"author": "Chuyên gia Cần sa", "readingTime": "10 phút", "difficulty": "sơ cấp"}'),
(3, N'THC và CBD: Hiểu về Cannabinoid', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "14:30", "format": "youtube", "instructor": "TS. Cannabinoid"}'),
(3, N'Cần sa và Sức khỏe Tâm thần', N'article', 3, N'/content/markdown/cannabis-mental-health.md', N'markdown', N'{"author": "Chuyên gia Sức khỏe Tâm thần", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(3, N'Cần sa Hợp pháp: Điều cần biết', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "16:45", "format": "youtube", "instructor": "Chuyên gia Pháp lý"}'),
(3, N'Cần sa Y tế và Giải trí', N'article', 5, N'/content/markdown/medical-recreational-cannabis.md', N'markdown', N'{"author": "Chuyên gia Cần sa Y tế", "readingTime": "9 phút", "difficulty": "trung cấp"}'),
(3, N'Rối loạn Sử dụng Cần sa', N'podcast', 6, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "28:00", "format": "youtube", "host": "Chuyên gia Nghiện"}'),
(3, N'Lái xe và Cần sa: Mối lo An toàn', N'article', 7, N'/content/markdown/cannabis-driving-safety.md', N'markdown', N'{"author": "Chuyên gia An toàn", "readingTime": "7 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 4: Cần sa và Phát triển Thanh thiếu niên (6 nội dung)
(4, N'Phát triển Não tuổi Teen và Cần sa', N'article', 1, N'/content/markdown/teen-brain.md', N'markdown', N'{"author": "TS. Thanh thiếu niên", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(4, N'Ảnh hưởng Cần sa đến Học tập', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "13:20", "format": "youtube", "instructor": "Chuyên gia Giáo dục"}'),
(4, N'Sử dụng Cần sa sớm: Hậu quả Dài hạn', N'article', 3, N'/content/markdown/early-cannabis-effects.md', N'markdown', N'{"author": "Chuyên gia Phát triển", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(4, N'Cách Nói chuyện với Teen về Cần sa', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "15:45", "format": "youtube", "instructor": "Chuyên gia Giáo dục Gia đình"}'),
(4, N'Phòng chống Cần sa trong Trường học', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "32:00", "format": "youtube", "host": "Tư vấn viên Trường học"}'),
(4, N'Lựa chọn Điều trị Cần sa cho Thanh thiếu niên', N'article', 6, N'/content/markdown/youth-cannabis-treatment.md', N'markdown', N'{"author": "Chuyên gia Điều trị Thanh thiếu niên", "readingTime": "13 phút", "difficulty": "nâng cao"}'),

-- Chương trình 5: Cảnh báo Chất Hướng thần Mới (5 nội dung)
(5, N'Chất Hướng thần Mới là gì?', N'article', 1, N'/content/markdown/synthetic-drugs.md', N'markdown', N'{"author": "Chuyên gia Cảnh báo Ma túy", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),
(5, N'Nhận biết Thuốc Tổng hợp', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "17:30", "format": "youtube", "instructor": "Chuyên gia Giám định"}'),
(5, N'Rủi ro và Tác dụng Thuốc Thiết kế', N'article', 3, N'/content/markdown/bath-salts-synthetics.md', N'markdown', N'{"author": "Chuyên gia Đánh giá Rủi ro", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(5, N'Thị trường Ma túy Trực tuyến và An toàn', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "19:15", "format": "youtube", "instructor": "Chuyên gia An ninh Mạng"}'),
(5, N'Báo cáo Xu hướng Ma túy Mới', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "35:00", "format": "youtube", "host": "Nhà Phân tích Xu hướng"}'),

-- Chương trình 6: Chương trình Nhận thức Thuốc Tổng hợp (6 nội dung)
(6, N'Nhận biết Thuốc Tổng hợp', N'article', 1, N'/content/markdown/thuoc-tong-hop.md', N'markdown', N'{"author": "Chuyên gia Thuốc Tổng hợp", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(6, N'K2/Spice: Cần sa Tổng hợp', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "16:30", "format": "youtube", "instructor": "Chuyên gia An toàn Ma túy"}'),
(6, N'Bath Salts và Chất Kích thích Tổng hợp', N'article', 3, N'/content/markdown/bath-salts.md', N'markdown', N'{"author": "Chuyên gia Chất Kích thích", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(6, N'Phương pháp Kiểm tra và Phát hiện', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "14:45", "format": "youtube", "instructor": "Chuyên gia Xét nghiệm"}'),
(6, N'Xử lý Khẩn cấp Quá liều Tổng hợp', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "28:00", "format": "youtube", "host": "Nhân viên Cấp cứu"}'),
(6, N'Chiến lược Phòng ngừa Thuốc Tổng hợp', N'article', 6, N'/content/markdown/synthetic-prevention.md', N'markdown', N'{"author": "Chuyên gia Phòng ngừa", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 7: Ứng phó Khủng hoảng Fentanyl (7 nội dung)
(7, N'Hiểu về Fentanyl và Nguy cơ', N'article', 1, N'/content/markdown/fentanyl-dangers.md', N'markdown', N'{"author": "Chuyên gia Fentanyl", "readingTime": "11 phút", "difficulty": "sơ cấp"}'),
(7, N'Que thử Fentanyl: Cách sử dụng', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "8:30", "format": "youtube", "instructor": "Chuyên gia Giảm hại"}'),
(7, N'Đào tạo Sử dụng Naloxone', N'video', 3, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "12:15", "format": "youtube", "instructor": "Huấn luyện viên Cấp cứu"}'),
(7, N'Fentanyl trong Nguồn cung Ma túy', N'article', 4, N'/content/markdown/fentanyl-drug-supply.md', N'markdown', N'{"author": "Chuyên gia Nguồn cung Ma túy", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(7, N'Hỗ trợ Gia đình Bị ảnh hưởng Fentanyl', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "35:00", "format": "youtube", "host": "Tư vấn viên Gia đình"}'),
(7, N'Ứng phó Cộng đồng với Khủng hoảng Fentanyl', N'video', 6, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "20:45", "format": "youtube", "instructor": "Lãnh đạo Cộng đồng"}'),
(7, N'Phòng ngừa Fentanyl trong Trường học', N'article', 7, N'/content/markdown/fentanyl-school-prevention.md', N'markdown', N'{"author": "Chuyên gia An toàn Trường học", "readingTime": "13 phút", "difficulty": "trung cấp"}'),

-- Chương trình 8: Phòng ngừa và Ứng phó Quá liều (5 nội dung)
(8, N'Nhận biết Dấu hiệu Quá liều', N'article', 1, N'/content/markdown/overdose-signs.md', N'markdown', N'{"author": "Chuyên gia Phòng ngừa Quá liều", "readingTime": "8 phút", "difficulty": "sơ cấp"}'),
(8, N'Các bước Ứng phó Khẩn cấp', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "10:30", "format": "youtube", "instructor": "Đội Ứng phó Khẩn cấp"}'),
(8, N'Naloxone: Thuốc Cứu mạng', N'video', 3, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "15:20", "format": "youtube", "instructor": "Nhân viên Y tế"}'),
(8, N'Chăm sóc và Hỗ trợ Sau quá liều', N'article', 4, N'/content/markdown/post-overdose-care.md', N'markdown', N'{"author": "Chuyên gia Phục hồi", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(8, N'Xây dựng Mạng lưới Ứng phó Quá liều', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "30:00", "format": "youtube", "host": "Điều phối viên Mạng lưới"}'),

-- Chương trình 9: Chiến lược Giảm hại (6 nội dung)
(9, N'Giới thiệu về Giảm hại', N'article', 1, N'/content/markdown/harm-reduction-intro.md', N'markdown', N'{"author": "Chuyên gia Giảm hại", "readingTime": "9 phút", "difficulty": "sơ cấp"}'),
(9, N'Thực hành Sử dụng An toàn', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "18:45", "format": "youtube", "instructor": "Giáo viên Sử dụng An toàn"}'),
(9, N'Chương trình Trao đổi Bơm kim tiêm', N'article', 3, N'/content/markdown/needle-exchange.md', N'markdown', N'{"author": "Điều phối viên Trao đổi Bơm kim", "readingTime": "11 phút", "difficulty": "trung cấp"}'),
(9, N'Lưu trữ và Tiêu hủy An toàn', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "13:30", "format": "youtube", "instructor": "Điều phối viên An toàn"}'),
(9, N'Giảm hại trong Cộng đồng', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "40:00", "format": "youtube", "host": "Tổ chức Cộng đồng"}'),
(9, N'Giảm hại dựa trên Bằng chứng', N'article', 6, N'/content/markdown/evidence-based-harm-reduction.md', N'markdown', N'{"author": "Nhà nghiên cứu Khoa học", "readingTime": "14 phút", "difficulty": "nâng cao"}'),

-- Chương trình 10: Giáo dục Sử dụng An toàn hơn (5 nội dung)
(10, N'Đánh giá và Giảm thiểu Rủi ro', N'article', 1, N'/content/markdown/risk-assessment.md', N'markdown', N'{"author": "Chuyên gia Đánh giá Rủi ro", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(10, N'Kiểm tra Thuốc và Chất pha trộn', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "16:20", "format": "youtube", "instructor": "Chuyên gia Kiểm tra"}'),
(10, N'Thực hành Tiêm chích An toàn', N'video', 3, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "14:45", "format": "youtube", "instructor": "Chuyên gia Tiêm an toàn"}'),
(10, N'Phòng ngừa Nhiễm trùng và Bệnh tật', N'article', 4, N'/content/markdown/infection-prevention.md', N'markdown', N'{"author": "Chuyên gia Bệnh truyền nhiễm", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(10, N'Khi nào Cần tìm Trợ giúp Y tế', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "25:00", "format": "youtube", "host": "Cố vấn Y tế"}'),

-- Nội dung Chương trình Sự kiện Cộng đồng
-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng (2 nội dung)
(31, N'Lập kế hoạch Hội chợ Phòng ngừa Cộng đồng', N'article', 1, N'/content/markdown//community-prevention-fair.md', N'markdown', N'{"author": "Điều phối viên Sự kiện Cộng đồng", "readingTime": "8 phút", "difficulty": "sơ cấp"}'),
(31, N'Hoạt động Thu hút Mọi lứa tuổi', N'article', 2, N'/content/markdown/prevention-fair-activities.md', N'markdown', N'{"author": "Chuyên gia Thu hút Thanh thiếu niên", "readingTime": "6 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ (2 nội dung)
(31, N'Tổ chức Sự kiện Đi bộ Hỗ trợ Phục hồi', N'article', 1, N'/content/markdown/recovery-walk-guide.md', N'markdown', N'{"author": "Người vận động Phục hồi", "readingTime": "7 phút", "difficulty": "sơ cấp"}'),
(31, N'Xây dựng Mạng lưới Hỗ trợ Cộng đồng', N'article', 2, N'/content/markdown/community-support-networks.md', N'markdown', N'{"author": "Tổ chức Cộng đồng", "readingTime": "9 phút", "difficulty": "sơ cấp"}');
-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES

-- ==================== CHƯƠNG TRÌNH KHOA HỌC NGHIỆN ====================

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá trước
(1, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá hiểu biết hiện tại của mình về cách nghiện ảnh hưởng đến não bộ như thế nào?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 2, "question": "Bạn biết gì về chất dẫn truyền thần kinh và vai trò của chúng trong nghiện?", "options": ["Chưa từng nghe", "Đã nghe nhưng không hiểu", "Hiểu cơ bản", "Hiểu khá", "Hiểu chuyên sâu"], "deleted": false}, {"id": 3, "question": "Bạn quen thuộc thế nào với khái niệm đường dẫn phần thưởng dopamine?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 4, "question": "Bạn tin nghiện chủ yếu là sự lựa chọn hay bệnh lý?", "options": ["Hoàn toàn là lựa chọn", "Chủ yếu là lựa chọn", "Cả hai như nhau", "Chủ yếu là bệnh", "Hoàn toàn là bệnh"], "deleted": false}, {"id": 5, "question": "Bạn tự tin thế nào khi giải thích khoa học về nghiện cho người khác?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 6, "question": "Điều gì hấp dẫn bạn nhất khi học về khoa học nghiện?", "options": ["Cơ chế não bộ", "Ứng dụng điều trị", "Chiến lược phòng ngừa", "Phương pháp nghiên cứu", "Hiểu biết cá nhân", "Tất cả khía cạnh"], "deleted": false}]}'),

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá sau  
(1, 'post-assessment', N'{"questions": [{"id": 1, "question": "Sau khi hoàn thành chương trình, bạn hiểu thế nào về cách nghiện thay đổi cấu trúc và chức năng não?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào khi giải thích vai trò chất dẫn truyền thần kinh trong nghiện?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Khía cạnh nào của khoa học nghiện bạn thấy sáng tỏ nhất?", "options": ["Đường dẫn phần thưởng dopamine", "Tính mềm dẻo và phục hồi não", "Yếu tố di truyền", "Ảnh hưởng môi trường", "Cơ chế điều trị", "Tất cả đều quan trọng"], "deleted": false}, {"id": 4, "question": "Chương trình đã thay đổi nhận thức của bạn về nghiện như bệnh lý thế nào?", "options": ["Hiểu biết tăng đáng kể", "Hiểu biết tăng vừa phải", "Hiểu biết tăng nhẹ", "Không thay đổi", "Giảm hiểu biết"], "deleted": false}, {"id": 5, "question": "Khả năng bạn chia sẻ kiến thức khoa học nghiện với người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình khoa học nghiện này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Bạn cảm thấy chuẩn bị thế nào để nhận biết dấu hiệu nghiện ở bản thân/người khác?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- Chương trình 2: Não bộ và Nghiện - Đánh giá trước
(2, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với giải phẫu não liên quan đến nghiện?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 2, "question": "Bạn biết gì về hệ thống phần thưởng của não?", "options": ["Không biết gì", "Rất ít", "Khái niệm cơ bản", "Hiểu khá", "Hiểu toàn diện"], "deleted": false}, {"id": 3, "question": "Bạn hiểu thế nào về cơ chế dung nạp và phụ thuộc?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 4, "question": "Bạn quen thuộc với kỹ thuật chụp não trong nghiên cứu nghiện?", "options": ["Chưa từng nghe", "Đã nghe nhưng không hiểu", "Nhận thức cơ bản", "Hiểu khá", "Rất am hiểu"], "deleted": false}, {"id": 5, "question": "Điều gì hấp dẫn bạn nhất về khoa học não và nghiện?", "options": ["Cách nghiện phát triển", "Quá trình phục hồi não", "Khác biệt cá nhân", "Ứng dụng điều trị", "Phương pháp nghiên cứu", "Tất cả khía cạnh"], "deleted": false}, {"id": 6, "question": "Bạn tự tin thế nào về khái niệm tính mềm dẻo thần kinh?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}]}'),

-- Chương trình 2: Não bộ và Nghiện - Đánh giá sau
(2, 'post-assessment', N'{"questions": [{"id": 1, "question": "Bây giờ bạn hiểu thế nào về giải phẫu não liên quan đến nghiện?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 2, "question": "Sau chương trình, bạn tự tin thế nào khi giải thích hệ thống phần thưởng của não?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Khái niệm khoa học não nào có giá trị nhất để học?", "options": ["Chức năng chất dẫn truyền", "Cơ chế dung nạp", "Kết quả chụp não", "Tính mềm dẻo và phục hồi", "Khác biệt não cá nhân", "Tất cả đều giá trị"], "deleted": false}, {"id": 4, "question": "Việc học khoa học não đã thay đổi hiểu biết của bạn về phục hồi nghiện thế nào?", "options": ["Hiểu biết cải thiện đáng kể", "Hiểu biết cải thiện vừa phải", "Hiểu biết cải thiện nhẹ", "Không thay đổi", "Làm tôi bối rối hơn"], "deleted": false}, {"id": 5, "question": "Khả năng bạn tiếp tục học về khoa học thần kinh và nghiện?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình khoa học não này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Bạn có thể giải thích tính mềm dẻo thần kinh cho người khác thế nào?", "options": ["Không thể giải thích", "Giải thích cơ bản", "Giải thích vừa phải", "Giải thích tốt", "Giải thích chuyên sâu"], "deleted": false}]}'),

-- ==================== CHƯƠNG TRÌNH GIÁO DỤC CẦN SA ====================

-- Chương trình 3: Giáo dục và Nhận thức Cần sa - Đánh giá trước
(3, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức hiện tại về cần sa và tác dụng?", "options": ["Rất hạn chế", "Hạn chế", "Trung bình", "Tốt", "Sâu rộng"], "deleted": false}, {"id": 2, "question": "Bạn biết gì về sự khác biệt giữa THC và CBD?", "options": ["Không biết gì", "Rất ít", "Khác biệt cơ bản", "Hiểu khá", "Hiểu toàn diện"], "deleted": false}, {"id": 3, "question": "Bạn quen thuộc thế nào với luật cần sa ở khu vực?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 4, "question": "Điều gì bạn lo ngại nhất về sử dụng cần sa?", "options": ["Ảnh hưởng sức khỏe", "Vấn đề pháp lý", "Tác động sức khỏe tâm thần", "Khả năng nghiện", "Hậu quả xã hội", "Không lo ngại"], "deleted": false}, {"id": 5, "question": "Bạn tự tin thế nào khi thảo luận chủ đề cần sa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 6, "question": "Động lực nào thúc đẩy bạn học về giáo dục cần sa?", "options": ["Quan tâm cá nhân", "Lo ngại gia đình", "Phát triển nghề nghiệp", "Tình huống áp lực bạn bè", "Nhận thức sức khỏe", "Tất cả trên"], "deleted": false}]}'),

-- Chương trình 3: Giáo dục và Nhận thức Cần sa - Đánh giá sau
(3, 'post-assessment', N'{"questions": [{"id": 1, "question": "Sau khi hoàn thành, bạn đánh giá kiến thức cần sa của mình?", "options": ["Rất hạn chế", "Hạn chế", "Trung bình", "Tốt", "Sâu rộng"], "deleted": false}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào khi giải thích khác biệt THC vs CBD?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Khía cạnh nào của giáo dục cần sa có giá trị nhất?", "options": ["Sử dụng y tế vs giải trí", "Xem xét pháp lý", "Rủi ro và lợi ích sức khỏe", "Sự thật và ngộ nhận", "Tác động sức khỏe tâm thần", "Tất cả đều giá trị"], "deleted": false}, {"id": 4, "question": "Chương trình đã ảnh hưởng thế nào đến quan điểm của bạn về sử dụng cần sa?", "options": ["Thay đổi đáng kể quan điểm", "Thay đổi vừa phải quan điểm", "Thay đổi nhẹ quan điểm", "Củng cố quan điểm hiện có", "Không thay đổi"], "deleted": false}, {"id": 5, "question": "Bạn cảm thấy chuẩn bị thế nào để ra quyết định sáng suốt về cần sa?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình giáo dục cần sa này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Khả năng bạn chia sẻ sự thật về cần sa để bác bỏ ngộ nhận?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}]}'),

-- ==================== CHƯƠNG TRÌNH SỰ KIỆN CỘNG ĐỒNG ====================

-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng - Đánh giá trước
(25, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với việc tổ chức sự kiện phòng ngừa cộng đồng?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 2, "question": "Bạn có kinh nghiệm gì với hoạt động thu hút cộng đồng?", "options": ["Không kinh nghiệm", "Rất ít kinh nghiệm", "Một số kinh nghiệm", "Kinh nghiệm tốt", "Kinh nghiệm sâu rộng"], "deleted": false}, {"id": 3, "question": "Bạn tự tin thế nào về lập kế hoạch hoạt động hội chợ phòng ngừa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 4, "question": "Thách thức nào bạn dự đoán khi tổ chức hội chợ phòng ngừa?", "options": ["Thu hút cộng đồng", "Phối hợp nguồn lực", "Lập kế hoạch hoạt động", "Quản lý tình nguyện viên", "Hậu cần và chuẩn bị", "Tất cả trên"], "deleted": false}, {"id": 5, "question": "Bạn mong học gì về lập kế hoạch hội chợ phòng ngừa?", "options": ["Hậu cần sự kiện", "Thiết kế hoạt động", "Tiếp cận cộng đồng", "Quản lý nguồn lực", "Đo lường tác động", "Tất cả khía cạnh"], "deleted": false}, {"id": 6, "question": "Bạn đánh giá tầm quan trọng của hội chợ phòng ngừa với sức khỏe cộng đồng?", "options": ["Không quan trọng", "Hơi quan trọng", "Quan trọng vừa phải", "Rất quan trọng", "Cực kỳ quan trọng"], "deleted": false}]}'),

-- Chương trình 25: Hội chợ Phòng ngừa Cộng đồng - Đánh giá sau
(25, 'post-assessment', N'{"questions": [{"id": 1, "question": "Sau chương trình, bạn tự tin thế nào về tổ chức hội chợ phòng ngừa?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 2, "question": "Khía cạnh nào của lập kế hoạch hội chợ có giá trị nhất?", "options": ["Thiết kế hoạt động cho mọi lứa tuổi", "Chiến lược tiếp cận cộng đồng", "Phối hợp nguồn lực", "Quản lý tình nguyện viên", "Đo lường tác động", "Tất cả đều giá trị"], "deleted": false}, {"id": 3, "question": "Khả năng bạn tổ chức hoặc giúp hội chợ phòng ngừa trong cộng đồng?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 4, "question": "Thành phần nào của hội chợ phòng ngừa có tác động nhất?", "options": ["Gian hàng giáo dục", "Hoạt động tương tác", "Phân phối tài nguyên", "Kết nối cộng đồng", "Thu hút gia đình", "Tất cả thành phần cùng nhau"], "deleted": false}, {"id": 5, "question": "Chương trình đã thay đổi hiểu biết của bạn về công tác phòng ngừa cộng đồng?", "options": ["Hiểu biết tăng đáng kể", "Hiểu biết tăng vừa phải", "Hiểu biết tăng nhẹ", "Không thay đổi", "Giảm hiểu biết"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình lập kế hoạch hội chợ này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Bạn chuẩn bị thế nào để thu hút thành viên cộng đồng đa dạng vào hoạt động phòng ngừa?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ - Đánh giá trước
(26, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn quen thuộc thế nào với sự kiện hỗ trợ phục hồi và mục đích?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 2, "question": "Bạn có kinh nghiệm gì với sự kiện sức khỏe cộng đồng?", "options": ["Không kinh nghiệm", "Rất ít kinh nghiệm", "Một số kinh nghiệm", "Kinh nghiệm tốt", "Kinh nghiệm sâu rộng"], "deleted": false}, {"id": 3, "question": "Bạn thoải mái thế nào khi thảo luận chủ đề phục hồi và sức khỏe tâm thần?", "options": ["Rất không thoải mái", "Không thoải mái", "Trung lập", "Thoải mái", "Rất thoải mái"], "deleted": false}, {"id": 4, "question": "Bạn mong đạt gì từ việc học về đi bộ phục hồi?", "options": ["Kỹ năng lập kế hoạch sự kiện", "Hiểu hỗ trợ phục hồi", "Kiến thức xây dựng cộng đồng", "Chiến lược giảm kỳ thị", "Phát triển cá nhân", "Tất cả trên"], "deleted": false}, {"id": 5, "question": "Bạn đánh giá tầm quan trọng của sự kiện hỗ trợ phục hồi với cộng đồng?", "options": ["Không quan trọng", "Hơi quan trọng", "Quan trọng vừa phải", "Rất quan trọng", "Cực kỳ quan trọng"], "deleted": false}, {"id": 6, "question": "Bạn lo ngại gì về tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Riêng tư và bảo mật", "Chấp nhận cộng đồng", "Yêu cầu nguồn lực", "Xem xét an toàn", "Nhu cầu hỗ trợ tinh thần", "Không lo ngại"], "deleted": false}]}'),

-- Chương trình 26: Đi bộ Phục hồi & Biểu tình Hỗ trợ - Đánh giá sau
(26, 'post-assessment', N'{"questions": [{"id": 1, "question": "Sau chương trình, bạn tự tin thế nào về tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 2, "question": "Khía cạnh nào của lập kế hoạch đi bộ phục hồi sáng tỏ nhất?", "options": ["Tạo môi trường bao trùm", "Quản lý an toàn tinh thần", "Xây dựng quan hệ đối tác", "Tôn vinh hành trình phục hồi", "Giảm kỳ thị", "Tất cả đều quan trọng"], "deleted": false}, {"id": 3, "question": "Khả năng bạn tham gia hoặc tổ chức sự kiện hỗ trợ phục hồi?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 4, "question": "Bạn nghĩ đi bộ phục hồi tác động thế nào đến thái độ cộng đồng?", "options": ["Không tác động", "Tác động tối thiểu", "Tác động vừa phải", "Tác động đáng kể", "Tác động chuyển đổi"], "deleted": false}, {"id": 5, "question": "Chương trình đã ảnh hưởng thế nào đến hiểu biết của bạn về phục hồi và hỗ trợ?", "options": ["Hiểu biết sâu sắc hơn đáng kể", "Hiểu biết sâu sắc hơn vừa phải", "Hiểu biết sâu sắc hơn nhẹ", "Không thay đổi", "Làm tôi bối rối hơn"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình hỗ trợ phục hồi này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Bạn chuẩn bị thế nào để tạo môi trường hỗ trợ người phục hồi?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- ==================== CHƯƠNG TRÌNH PHÒNG NGỪA CHUNG ====================

-- Khảo sát Đánh giá trước cho Tất cả Chương trình Phòng ngừa
(NULL, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức tổng thể về phòng ngừa lạm dụng chất?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"], "deleted": false}, {"id": 2, "question": "Bạn tự tin thế nào về khả năng quyết định lành mạnh liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Động lực nào thúc đẩy bạn tham gia chương trình giáo dục phòng ngừa?", "options": ["Quan tâm cá nhân", "Lo ngại gia đình", "Phát triển nghề nghiệp", "Tham gia cộng đồng", "Nhận thức sức khỏe", "Tất cả trên"], "deleted": false}, {"id": 4, "question": "Bạn thường tìm kiếm thông tin về chủ đề sức khỏe?", "options": ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Thường xuyên", "Luôn luôn"], "deleted": false}, {"id": 5, "question": "Nguồn hỗ trợ chính cho quyết định lành mạnh của bạn?", "options": ["Gia đình", "Bạn bè", "Nhà cung cấp y tế", "Chương trình cộng đồng", "Tài nguyên trực tuyến", "Nhiều nguồn"], "deleted": false}, {"id": 6, "question": "Bạn chuẩn bị thế nào để giúp người khác ra quyết định sáng suốt về chất kích thích?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- Khảo sát Đánh giá sau cho Tất cả Chương trình Phòng ngừa  
(NULL, 'post-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức về phòng ngừa lạm dụng chất sau khi hoàn thành?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"], "deleted": false}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào về quyết định sáng suốt liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Thành phần chương trình nào có lợi nhất cho việc học của bạn?", "options": ["Tài liệu giáo dục", "Hoạt động tương tác", "Bài tập thực hành", "Thảo luận nhóm", "Thông tin tài nguyên", "Tất cả thành phần"], "deleted": false}, {"id": 4, "question": "Khả năng bạn áp dụng kiến thức từ chương trình này?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 5, "question": "Hiểu biết của bạn về tài nguyên phòng ngừa và hỗ trợ đã thay đổi?", "options": ["Cải thiện đáng kể", "Cải thiện vừa phải", "Cải thiện nhẹ", "Không thay đổi", "Giảm sút"], "deleted": false}, {"id": 6, "question": "Bây giờ bạn chuẩn bị thế nào để hỗ trợ người khác ra quyết định lành mạnh?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}, {"id": 7, "question": "Đánh giá hiệu quả tổng thể chương trình phòng ngừa này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 8, "question": "Khả năng bạn giới thiệu chương trình này cho người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}]}');
-- Insert Survey Responses

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, N'Hiểu về Khoa học Nghiện', N'Nghiện là một bệnh lý phức tạp ảnh hưởng đến hệ thống khen thưởng, động lực và trí nhớ của não bộ. Trong bài viết này, chúng ta khám phá những thay đổi sinh học thần kinh xảy ra khi sử dụng chất gây nghiện và cách hiểu biết về những thay đổi này có thể giảm kỳ thị và cải thiện kết quả điều trị...', '2024-01-10 09:00:00', N'Đã xuất bản', N'/uploads/blog-images/science-addiction.jpg'),

(3, N'5 Cách Hỗ trợ Người thân Đang Phục hồi', N'Hỗ trợ người đang phục hồi có thể đầy thách thức nhưng cũng vô cùng ý nghĩa. Dưới đây là 5 chiến lược dựa trên bằng chứng mà thành viên gia đình và bạn bè có thể áp dụng để hỗ trợ hiệu quả: 1. Tìm hiểu kiến thức về nghiện, 2. Thiết lập ranh giới lành mạnh...', '2024-01-12 14:00:00', N'Đã xuất bản', N'/uploads/blog-images/support-recovery.jpg'),

(4, N'Chiến lược Phòng ngừa Thực sự Hiệu quả', N'Nghiên cứu cho thấy các chương trình phòng ngừa hiệu quả có chung nhiều đặc điểm quan trọng. Bài viết này phân tích các chiến lược phòng ngừa dựa trên bằng chứng và cách triển khai trong trường học, cộng đồng và gia đình...', '2024-01-15 11:00:00', N'Đã xuất bản', N'/uploads/blog-images/prevention-strategies.jpg'),

(1, N'Nghiên cứu Mới về Phát triển Não Tuổi teen và Sử dụng Chất kích thích', N'Nghiên cứu thần kinh học gần đây tiết lộ những hiểu biết quan trọng về sự phát triển não bộ tuổi vị thành niên và tính dễ tổn thương với chất kích thích. Hiểu các yếu tố phát triển này là rất quan trọng để thiết kế chương trình phòng ngừa hiệu quả...', '2024-01-18 16:00:00', N'Bản nháp', N'/uploads/blog-images/teen-brain.jpg');
-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, N'Nội dung chứa thông tin y tế cần được chuyên gia xem xét trước khi xuất bản', '2024-01-19 10:00:00');