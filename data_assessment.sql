

-- ASSIST Assessment Questions and Answers (insert question, then its answers)

-- 1
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất nào sau đây? (Có thể chọn nhiều đáp án)', N'multi-select', NULL, N'ASSIST', 1, 1);
DECLARE @q1 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, option_id, text, score, answer_order) VALUES
(@q1, 1, N'Cần sa (marijuana, pot, cỏ, hash, v.v.)', 3, 1),
(@q1, 2, N'Cocaine (coke, crack, v.v.)', 3, 2),
(@q1, 3, N'Thuốc kích thích kê đơn (Adderall, Ritalin, thuốc ăn kiêng, v.v.) dùng sai mục đích', 3, 3),
(@q1, 4, N'Methamphetamine (meth, đá, ecstasy, molly, v.v.)', 3, 4),
(@q1, 5, N'Chất hít (keo, sơn, khí cười, poppers, v.v.)', 3, 5),
(@q1, 6, N'Thuốc an thần (Xanax, Valium, thuốc ngủ, benzodiazepine v.v.) dùng sai mục đích', 3, 6),
(@q1, 7, N'Ảo giác (LSD, nấm thần, PCP, ketamine, v.v.)', 3, 7),
(@q1, 8, N'Opioids đường phố (heroin, thuốc phiện)', 3, 8),
(@q1, 9, N'Opioids kê đơn (Oxycodone, Vicodin, Fentanyl, Methadone, v.v.) dùng sai mục đích', 3, 9),
(@q1, 10, N'Chất khác để tạo cảm giác ''phê''', 3, 10),
(@q1, 11, N'Tôi chưa từng sử dụng bất kỳ chất nào', 0, 11);

-- 2
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong 3 tháng qua, bạn đã sử dụng [chất] bao nhiêu lần?', N'MCQs', N'Dùng để đo tần suất sử dụng gần đây. [chất] sẽ thay bằng loại chất bạn chọn ở câu hỏi 1.', N'ASSIST', 0, 0);
DECLARE @q2 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, option_id, text, score, answer_order) VALUES
(@q2, 1, N'Không bao giờ', 0, 1),
(@q2, 2, N'Một hoặc hai lần', 2, 2),
(@q2, 3, N'Hàng tháng', 3, 3),
(@q2, 4, N'Hàng tuần', 4, 4),
(@q2, 5, N'Gần như hàng ngày hoặc hàng ngày', 6, 5);

