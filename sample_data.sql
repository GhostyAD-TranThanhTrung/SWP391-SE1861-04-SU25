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
INSERT INTO Category (name, description) VALUES
('Addiction Science', 'Educational content exploring the scientific foundations of addiction, brain chemistry, and neurological impacts'),
('Cannabis (Marijuana)', 'Educational content about marijuana use, effects, risks, and legal considerations'),
('Emerging Drug Trends', 'Information about new and emerging substances, synthetic drugs, and evolving drug patterns'),
('Fentanyl', 'Critical education about fentanyl, its dangers, overdose prevention, and safety measures'),
('Harm Reduction', 'Strategies and approaches to minimize health risks associated with drug use'),
('Heroin', 'Educational content about heroin addiction, treatment options, and recovery resources'),
('HIV', 'Information about HIV prevention, testing, and care related to substance use'),
('Kratom', 'Educational content about kratom use, effects, and potential risks'),
('Methamphetamine', 'Information about methamphetamine addiction, effects, and treatment approaches'),
('Opioids', 'Comprehensive education about opioid addiction, prescription drug misuse, and treatment'),
('Prevention', 'Evidence-based prevention strategies, programs, and educational initiatives'),
('Psychedelic and Dissociative Drugs', 'Educational content about psychedelics, dissociatives, and their effects'),
('Psilocybin (Magic Mushrooms)', 'Information about psilocybin mushrooms, effects, and safety considerations'),
('Stigma and Discrimination', 'Addressing stigma, promoting understanding, and reducing discrimination in addiction'),
('Syringe Services Programs', 'Information about needle exchange programs and harm reduction services'),
('Tobacco/Nicotine and Vaping', 'Educational content about tobacco use, nicotine addiction, and vaping risks'),
('Treatment', 'Comprehensive information about addiction treatment options, recovery programs, and support services');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
-- Addiction Science Programs
('https://example.com/addiction-science.jpg', 'Understanding Addiction Science', 'Comprehensive exploration of the neuroscience behind addiction, brain changes, and recovery mechanisms', 1, 'active', '18+', GETDATE(), 1),
('https://example.com/brain-addiction.jpg', 'Brain and Addiction: A Scientific Perspective', 'Deep dive into how substances affect brain chemistry and neural pathways', 1, 'active', '18+', GETDATE(), 1),

-- Cannabis Programs
('https://example.com/cannabis-education.jpg', 'Cannabis Education and Awareness', 'Evidence-based information about marijuana use, effects, and legal considerations', 1, 'active', '18+', GETDATE(), 2),
('https://example.com/marijuana-youth.jpg', 'Marijuana and Youth Development', 'Understanding the impact of cannabis use on developing brains', 1, 'active', '13-25', GETDATE(), 2),

-- Emerging Drug Trends Programs
('https://example.com/emerging-drugs.jpg', 'New Psychoactive Substances Alert', 'Stay informed about emerging synthetic drugs and novel substances', 1, 'active', '18+', GETDATE(), 3),
('https://example.com/synthetic-drugs.jpg', 'Synthetic Drug Awareness Program', 'Education about designer drugs, their risks, and identification', 1, 'active', '16+', GETDATE(), 3),

-- Fentanyl Programs
('https://example.com/fentanyl-crisis.jpg', 'Fentanyl Crisis Response', 'Critical education about fentanyl dangers, overdose prevention, and naloxone training', 1, 'active', '16+', GETDATE(), 4),
('https://example.com/overdose-prevention.jpg', 'Overdose Prevention and Response', 'Life-saving techniques and emergency response for opioid overdoses', 1, 'active', '16+', GETDATE(), 4),

-- Harm Reduction Programs
('https://example.com/harm-reduction.jpg', 'Harm Reduction Strategies', 'Practical approaches to minimize health risks associated with substance use', 1, 'active', '18+', GETDATE(), 5),
('https://example.com/safer-use.jpg', 'Safer Use Education', 'Evidence-based harm reduction techniques and safety protocols', 1, 'active', '18+', GETDATE(), 5),

-- Heroin Programs
('https://example.com/heroin-treatment.jpg', 'Heroin Addiction Treatment Options', 'Comprehensive guide to heroin addiction treatment and recovery pathways', 1, 'active', '18+', GETDATE(), 6),
('https://example.com/opioid-substitution.jpg', 'Medication-Assisted Treatment for Heroin', 'Understanding methadone, buprenorphine, and other treatment medications', 1, 'active', '18+', GETDATE(), 6),

-- HIV Programs
('https://example.com/hiv-prevention.jpg', 'HIV Prevention in Substance Use', 'Preventing HIV transmission among people who use drugs', 1, 'active', '18+', GETDATE(), 7),
('https://example.com/hiv-testing.jpg', 'HIV Testing and Care Services', 'Access to HIV testing, treatment, and support services', 1, 'active', '18+', GETDATE(), 7),

-- Kratom Programs
('https://example.com/kratom-education.jpg', 'Kratom: Facts and Risks', 'Educational content about kratom use, effects, and potential health risks', 1, 'active', '18+', GETDATE(), 8),

-- Methamphetamine Programs
('https://example.com/meth-addiction.jpg', 'Methamphetamine Addiction Recovery', 'Treatment approaches and recovery strategies for methamphetamine addiction', 1, 'active', '18+', GETDATE(), 9),
('https://example.com/meth-effects.jpg', 'Understanding Methamphetamine Effects', 'Comprehensive education about meth use, health impacts, and risks', 1, 'active', '16+', GETDATE(), 9),

-- Opioids Programs
('https://example.com/opioid-crisis.jpg', 'Opioid Crisis Awareness', 'Understanding the opioid epidemic, prescription drug misuse, and solutions', 1, 'active', '16+', GETDATE(), 10),
('https://example.com/prescription-safety.jpg', 'Prescription Opioid Safety', 'Safe use, storage, and disposal of prescription opioid medications', 1, 'active', 'All Ages', GETDATE(), 10),

-- Prevention Programs
('https://example.com/youth-prevention.jpg', 'Youth Drug Prevention Program', 'Evidence-based prevention strategies for teenagers and young adults', 1, 'active', '13-18', GETDATE(), 11),
('https://example.com/community-prevention.jpg', 'Community Prevention Initiative', 'Building community resilience and prevention capacity', 1, 'active', 'All Ages', GETDATE(), 11),

-- Psychedelic Programs
('https://example.com/psychedelics-education.jpg', 'Psychedelic Substances Education', 'Educational content about psychedelics, dissociatives, and their effects', 1, 'active', '18+', GETDATE(), 12),

-- Psilocybin Programs
('https://example.com/psilocybin-safety.jpg', 'Psilocybin Safety and Effects', 'Information about magic mushrooms, effects, and safety considerations', 1, 'active', '18+', GETDATE(), 13),

-- Stigma Programs
('https://example.com/stigma-reduction.jpg', 'Reducing Addiction Stigma', 'Addressing stigma, promoting understanding, and reducing discrimination', 1, 'active', 'All Ages', GETDATE(), 14),
('https://example.com/language-matters.jpg', 'Language Matters in Addiction', 'Using person-first language and reducing stigmatizing terminology', 1, 'active', '16+', GETDATE(), 14),

-- Syringe Services Programs
('https://example.com/syringe-services.jpg', 'Syringe Services Program Overview', 'Understanding needle exchange programs and harm reduction services', 1, 'active', '18+', GETDATE(), 15),

-- Tobacco/Vaping Programs
('https://example.com/tobacco-cessation.jpg', 'Tobacco Cessation Program', 'Comprehensive smoking cessation support and nicotine replacement therapy', 1, 'active', '16+', GETDATE(), 16),
('https://example.com/vaping-risks.jpg', 'Vaping and E-cigarette Risks', 'Understanding the health risks of vaping and e-cigarette use', 1, 'active', '13+', GETDATE(), 16),

-- Treatment Programs
('https://example.com/addiction-treatment.jpg', 'Comprehensive Addiction Treatment', 'Overview of treatment options, recovery programs, and support services', 1, 'active', '18+', GETDATE(), 17),
('https://example.com/recovery-support.jpg', 'Recovery Support Services', 'Peer support, counseling, and long-term recovery maintenance', 1, 'active', '18+', GETDATE(), 17);

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
-- Program 1: Understanding Addiction Science (6 content items)
(1, 'The Neuroscience of Addiction', 'article', 1, '/content/markdown/addiction-science.md', 'markdown', '{"author": "Dr. Smith", "readingTime": "12 min", "difficulty": "intermediate"}'),
(1, 'How Drugs Change the Brain', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:30", "format": "youtube", "instructor": "Dr. Johnson"}'),
(1, 'Dopamine and Reward Pathways', 'article', 3, '/content/markdown/dopamine-reward.md', 'markdown', '{"author": "Dr. Williams", "readingTime": "10 min", "difficulty": "intermediate"}'),
(1, 'Genetics and Addiction Risk', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "12:45", "format": "youtube", "instructor": "Dr. Genetics"}'),
(1, 'Brain Recovery in Sobriety', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "25:00", "format": "youtube", "host": "Recovery Expert"}'),
(1, 'Addiction Science Research Updates', 'article', 6, '/content/markdown/addiction-research.md', 'markdown', '{"author": "Research Team", "readingTime": "8 min", "difficulty": "advanced"}'),

-- Program 2: Brain and Addiction: A Scientific Perspective (5 content items)
(2, 'Brain Anatomy and Addiction', 'article', 1, '/content/markdown/brain-anatomy-addiction.md', 'markdown', '{"author": "Dr. Brain", "readingTime": "14 min", "difficulty": "intermediate"}'),
(2, 'Neurotransmitters and Substance Use', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "18:20", "format": "youtube", "instructor": "Dr. Neuro"}'),
(2, 'Tolerance and Dependence Mechanisms', 'article', 3, '/content/markdown/tolerance-dependence.md', 'markdown', '{"author": "Dr. Mechanisms", "readingTime": "11 min", "difficulty": "advanced"}'),
(2, 'Brain Imaging in Addiction Studies', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "22:15", "format": "youtube", "instructor": "Dr. Imaging"}'),
(2, 'Neuroplasticity and Recovery', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "30:00", "format": "youtube", "host": "Plasticity Expert"}'),

-- Program 3: Cannabis Education and Awareness (7 content items)
(3, 'Cannabis: Facts vs. Myths', 'article', 1, '/content/markdown/cannabis-facts.md', 'markdown', '{"author": "Cannabis Expert", "readingTime": "10 min", "difficulty": "beginner"}'),
(3, 'THC and CBD: Understanding Cannabinoids', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:30", "format": "youtube", "instructor": "Dr. Cannabinoid"}'),
(3, 'Cannabis and Mental Health', 'article', 3, '/content/markdown/cannabis-mental-health.md', 'markdown', '{"author": "Mental Health Expert", "readingTime": "12 min", "difficulty": "intermediate"}'),
(3, 'Legal Cannabis: What You Need to Know', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:45", "format": "youtube", "instructor": "Legal Expert"}'),
(3, 'Medical vs. Recreational Cannabis', 'article', 5, '/content/markdown/medical-recreational-cannabis.md', 'markdown', '{"author": "Medical Cannabis Expert", "readingTime": "9 min", "difficulty": "intermediate"}'),
(3, 'Cannabis Use Disorders', 'podcast', 6, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "28:00", "format": "youtube", "host": "Addiction Specialist"}'),
(3, 'Driving and Cannabis: Safety Concerns', 'article', 7, '/content/markdown/cannabis-driving-safety.md', 'markdown', '{"author": "Safety Expert", "readingTime": "7 min", "difficulty": "beginner"}'),

-- Program 4: Marijuana and Youth Development (6 content items)
(4, 'Teen Brain Development and Cannabis', 'article', 1, '/content/markdown/teen-brain.md', 'markdown', '{"author": "Dr. Youth", "readingTime": "11 min", "difficulty": "intermediate"}'),
(4, 'Cannabis Effects on Academic Performance', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "13:20", "format": "youtube", "instructor": "Education Expert"}'),
(4, 'Early Cannabis Use: Long-term Effects', 'article', 3, '/content/markdown/early-cannabis-effects.md', 'markdown', '{"author": "Development Expert", "readingTime": "10 min", "difficulty": "intermediate"}'),
(4, 'Talking to Teens About Cannabis', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:45", "format": "youtube", "instructor": "Parent Educator"}'),
(4, 'Cannabis Prevention in Schools', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "32:00", "format": "youtube", "host": "School Counselor"}'),
(4, 'Youth Cannabis Treatment Options', 'article', 6, '/content/markdown/youth-cannabis-treatment.md', 'markdown', '{"author": "Youth Treatment Specialist", "readingTime": "13 min", "difficulty": "advanced"}'),

-- Program 5: New Psychoactive Substances Alert (5 content items)
(5, 'What Are New Psychoactive Substances?', 'article', 1, '/content/markdown/new-psychoactive-substances.md', 'markdown', '{"author": "Drug Alert Expert", "readingTime": "9 min", "difficulty": "beginner"}'),
(5, 'Synthetic Drug Identification', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "17:30", "format": "youtube", "instructor": "Forensic Expert"}'),
(5, 'Designer Drug Risks and Effects', 'article', 3, '/content/markdown/designer-drug-risks.md', 'markdown', '{"author": "Risk Assessment Expert", "readingTime": "11 min", "difficulty": "intermediate"}'),
(5, 'Online Drug Markets and Safety', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "19:15", "format": "youtube", "instructor": "Cyber Safety Expert"}'),
(5, 'Emerging Drug Trends Report', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "35:00", "format": "youtube", "host": "Trend Analyst"}'),

-- Program 6: Synthetic Drug Awareness Program (6 content items)
(6, 'Identifying Synthetic Drugs', 'article', 1, '/content/markdown/synthetic-drugs.md', 'markdown', '{"author": "Synthetic Drug Expert", "readingTime": "10 min", "difficulty": "intermediate"}'),
(6, 'K2/Spice: Synthetic Cannabinoids', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:30", "format": "youtube", "instructor": "Drug Safety Expert"}'),
(6, 'Bath Salts and Synthetic Stimulants', 'article', 3, '/content/markdown/bath-salts-synthetics.md', 'markdown', '{"author": "Stimulant Expert", "readingTime": "12 min", "difficulty": "intermediate"}'),
(6, 'Testing and Detection Methods', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:45", "format": "youtube", "instructor": "Testing Expert"}'),
(6, 'Emergency Response to Synthetic Overdose', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "28:00", "format": "youtube", "host": "Emergency Response"}'),
(6, 'Prevention Strategies for Synthetic Drugs', 'article', 6, '/content/markdown/synthetic-prevention.md', 'markdown', '{"author": "Prevention Specialist", "readingTime": "9 min", "difficulty": "beginner"}'),

-- Program 7: Fentanyl Crisis Response (7 content items)
(7, 'Understanding Fentanyl and Its Dangers', 'article', 1, '/content/markdown/fentanyl-dangers.md', 'markdown', '{"author": "Fentanyl Expert", "readingTime": "11 min", "difficulty": "beginner"}'),
(7, 'Fentanyl Test Strips: How to Use', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "8:30", "format": "youtube", "instructor": "Harm Reduction Specialist"}'),
(7, 'Naloxone Administration Training', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "12:15", "format": "youtube", "instructor": "EMT Trainer"}'),
(7, 'Fentanyl in the Drug Supply', 'article', 4, '/content/markdown/fentanyl-drug-supply.md', 'markdown', '{"author": "Drug Supply Expert", "readingTime": "10 min", "difficulty": "intermediate"}'),
(7, 'Supporting Families Affected by Fentanyl', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "35:00", "format": "youtube", "host": "Family Support Counselor"}'),
(7, 'Community Response to Fentanyl Crisis', 'video', 6, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "20:45", "format": "youtube", "instructor": "Community Leader"}'),
(7, 'Fentanyl Prevention in Schools', 'article', 7, '/content/markdown/fentanyl-school-prevention.md', 'markdown', '{"author": "School Safety Expert", "readingTime": "13 min", "difficulty": "intermediate"}'),

-- Program 8: Overdose Prevention and Response (5 content items)
(8, 'Recognizing Overdose Signs', 'article', 1, '/content/markdown/overdose-signs.md', 'markdown', '{"author": "Overdose Prevention Expert", "readingTime": "8 min", "difficulty": "beginner"}'),
(8, 'Emergency Response Steps', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "10:30", "format": "youtube", "instructor": "Emergency Response Team"}'),
(8, 'Naloxone: Life-Saving Medication', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:20", "format": "youtube", "instructor": "Medical Professional"}'),
(8, 'Post-Overdose Care and Support', 'article', 4, '/content/markdown/post-overdose-care.md', 'markdown', '{"author": "Recovery Specialist", "readingTime": "12 min", "difficulty": "intermediate"}'),
(8, 'Building Overdose Response Networks', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "30:00", "format": "youtube", "host": "Network Coordinator"}'),

-- Program 9: Harm Reduction Strategies (6 content items)
(9, 'Introduction to Harm Reduction', 'article', 1, '/content/markdown/harm-reduction-intro.md', 'markdown', '{"author": "Harm Reduction Expert", "readingTime": "9 min", "difficulty": "beginner"}'),
(9, 'Safe Use Practices', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "18:45", "format": "youtube", "instructor": "Safe Use Educator"}'),
(9, 'Needle Exchange Programs', 'article', 3, '/content/markdown/needle-exchange.md', 'markdown', '{"author": "Needle Exchange Coordinator", "readingTime": "11 min", "difficulty": "intermediate"}'),
(9, 'Safe Storage and Disposal', 'video', 4, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "13:30", "format": "youtube", "instructor": "Safety Coordinator"}'),
(9, 'Harm Reduction in Communities', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "40:00", "format": "youtube", "host": "Community Organizer"}'),
(9, 'Evidence-Based Harm Reduction', 'article', 6, '/content/markdown/evidence-based-harm-reduction.md', 'markdown', '{"author": "Research Scientist", "readingTime": "14 min", "difficulty": "advanced"}'),

-- Program 10: Safer Use Education (5 content items)
(10, 'Risk Assessment and Reduction', 'article', 1, '/content/markdown/risk-assessment.md', 'markdown', '{"author": "Risk Assessment Expert", "readingTime": "10 min", "difficulty": "intermediate"}'),
(10, 'Drug Testing and Adulterants', 'video', 2, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "16:20", "format": "youtube", "instructor": "Testing Specialist"}'),
(10, 'Safer Injection Practices', 'video', 3, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "14:45", "format": "youtube", "instructor": "Injection Safety Expert"}'),
(10, 'Preventing Infections and Disease', 'article', 4, '/content/markdown/infection-prevention.md', 'markdown', '{"author": "Infectious Disease Specialist", "readingTime": "12 min", "difficulty": "intermediate"}'),
(10, 'When to Seek Medical Help', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "25:00", "format": "youtube", "host": "Medical Advisor"}')

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
