-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
INSERT INTO Users (role, password, status, email, img_link) VALUES
('admin', 'hashed_password_123', 'active', 'admin@drugprevention.com', '/uploads/profile-pictures/default-admin.png'),
('consultant', 'hashed_password_456', 'active', 'dr.smith@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_789', 'active', 'therapist.johnson@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_321', 'active', 'counselor.williams@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_654', 'inactive', 'dr.brown@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('member', 'hashed_password_987', 'active', 'john.doe@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_147', 'active', 'jane.smith@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_258', 'active', 'mike.wilson@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_369', 'active', 'sarah.davis@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_741', 'banned', 'banned.user@email.com', NULL);

-- Insert Profiles for all users
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, 'Admin User', '{"bio": "System administrator for drug prevention platform"}', '1985-05-15', 'System Administrator'),
(2, 'Dr. Michael Smith', '{"bio": "Licensed addiction psychiatrist with 15 years of experience in substance abuse treatment and prevention", "education": "MD from Johns Hopkins, Board Certified in Addiction Medicine"}', '1975-03-20', 'Addiction Psychiatrist'),
(3, 'Sarah Johnson', '{"bio": "Licensed clinical therapist specializing in addiction counseling and family therapy", "education": "MS in Clinical Psychology, Licensed Professional Counselor"}', '1982-08-12', 'Clinical Therapist'),
(4, 'Robert Williams', '{"bio": "Certified substance abuse counselor with expertise in youth prevention programs", "education": "MS in Addiction Counseling, CADC Certified"}', '1978-11-05', 'Substance Abuse Counselor'),
(5, 'Dr. Emily Brown', '{"bio": "Clinical psychologist specializing in behavioral interventions for addiction", "education": "PhD in Clinical Psychology"}', '1980-01-30', 'Clinical Psychologist'),
(6, 'John Doe', '{"bio": "Seeking support for addiction recovery", "interests": ["fitness", "reading"]}', '1995-06-10', 'Software Developer'),
(7, 'Jane Smith', '{"bio": "Parent looking for prevention resources for teenager", "interests": ["parenting", "community service"]}', '1978-09-22', 'Teacher'),
(8, 'Mike Wilson', '{"bio": "College student interested in prevention education", "interests": ["sports", "music"]}', '2001-12-03', 'Student'),
(9, 'Sarah Davis', '{"bio": "Healthcare worker seeking professional development in addiction prevention", "interests": ["healthcare", "training"]}', '1988-04-17', 'Nurse'),
(10, 'Banned User', '{"bio": "User account banned for violations"}', '1990-07-25', 'Unknown');

-- Insert Consultants
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, 'Board Certified in Addiction Medicine, Licensed Physician', 'Addiction Psychiatry, Medication-Assisted Treatment, Dual Diagnosis'),
(3, 120.00, 'Licensed Professional Counselor, Certified Addiction Counselor', 'Individual and Family Therapy, Cognitive Behavioral Therapy, Trauma-Informed Care'),
(4, 100.00, 'Certified Alcohol and Drug Counselor, Prevention Specialist', 'Youth Prevention Programs, Group Therapy, Community Outreach'),
(5, 130.00, 'Licensed Clinical Psychologist, Addiction Treatment Specialist', 'Behavioral Interventions, Assessment and Evaluation, Treatment Planning');

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
(1, 6, 1, '2024-01-15', 'completed', 'Initial consultation for addiction assessment. Patient showed good engagement.', 'https://meet.google.com/abc-defg-hij'),
(1, 6, 5, '2024-01-22', 'completed', 'Follow-up session. Discussed treatment options and medication considerations.', 'https://meet.google.com/klm-nopq-rst'),
(2, 7, 7, '2024-01-18', 'completed', 'Parent consultation regarding teenage substance use prevention strategies.', 'https://meet.google.com/uvw-xyz-123'),
(3, 8, 6, '2024-01-20', 'scheduled', 'College prevention education session scheduled.', NULL),
(2, 9, 3, '2024-01-25', 'scheduled', 'Professional development consultation for healthcare worker.', NULL),
(1, 6, 2, '2024-01-29', 'scheduled', 'Ongoing treatment planning session.', NULL),
(4, 7, 1, '2024-01-23', 'cancelled', 'Parent cancelled due to scheduling conflict.', NULL),
(3, 8, 9, '2024-01-17', 'completed', 'Group therapy preparation session completed successfully.', 'https://meet.google.com/456-789-012');

-- Insert Categories
INSERT INTO Category (description) VALUES
('Article'),
('Video'),
('Podcast');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
('https://example.com/img1.jpg', 'Mental Health Basics', 'Introduction to mental health concepts and understanding psychological wellbeing', 1, 'active', '18-25', GETDATE(), 1),
('https://example.com/img2.jpg', 'Stress Management', 'Learn how to manage stress effectively through proven techniques and strategies', 1, 'active', '18-25', GETDATE(), 2),
('https://example.com/img3.jpg', 'Mindfulness Meditation', 'Guided meditation sessions for inner peace and mental clarity', 1, 'active', '18-25', GETDATE(), 3),
('https://example.com/img4.jpg', 'Addiction Recovery Fundamentals', 'Comprehensive guide to understanding and overcoming addiction', 1, 'active', '18+', GETDATE(), 1),
('https://example.com/img5.jpg', 'Youth Prevention Program', 'Evidence-based prevention strategies for teenagers and young adults', 1, 'active', '13-18', GETDATE(), 2),
('https://example.com/img6.jpg', 'Family Support System', 'Building strong family bonds and communication skills', 1, 'active', 'All Ages', GETDATE(), 3),
('https://example.com/img7.jpg', 'Cognitive Behavioral Therapy', 'Learn CBT techniques for managing thoughts and behaviors', 1, 'active', '18+', GETDATE(), 1),
('https://example.com/img8.jpg', 'Workplace Wellness', 'Creating healthy work environments and managing professional stress', 1, 'active', '22-65', GETDATE(), 2),
('https://example.com/img9.jpg', 'Crisis Intervention Training', 'Essential skills for handling mental health emergencies', 1, 'active', '18+', GETDATE(), 3);

-- Insert User Enrollments
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
(6, 2, '2024-01-10 10:00:00', 0.75),
(7, 3, '2024-01-12 14:00:00', 0.40),
(8, 1, '2024-01-08 09:00:00', 0.90),
(8, 3, '2024-01-15 16:00:00', 0.25),
(9, 2, '2024-01-05 11:00:00', 1.0);

-- Insert Actions for Assessments
INSERT INTO Action (description, range, type) VALUES
('Assessment Complete - Refer to Appropriate Resources', 10000000, 'Referral'),
('Brief education - Inform patients about the risks of illicit drug use and signs of a substance use disorder', 0, 'ASSIST'),
('Brief intervention - Patient-centered discussion that employs Motivational Interviewing concepts to raise awareness of substance use and enhance motivation to change. Brief interventions are typically performed in 3-15 minutes, and should be done in the same session as the screening. Repeated sessions are more effective than a one-time intervention.', 4, 'ASSIST'),
('Brief intervention (offer options that include treatment) - If a patient is ready to accept treatment, a referral is a proactive process that facilitates access to specialized care for individuals likely experiencing a substance use disorder. These patients are referred to alcohol and drug treatment experts for more definitive, in-depth assessment and, if warranted, treatment. However, treatment also includes prescribing medications for substance use disorders as part of a patient''s normal primary care.', 27, 'ASSIST'),
('Low Risk - Provide information about risks of substance use and substance use-related riding/driving; offer praise and encouragement. Give Contract for Life or Pledge for Life handouts.', 0, 'CRAFFT'),
('Medium Risk - Provide information about risks of substance use and substance use-related riding/driving; brief advice; possible follow-up visit. Engage in discussion about adverse health effects with clear recommendation to stop.', 1, 'CRAFFT'),
('High Risk - Provide information about risks of substance use and substance use-related riding/driving; brief advice; follow-up visit; possible referral to counseling/treatment. Use 5 Rs framework: Review, Recommend, Riding/Driving risk counseling, Response (elicit self-motivational statements), Reinforce self-efficacy.', 2, 'CRAFFT');

-- Insert Assessments
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id) VALUES
(6, 'Substance Use Screening', '{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["alcohol use", "social pressure"], "recommendations": ["counseling", "peer support group"]}', '2024-01-15 10:00:00', 2),
(7, 'Family Impact Assessment', '{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["communication skills", "boundary setting"], "children_affected": 1}', '2024-01-18 14:00:00', 2),
(8, 'College Risk Assessment', '{"total_score": 5, "risk_level": "low", "protective_factors": ["strong family support", "academic engagement"], "risk_factors": ["peer influence"]}', '2024-01-20 09:00:00', 1),
(9, 'Professional Readiness Evaluation', '{"total_score": 22, "competency_areas": ["identification", "intervention", "referral"], "training_needs": ["motivational interviewing"]}', '2024-01-25 11:00:00', 5);

-- Insert Content
INSERT INTO Content (program_id, title, type, orders, content_file_link, content_type, content_metadata_json) VALUES
-- Program 1: Mental Health Basics (5 content items)
(1, 'Understanding Mental Health', 'article', 1, '/content/markdown/mental-health-intro.md', 'markdown', '{"author": "Dr. Smith", "readingTime": "8 min", "difficulty": "beginner"}'),
(1, 'Common Mental Health Conditions', 'video', 2, 'https://example.com/videos/mental-conditions.mp4', 'video', '{"duration": "12:45", "format": "mp4", "instructor": "Dr. Johnson"}'),
(1, 'Building Emotional Resilience', 'article', 3, '/content/markdown/emotional-resilience.md', 'markdown', '{"author": "Dr. Williams", "readingTime": "10 min", "difficulty": "intermediate"}'),
(1, 'Mental Health Self-Assessment Quiz', 'article', 4, '/content/markdown/self-assessment-quiz.md', 'markdown', '{"author": "Dr. Assessment", "readingTime": "15 min", "questions": 20, "type": "quiz"}'),
(1, 'Daily Mental Wellness Practices', 'podcast', 5, 'https://example.com/podcasts/daily-wellness.mp3', 'audio', '{"duration": "18:30", "format": "mp3", "host": "Sarah Chen"}'),

-- Program 2: Stress Management (5 content items)
(2, 'Understanding Stress and Its Impact', 'article', 1, '/content/markdown/stress-impact.md', 'markdown', '{"author": "Dr. Brown", "readingTime": "7 min", "difficulty": "beginner"}'),
(2, 'Breathing Techniques for Stress Relief', 'video', 2, 'https://example.com/videos/breathing-techniques.mp4', 'video', '{"duration": "10:20", "format": "mp4", "instructor": "Maria Lopez"}'),
(2, 'Progressive Muscle Relaxation', 'video', 3, 'https://example.com/videos/muscle-relaxation.mp4', 'video', '{"duration": "25:15", "format": "mp4", "instructor": "Dr. Taylor"}'),
(2, 'Stress Management Workbook Guide', 'article', 4, '/content/markdown/stress-workbook.md', 'markdown', '{"author": "Stress Coach Emma", "readingTime": "25 min", "exercises": 12, "type": "workbook"}'),
(2, 'Expert Interview: Managing Chronic Stress', 'podcast', 5, 'https://example.com/podcasts/chronic-stress.mp3', 'audio', '{"duration": "45:00", "format": "mp3", "guest": "Dr. Anderson"}'),

-- Program 3: Mindfulness Meditation (5 content items)
(3, 'Introduction to Mindfulness', 'article', 1, '/content/markdown/mindfulness-intro.md', 'markdown', '{"author": "Zen Master Kim", "readingTime": "6 min", "difficulty": "beginner"}'),
(3, 'Basic Breathing Meditation', 'video', 2, 'https://example.com/videos/breathing-meditation.mp4', 'video', '{"duration": "15:00", "format": "mp4", "instructor": "Master Chen"}'),
(3, 'Body Scan Meditation', 'podcast', 3, 'https://example.com/podcasts/body-scan.mp3', 'audio', '{"duration": "20:00", "format": "mp3", "guide": "Lisa Park"}'),
(3, 'Walking Meditation Practice', 'video', 4, 'https://example.com/videos/walking-meditation.mp4', 'video', '{"duration": "18:30", "format": "mp4", "location": "outdoor"}'),
(3, 'Advanced Mindfulness Techniques', 'video', 5, 'https://example.com/videos/advanced-mindfulness.mp4', 'video', '{"duration": "40:00", "format": "mp4", "techniques": 8, "level": "advanced"}'),

-- Program 4: Addiction Recovery Fundamentals (5 content items)
(4, 'Understanding Addiction Science', 'article', 1, '/content/markdown/addiction-science.md', 'markdown', '{"author": "Dr. Martinez", "readingTime": "12 min", "difficulty": "intermediate"}'),
(4, 'The Recovery Process: What to Expect', 'video', 2, 'https://example.com/videos/recovery-process.mp4', 'video', '{"duration": "22:15", "format": "mp4", "expert": "Dr. Wilson"}'),
(4, 'Building a Support Network', 'article', 3, '/content/markdown/support-network.md', 'markdown', '{"author": "Recovery Coach Tom", "readingTime": "9 min", "difficulty": "beginner"}'),
(4, 'Relapse Prevention Strategies Training', 'video', 4, 'https://example.com/videos/relapse-prevention.mp4', 'video', '{"duration": "35:00", "format": "mp4", "strategies": 15, "type": "training"}'),
(4, 'Recovery Stories: Real Experiences', 'podcast', 5, 'https://example.com/podcasts/recovery-stories.mp3', 'audio', '{"duration": "55:00", "format": "mp3", "stories": 3}'),

-- Program 5: Youth Prevention Program (5 content items)
(5, 'Teen Brain Development and Risk', 'article', 1, '/content/markdown/teen-brain.md', 'markdown', '{"author": "Dr. Youth", "readingTime": "8 min", "ageGroup": "13-18"}'),
(5, 'Peer Pressure: How to Say No', 'video', 2, 'https://example.com/videos/peer-pressure.mp4', 'video', '{"duration": "14:20", "format": "mp4", "scenarios": 5}'),
(5, 'Healthy Coping Mechanisms for Teens', 'article', 3, '/content/markdown/teen-coping.md', 'markdown', '{"author": "Teen Counselor Alex", "readingTime": "7 min", "tips": 10}'),
(5, 'Decision-Making Scenarios Workshop', 'video', 4, 'https://example.com/videos/decision-scenarios.mp4', 'video', '{"duration": "25:00", "format": "mp4", "scenarios": 12, "type": "workshop"}'),
(5, 'Parent-Teen Communication Tips', 'podcast', 5, 'https://example.com/podcasts/parent-teen.mp3', 'audio', '{"duration": "30:00", "format": "mp3", "tips": 8}'),

-- Program 6: Family Support System (5 content items)
(6, 'Understanding Family Dynamics', 'article', 1, '/content/markdown/family-dynamics.md', 'markdown', '{"author": "Family Therapist Jane", "readingTime": "10 min", "focus": "communication"}'),
(6, 'Effective Communication Techniques', 'video', 2, 'https://example.com/videos/family-communication.mp4', 'video', '{"duration": "18:45", "format": "mp4", "techniques": 6}'),
(6, 'Setting Healthy Boundaries', 'article', 3, '/content/markdown/healthy-boundaries.md', 'markdown', '{"author": "Dr. Boundaries", "readingTime": "9 min", "examples": 5}'),
(6, 'Family Meeting Facilitation Guide', 'article', 4, '/content/markdown/family-meetings.md', 'markdown', '{"author": "Family Guide Pro", "readingTime": "20 min", "steps": 8, "type": "guide"}'),
(6, 'Healing Family Relationships', 'podcast', 5, 'https://example.com/podcasts/family-healing.mp3', 'audio', '{"duration": "40:00", "format": "mp3", "cases": 4}'),

-- Program 7: Cognitive Behavioral Therapy (5 content items)
(7, 'CBT Fundamentals and Principles', 'article', 1, '/content/markdown/cbt-fundamentals.md', 'markdown', '{"author": "Dr. CBT Expert", "readingTime": "11 min", "principles": 6}'),
(7, 'Identifying Thought Patterns', 'video', 2, 'https://example.com/videos/thought-patterns.mp4', 'video', '{"duration": "16:30", "format": "mp4", "exercises": 4}'),
(7, 'Challenging Negative Thoughts Workshop', 'video', 3, 'https://example.com/videos/thought-challenging.mp4', 'video', '{"duration": "28:00", "format": "mp4", "worksheets": 6, "type": "workshop"}'),
(7, 'Behavioral Activation Techniques', 'video', 4, 'https://example.com/videos/behavioral-activation.mp4', 'video', '{"duration": "20:15", "format": "mp4", "activities": 8}'),
(7, 'CBT Success Stories and Case Studies', 'podcast', 5, 'https://example.com/podcasts/cbt-success.mp3', 'audio', '{"duration": "35:00", "format": "mp3", "cases": 5}'),

-- Program 8: Workplace Wellness (5 content items)
(8, 'Creating a Healthy Work Environment', 'article', 1, '/content/markdown/workplace-health.md', 'markdown', '{"author": "HR Specialist Lisa", "readingTime": "9 min", "strategies": 7}'),
(8, 'Managing Work-Related Stress', 'video', 2, 'https://example.com/videos/work-stress.mp4', 'video', '{"duration": "19:20", "format": "mp4", "techniques": 5}'),
(8, 'Work-Life Balance Strategies', 'article', 3, '/content/markdown/work-life-balance.md', 'markdown', '{"author": "Balance Coach Mike", "readingTime": "8 min", "tips": 12}'),
(8, 'Workplace Wellness Assessment Guide', 'article', 4, '/content/markdown/wellness-assessment.md', 'markdown', '{"author": "Wellness Expert Kate", "readingTime": "15 min", "questions": 25, "type": "assessment"}'),
(8, 'Building Resilient Teams', 'podcast', 5, 'https://example.com/podcasts/resilient-teams.mp3', 'audio', '{"duration": "42:00", "format": "mp3", "strategies": 10}'),

-- Program 9: Crisis Intervention Training (5 content items)
(9, 'Recognizing Mental Health Crises', 'article', 1, '/content/markdown/crisis-recognition.md', 'markdown', '{"author": "Crisis Expert Dr. Red", "readingTime": "10 min", "signs": 15}'),
(9, 'De-escalation Techniques', 'video', 2, 'https://example.com/videos/de-escalation.mp4', 'video', '{"duration": "24:30", "format": "mp4", "scenarios": 6}'),
(9, 'Safety Planning and Risk Assessment Training', 'video', 3, 'https://example.com/videos/safety-planning.mp4', 'video', '{"duration": "30:00", "format": "mp4", "tools": 4, "type": "training"}'),
(9, 'Emergency Response Protocols', 'video', 4, 'https://example.com/videos/emergency-protocols.mp4', 'video', '{"duration": "17:45", "format": "mp4", "protocols": 8}'),
(9, 'Post-Crisis Support and Follow-up', 'podcast', 5, 'https://example.com/podcasts/post-crisis.mp3', 'audio', '{"duration": "38:00", "format": "mp3", "approaches": 6}');

-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES
(1, 'pre-assessment', '{"questions": [{"id": 1, "text": "How confident do you feel about saying no to substances?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Have you ever felt pressured by peers to use substances?", "type": "yes_no"}, {"id": 3, "text": "What situations make you most vulnerable to poor decisions?", "type": "multiple_choice", "options": ["parties", "stress", "peer pressure", "boredom"]}]}'),
(1, 'post-assessment', '{"questions": [{"id": 1, "text": "How confident do you feel about saying no to substances now?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Which strategies from the program do you find most helpful?", "type": "multiple_choice", "options": ["role-playing", "decision-making framework", "peer support", "communication skills"]}, {"id": 3, "text": "How likely are you to recommend this program to a friend?", "type": "scale", "scale": "1-10"}]}'),
(2, 'weekly-checkin', '{"questions": [{"id": 1, "text": "How many days this week did you feel strong cravings?", "type": "number"}, {"id": 2, "text": "What coping strategies did you use this week?", "type": "multiple_choice", "options": ["breathing exercises", "support group", "physical activity", "journaling", "calling sponsor"]}, {"id": 3, "text": "Rate your overall mood this week", "type": "scale", "scale": "1-10"}]}');

-- Insert Survey Responses
INSERT INTO Survey_Responses (survey_id, user_id, answer_json, submitted_at) VALUES
(1, 8, '{"answers": [{"question_id": 1, "answer": "7"}, {"question_id": 2, "answer": "yes"}, {"question_id": 3, "answer": ["parties", "peer pressure"]}]}', '2024-01-08 09:30:00'),
(2, 8, '{"answers": [{"question_id": 1, "answer": "9"}, {"question_id": 2, "answer": ["role-playing", "communication skills"]}, {"question_id": 3, "answer": "10"}]}', '2024-01-15 10:00:00'),
(3, 6, '{"answers": [{"question_id": 1, "answer": "2"}, {"question_id": 2, "answer": ["breathing exercises", "support group", "physical activity"]}, {"question_id": 3, "answer": "8"}]}', '2024-01-17 14:30:00');

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, 'Understanding the Science of Addiction', 'Addiction is a complex disease that affects the brain''s reward, motivation, and memory systems. In this article, we explore the neurobiological changes that occur with substance use and how understanding these changes can reduce stigma and improve treatment outcomes...', '2024-01-10 09:00:00', 'published', '/uploads/blog-images/science-addiction.jpg'),
(3, '5 Ways to Support a Loved One in Recovery', 'Supporting someone in recovery can be challenging but incredibly rewarding. Here are five evidence-based strategies that family members and friends can use to provide meaningful support: 1. Educate yourself about addiction, 2. Set healthy boundaries...', '2024-01-12 14:00:00', 'published', '/uploads/blog-images/support-recovery.jpg'),
(4, 'Prevention Strategies That Actually Work', 'Research shows that effective prevention programs share several key characteristics. This post examines evidence-based prevention strategies and how they can be implemented in schools, communities, and families...', '2024-01-15 11:00:00', 'published', '/uploads/blog-images/prevention-strategies.jpg'),
(1, 'New Research on Teen Brain Development and Substance Use', 'Recent neuroscience research reveals important insights about adolescent brain development and vulnerability to substance use. Understanding these developmental factors is crucial for designing effective prevention programs...', '2024-01-18 16:00:00', 'draft', '/uploads/blog-images/teen-brain.jpg');

-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, 'Content contains medical information that should be reviewed by professionals before publication', '2024-01-19 10:00:00');
