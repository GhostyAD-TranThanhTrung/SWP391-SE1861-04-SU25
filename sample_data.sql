-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
INSERT INTO Users (role, password, status, email) VALUES
('admin', 'hashed_password_123', 'active', 'admin@drugprevention.com'),
('consultant', 'hashed_password_456', 'active', 'dr.smith@drugprevention.com'),
('consultant', 'hashed_password_789', 'active', 'therapist.johnson@drugprevention.com'),
('consultant', 'hashed_password_321', 'active', 'counselor.williams@drugprevention.com'),
('consultant', 'hashed_password_654', 'inactive', 'dr.brown@drugprevention.com'),
('member', 'hashed_password_987', 'active', 'john.doe@email.com'),
('member', 'hashed_password_147', 'active', 'jane.smith@email.com'),
('member', 'hashed_password_258', 'active', 'mike.wilson@email.com'),
('member', 'hashed_password_369', 'active', 'sarah.davis@email.com'),
('member', 'hashed_password_741', 'banned', 'banned.user@email.com');

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
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes) VALUES
(1, 6, 1, '2024-01-15', 'completed', 'Initial consultation for addiction assessment. Patient showed good engagement.'),
(1, 6, 5, '2024-01-22', 'completed', 'Follow-up session. Discussed treatment options and medication considerations.'),
(2, 7, 7, '2024-01-18', 'completed', 'Parent consultation regarding teenage substance use prevention strategies.'),
(3, 8, 6, '2024-01-20', 'scheduled', 'College prevention education session scheduled.'),
(2, 9, 3, '2024-01-25', 'scheduled', 'Professional development consultation for healthcare worker.'),
(1, 6, 2, '2024-01-29', 'scheduled', 'Ongoing treatment planning session.'),
(4, 7, 1, '2024-01-23', 'cancelled', 'Parent cancelled due to scheduling conflict.'),
(3, 8, 9, '2024-01-17', 'completed', 'Group therapy preparation session completed successfully.');

-- Insert Categories for Programs
INSERT INTO Category (description) VALUES
('Youth Prevention'),
('Adult Recovery'),
('Family Support'),
('Professional Training'),
('Community Outreach'),
('Educational Resources');

-- Insert Prevention Programs
INSERT INTO Programs (title, description, create_by, status, age_group, category_id) VALUES
('Teen SMART Choices', 'Comprehensive substance abuse prevention program for teenagers focusing on decision-making skills, peer pressure resistance, and healthy lifestyle choices.', 1, 'active', '13-18', 1),
('Recovery Foundations', 'Evidence-based recovery program for adults struggling with substance addiction. Includes cognitive behavioral therapy modules and peer support components.', 1, 'active', '18+', 2),
('Family Resilience Building', 'Support program for families affected by substance abuse. Focuses on communication, boundary setting, and healing family relationships.', 1, 'active', 'All Ages', 3),
('Campus Prevention Initiative', 'Substance abuse prevention program designed specifically for college students, addressing binge drinking and drug experimentation.', 1, 'active', '18-25', 1),
('Professional Helper Training', 'Training program for healthcare workers, teachers, and counselors to identify and respond to substance abuse issues.', 1, 'active', 'Adult', 4),
('Community Action Program', 'Community-wide prevention initiative involving local organizations, schools, and families in substance abuse prevention efforts.', 1, 'draft', 'All Ages', 5),
('Digital Wellness for Teens', 'Modern approach to prevention education using digital tools and social media awareness for healthy choices.', 1, 'active', '13-18', 6);

-- Insert User Enrollments
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
(6, 2, '2024-01-10 10:00:00', 0.75),
(7, 3, '2024-01-12 14:00:00', 0.40),
(8, 1, '2024-01-08 09:00:00', 0.90),
(8, 4, '2024-01-15 16:00:00', 0.25),
(9, 5, '2024-01-05 11:00:00', 1.0);

-- Insert Actions for Assessments
INSERT INTO Action (description, range, type) VALUES
('Assessment Complete - Refer to Appropriate Resources', 'Variable', 'Referral'),

-- ASSIST (Alcohol, Smoking and Substance Involvement Screening Test) Actions
('Brief education - Inform patients about the risks of illicit drug use and signs of a substance use disorder', '0-3', 'ASSIST'),
('Brief intervention - Patient-centered discussion that employs Motivational Interviewing concepts to raise awareness of substance use and enhance motivation to change. Brief interventions are typically performed in 3-15 minutes, and should be done in the same session as the screening. Repeated sessions are more effective than a one-time intervention.', '4-26', 'ASSIST'),
('Brief intervention (offer options that include treatment) - If a patient is ready to accept treatment, a referral is a proactive process that facilitates access to specialized care for individuals likely experiencing a substance use disorder. These patients are referred to alcohol and drug treatment experts for more definitive, in-depth assessment and, if warranted, treatment. However, treatment also includes prescribing medications for substance use disorders as part of a patient''s normal primary care.', '27+', 'ASSIST'),

-- ASSIST Cannabis-specific (different range: 0-4 instead of 0-3)
('Brief education - Cannabis: Inform patients about the risks of cannabis use and signs of a substance use disorder', '0-4', 'ASSIST'),
('Brief intervention - Cannabis: Patient-centered discussion using Motivational Interviewing concepts specific to cannabis use patterns and risks', '5-26', 'ASSIST'),

-- CRAFFT (Car, Relax, Alone, Forget, Friends, Trouble) Assessment Actions
('Low Risk - Provide information about risks of substance use and substance use-related riding/driving; offer praise and encouragement. Give Contract for Life or Pledge for Life handouts.', '0', 'CRAFFT'),
('Medium Risk - Provide information about risks of substance use and substance use-related riding/driving; brief advice; possible follow-up visit. Engage in discussion about adverse health effects with clear recommendation to stop.', '1', 'CRAFFT'),
('High Risk - Provide information about risks of substance use and substance use-related riding/driving; brief advice; follow-up visit; possible referral to counseling/treatment. Use 5 Rs framework: Review, Recommend, Riding/Driving risk counseling, Response (elicit self-motivational statements), Reinforce self-efficacy.', '2+', 'CRAFFT'),

-- CRAFFT Age-specific variations (18+ years may use higher cut-point)
('Medium Risk (Young Adults 18+) - Brief intervention with motivational enhancement techniques; follow-up assessment recommended', '2-3', 'CRAFFT'),
('High Risk (Young Adults 18+) - Comprehensive assessment and referral to specialized substance abuse treatment; structured intervention required', '4+', 'CRAFFT');

-- Insert Assessments
INSERT INTO Assessments (user_id, type, result_json, action_id) VALUES
(6, 'Substance Use Screening', '{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["alcohol use", "social pressure"], "recommendations": ["counseling", "peer support group"]}', 2),
(7, 'Family Impact Assessment', '{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["communication skills", "boundary setting"], "children_affected": 1}', 2),
(8, 'College Risk Assessment', '{"total_score": 5, "risk_level": "low", "protective_factors": ["strong family support", "academic engagement"], "risk_factors": ["peer influence"]}', 1),
(9, 'Professional Readiness Evaluation', '{"total_score": 22, "competency_areas": ["identification", "intervention", "referral"], "training_needs": ["motivational interviewing"]}', 5);

-- Insert Program Content
INSERT INTO Content (program_id, content_json, type, orders) VALUES
(1, '{"title": "Understanding Substance Abuse", "duration": "45 minutes", "content": "Interactive module covering types of substances, effects on the brain and body, and risk factors for addiction.", "activities": ["video", "quiz", "discussion"]}', 'module', 1),
(1, '{"title": "Peer Pressure and Decision Making", "duration": "60 minutes", "content": "Role-playing exercises and strategies for resisting peer pressure and making healthy choices.", "activities": ["role-play", "scenarios", "reflection"]}', 'module', 2),
(1, '{"title": "Building Healthy Relationships", "duration": "45 minutes", "content": "Communication skills and building supportive relationships that reinforce positive choices.", "activities": ["group work", "practice", "planning"]}', 'module', 3),

(2, '{"title": "Understanding Addiction as a Disease", "duration": "90 minutes", "content": "Medical and psychological aspects of addiction, breaking down stigma and promoting self-compassion.", "activities": ["lecture", "discussion", "reflection"]}', 'module', 1),
(2, '{"title": "Cognitive Behavioral Techniques", "duration": "120 minutes", "content": "Learning to identify and change negative thought patterns and behaviors related to substance use.", "activities": ["worksheets", "practice", "homework"]}', 'module', 2),
(2, '{"title": "Relapse Prevention Planning", "duration": "90 minutes", "content": "Developing personalized strategies for preventing relapse and maintaining recovery.", "activities": ["planning", "tools", "support network"]}', 'module', 3);

-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES
(1, 'pre-assessment', '{"questions": [{"id": 1, "text": "How confident do you feel about saying no to substances?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Have you ever felt pressured by peers to use substances?", "type": "yes_no"}, {"id": 3, "text": "What situations make you most vulnerable to poor decisions?", "type": "multiple_choice", "options": ["parties", "stress", "peer pressure", "boredom"]}]}'),
(1, 'post-assessment', '{"questions": [{"id": 1, "text": "How confident do you feel about saying no to substances now?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Which strategies from the program do you find most helpful?", "type": "multiple_choice", "options": ["role-playing", "decision-making framework", "peer support", "communication skills"]}, {"id": 3, "text": "How likely are you to recommend this program to a friend?", "type": "scale", "scale": "1-10"}]}'),
(2, 'weekly-checkin', '{"questions": [{"id": 1, "text": "How many days this week did you feel strong cravings?", "type": "number"}, {"id": 2, "text": "What coping strategies did you use this week?", "type": "multiple_choice", "options": ["breathing exercises", "support group", "physical activity", "journaling", "calling sponsor"]}, {"id": 3, "text": "Rate your overall mood this week", "type": "scale", "scale": "1-10"}]}');

-- Insert Survey Responses
INSERT INTO Survey_Responses (survey_id, user_id, answer_json) VALUES
(1, 8, '{"answers": [{"question_id": 1, "answer": "7"}, {"question_id": 2, "answer": "yes"}, {"question_id": 3, "answer": ["parties", "peer pressure"]}]}'),
(2, 8, '{"answers": [{"question_id": 1, "answer": "9"}, {"question_id": 2, "answer": ["role-playing", "communication skills"]}, {"question_id": 3, "answer": "10"}]}'),
(3, 6, '{"answers": [{"question_id": 1, "answer": "2"}, {"question_id": 2, "answer": ["breathing exercises", "support group", "physical activity"]}, {"question_id": 3, "answer": "8"}]}');

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, status) VALUES
(2, 'Understanding the Science of Addiction', 'Addiction is a complex disease that affects the brain''s reward, motivation, and memory systems. In this article, we explore the neurobiological changes that occur with substance use and how understanding these changes can reduce stigma and improve treatment outcomes...', 'published'),
(3, '5 Ways to Support a Loved One in Recovery', 'Supporting someone in recovery can be challenging but incredibly rewarding. Here are five evidence-based strategies that family members and friends can use to provide meaningful support: 1. Educate yourself about addiction, 2. Set healthy boundaries...', 'published'),
(4, 'Prevention Strategies That Actually Work', 'Research shows that effective prevention programs share several key characteristics. This post examines evidence-based prevention strategies and how they can be implemented in schools, communities, and families...', 'published'),
(1, 'New Research on Teen Brain Development and Substance Use', 'Recent neuroscience research reveals important insights about adolescent brain development and vulnerability to substance use. Understanding these developmental factors is crucial for designing effective prevention programs...', 'draft');

-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason) VALUES
(4, 7, 'Content contains medical information that should be reviewed by professionals before publication');

-- Insert Console Logs
INSERT INTO console_log (user_id, action, status, error_log) VALUES
(6, 'login', 'success', NULL),
(6, 'enroll_program', 'success', NULL),
(7, 'login', 'success', NULL),
(8, 'complete_assessment', 'success', NULL),
(9, 'book_consultation', 'success', NULL),
(10, 'login', 'failed', 'Account banned - access denied'),
(6, 'submit_survey', 'success', NULL),
(2, 'create_blog', 'success', NULL); 