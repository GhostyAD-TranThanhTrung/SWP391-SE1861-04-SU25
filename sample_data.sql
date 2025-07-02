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
(1, 'Admin User', '{"bio": "System administrator for drug prevention platform"}', '1985-05-15', 'System Administrator'),
(2, 'Dr. Michael Smith', '{"bio": "Licensed addiction psychiatrist with 15 years of experience in substance abuse treatment and prevention", "education": "MD from Johns Hopkins, Board Certified in Addiction Medicine"}', '1975-03-20', 'Addiction Psychiatrist'),
(3, 'Sarah Johnson', '{"bio": "Licensed clinical therapist specializing in addiction counseling and family therapy", "education": "MS in Clinical Psychology, Licensed Professional Counselor"}', '1982-08-12', 'Clinical Therapist'),
(4, 'Robert Williams', '{"bio": "Certified substance abuse counselor with expertise in youth prevention programs", "education": "MS in Addiction Counseling, CADC Certified"}', '1978-11-05', 'Substance Abuse Counselor'),
(5, 'Dr. Emily Brown', '{"bio": "Clinical psychologist specializing in behavioral interventions for addiction", "education": "PhD in Clinical Psychology"}', '1980-01-30', 'Clinical Psychologist'),
(6, 'John Doe', '{"bio": "Seeking support for addiction recovery", "interests": ["fitness", "reading"]}', '1995-06-10', 'Software Developer'),
(7, 'Jane Smith', '{"bio": "Parent looking for prevention resources for teenager", "interests": ["parenting", "community service"]}', '1978-09-22', 'Teacher'),
(8, 'Mike Wilson', '{"bio": "College student interested in prevention education", "interests": ["sports", "music"]}', '2001-12-03', 'Student'),
(9, 'Sarah Davis', '{"bio": "Healthcare worker seeking professional development in addiction prevention", "interests": ["healthcare", "training"]}', '1988-04-17', 'Nurse'),
(10, 'Banned User', '{"bio": "User account banned for violations"}', '1990-07-25', 'Unknown'),
(11, 'Deleted User', '{"bio": "User who deleted their account (data preserved)"}', '1992-03-18', 'Former Member');

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
('Treatment', 'Comprehensive information about addiction treatment options, recovery programs, and support services'),
('Community Event', 'Community-based events, workshops, and activities that promote drug prevention awareness and support recovery efforts');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
-- Addiction Science Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Understanding Addiction Science', 'Comprehensive exploration of the neuroscience behind addiction, brain changes, and recovery mechanisms', 1, 'active', '18+', GETDATE(), 1),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Brain and Addiction: A Scientific Perspective', 'Deep dive into how substances affect brain chemistry and neural pathways', 1, 'active', '18+', GETDATE(), 1),

-- Cannabis Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Cannabis Education and Awareness', 'Evidence-based information about marijuana use, effects, and legal considerations', 1, 'active', '18+', GETDATE(), 2),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Marijuana and Youth Development', 'Understanding the impact of cannabis use on developing brains', 1, 'active', '13-25', GETDATE(), 2),

-- Emerging Drug Trends Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'New Psychoactive Substances Alert', 'Stay informed about emerging synthetic drugs and novel substances', 1, 'active', '18+', GETDATE(), 3),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Synthetic Drug Awareness Program', 'Education about designer drugs, their risks, and identification', 1, 'active', '16+', GETDATE(), 3),

-- Fentanyl Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Fentanyl Crisis Response', 'Critical education about fentanyl dangers, overdose prevention, and naloxone training', 1, 'active', '16+', GETDATE(), 4),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Overdose Prevention and Response', 'Life-saving techniques and emergency response for opioid overdoses', 1, 'active', '16+', GETDATE(), 4),

-- Harm Reduction Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Harm Reduction Strategies', 'Practical approaches to minimize health risks associated with substance use', 1, 'active', '18+', GETDATE(), 5),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Safer Use Education', 'Evidence-based harm reduction techniques and safety protocols', 1, 'active', '18+', GETDATE(), 5),

-- Heroin Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Heroin Addiction Treatment Options', 'Comprehensive guide to heroin addiction treatment and recovery pathways', 1, 'active', '18+', GETDATE(), 6),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Medication-Assisted Treatment for Heroin', 'Understanding methadone, buprenorphine, and other treatment medications', 1, 'active', '18+', GETDATE(), 6),

-- HIV Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'HIV Prevention in Substance Use', 'Preventing HIV transmission among people who use drugs', 1, 'active', '18+', GETDATE(), 7),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'HIV Testing and Care Services', 'Access to HIV testing, treatment, and support services', 1, 'active', '18+', GETDATE(), 7),

-- Kratom Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Kratom: Facts and Risks', 'Educational content about kratom use, effects, and potential health risks', 1, 'active', '18+', GETDATE(), 8),

-- Methamphetamine Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Methamphetamine Addiction Recovery', 'Treatment approaches and recovery strategies for methamphetamine addiction', 1, 'active', '18+', GETDATE(), 9),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Understanding Methamphetamine Effects', 'Comprehensive education about meth use, health impacts, and risks', 1, 'active', '16+', GETDATE(), 9),

-- Opioids Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Opioid Crisis Awareness', 'Understanding the opioid epidemic, prescription drug misuse, and solutions', 1, 'active', '16+', GETDATE(), 10),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Prescription Opioid Safety', 'Safe use, storage, and disposal of prescription opioid medications', 1, 'active', 'All Ages', GETDATE(), 10),

-- Prevention Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Youth Drug Prevention Program', 'Evidence-based prevention strategies for teenagers and young adults', 1, 'active', '13-18', GETDATE(), 11),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Community Prevention Initiative', 'Building community resilience and prevention capacity', 1, 'active', 'All Ages', GETDATE(), 11),

-- Psychedelic Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Psychedelic Substances Education', 'Educational content about psychedelics, dissociatives, and their effects', 1, 'active', '18+', GETDATE(), 12),

-- Psilocybin Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Psilocybin Safety and Effects', 'Information about magic mushrooms, effects, and safety considerations', 1, 'active', '18+', GETDATE(), 13),

-- Stigma Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Reducing Addiction Stigma', 'Addressing stigma, promoting understanding, and reducing discrimination', 1, 'active', 'All Ages', GETDATE(), 14),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Language Matters in Addiction', 'Using person-first language and reducing stigmatizing terminology', 1, 'active', '16+', GETDATE(), 14),

-- Syringe Services Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Syringe Services Program Overview', 'Understanding needle exchange programs and harm reduction services', 1, 'active', '18+', GETDATE(), 15),

-- Tobacco/Vaping Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Tobacco Cessation Program', 'Comprehensive smoking cessation support and nicotine replacement therapy', 1, 'active', '16+', GETDATE(), 16),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Vaping and E-cigarette Risks', 'Understanding the health risks of vaping and e-cigarette use', 1, 'active', '13+', GETDATE(), 16),

-- Treatment Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Comprehensive Addiction Treatment', 'Overview of treatment options, recovery programs, and support services', 1, 'active', '18+', GETDATE(), 17),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Recovery Support Services', 'Peer support, counseling, and long-term recovery maintenance', 1, 'active', '18+', GETDATE(), 17),

-- Community Event Programs
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Community Prevention Fair', 'Interactive community event featuring prevention education booths, resource sharing, and family-friendly activities to build awareness and support networks', 1, 'active', 'All Ages', GETDATE(), 18),
('https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', 'Recovery Walk & Support Rally', 'Community walking event to show solidarity with those in recovery, reduce stigma, and connect families with local support resources', 1, 'active', 'All Ages', GETDATE(), 18);

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
(10, 'When to Seek Medical Help', 'podcast', 5, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "25:00", "format": "youtube", "host": "Medical Advisor"}'),

-- Community Event Programs Content
-- Program 25: Community Prevention Fair (2 content items)
(31, 'Planning Your Community Prevention Fair', 'article', 1, '/content/markdown/community-prevention-fair.md', 'markdown', '{"author": "Community Event Coordinator", "readingTime": "8 min", "difficulty": "beginner"}'),
(31, 'Engaging Activities for All Ages', 'article', 2, '/content/markdown/prevention-fair-activities.md', 'markdown', '{"author": "Youth Engagement Specialist", "readingTime": "6 min", "difficulty": "beginner"}'),

-- Program 26: Recovery Walk & Support Rally (2 content items)
(31, 'Organizing a Recovery Support Walk', 'article', 1, '/content/markdown/recovery-walk-guide.md', 'markdown', '{"author": "Recovery Advocate", "readingTime": "7 min", "difficulty": "beginner"}'),
(31, 'Building Community Support Networks', 'article', 2, '/content/markdown/community-support-networks.md', 'markdown', '{"author": "Community Organizer", "readingTime": "9 min", "difficulty": "beginner"}');

-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES

-- ==================== ADDICTION SCIENCE PROGRAMS ====================

-- Program 1: Understanding Addiction Science - Pre-Assessment
(1, 'pre-assessment', '{"questions": [{"id": 1, "question": "How would you rate your current understanding of how addiction affects the brain?", "options": ["No understanding", "Little understanding", "Some understanding", "Good understanding", "Excellent understanding"]}, {"id": 2, "question": "What do you know about neurotransmitters and their role in addiction?", "options": ["Never heard of them", "Heard of them but don''t understand", "Basic understanding", "Good understanding", "Expert level"]}, {"id": 3, "question": "How familiar are you with the concept of dopamine reward pathways?", "options": ["Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Extremely familiar"]}, {"id": 4, "question": "Do you believe addiction is primarily a choice or a disease?", "options": ["Completely a choice", "Mostly a choice", "Both equally", "Mostly a disease", "Completely a disease"]}, {"id": 5, "question": "How confident do you feel explaining the science of addiction to others?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 6, "question": "What interests you most about learning addiction science?", "options": ["Brain mechanisms", "Treatment applications", "Prevention strategies", "Research methods", "Personal understanding", "All aspects"]}]}'),

-- Program 1: Understanding Addiction Science - Post-Assessment  
(1, 'post-assessment', '{"questions": [{"id": 1, "question": "After completing this program, how well do you understand how addiction changes brain structure and function?", "options": ["No understanding", "Little understanding", "Some understanding", "Good understanding", "Excellent understanding"]}, {"id": 2, "question": "How confident are you now in explaining the role of neurotransmitters in addiction?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 3, "question": "Which aspect of addiction science did you find most enlightening?", "options": ["Dopamine reward pathways", "Brain plasticity and recovery", "Genetic factors", "Environmental influences", "Treatment mechanisms", "All equally important"]}, {"id": 4, "question": "How has this program changed your view of addiction as a medical condition?", "options": ["Significantly increased understanding", "Moderately increased understanding", "Slightly increased understanding", "No change", "Decreased understanding"]}, {"id": 5, "question": "How likely are you to share addiction science knowledge with others?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}, {"id": 6, "question": "Rate the effectiveness of this addiction science program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 7, "question": "How well prepared do you feel to recognize signs of addiction in yourself or others?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}]}'),

-- Program 2: Brain and Addiction - Pre-Assessment
(2, 'pre-assessment', '{"questions": [{"id": 1, "question": "How familiar are you with basic brain anatomy related to addiction?", "options": ["Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Extremely familiar"]}, {"id": 2, "question": "What do you know about the brain''s reward system?", "options": ["Nothing", "Very little", "Basic concepts", "Good understanding", "Comprehensive knowledge"]}, {"id": 3, "question": "How well do you understand tolerance and dependence mechanisms?", "options": ["No understanding", "Little understanding", "Some understanding", "Good understanding", "Excellent understanding"]}, {"id": 4, "question": "Are you familiar with brain imaging techniques used in addiction research?", "options": ["Never heard of them", "Heard of but don''t understand", "Basic awareness", "Good understanding", "Very knowledgeable"]}, {"id": 5, "question": "What interests you most about brain science and addiction?", "options": ["How addiction develops", "Brain recovery processes", "Individual differences", "Treatment implications", "Research methods", "All aspects"]}, {"id": 6, "question": "How confident do you feel about neuroplasticity concepts?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}]}'),

-- Program 2: Brain and Addiction - Post-Assessment
(2, 'post-assessment', '{"questions": [{"id": 1, "question": "How well do you now understand brain anatomy relevant to addiction?", "options": ["No understanding", "Little understanding", "Some understanding", "Good understanding", "Excellent understanding"]}, {"id": 2, "question": "After this program, how confident are you in explaining the brain''s reward system?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 3, "question": "Which brain science concept was most valuable to learn?", "options": ["Neurotransmitter function", "Tolerance mechanisms", "Brain imaging findings", "Neuroplasticity and recovery", "Individual brain differences", "All were equally valuable"]}, {"id": 4, "question": "How has learning about brain science changed your understanding of addiction recovery?", "options": ["Significantly improved understanding", "Moderately improved understanding", "Slightly improved understanding", "No change", "Confused me more"]}, {"id": 5, "question": "How likely are you to continue learning about neuroscience and addiction?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}, {"id": 6, "question": "Rate the effectiveness of this brain science program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 7, "question": "How well can you now explain neuroplasticity to someone else?", "options": ["Cannot explain at all", "Can explain basics", "Can explain moderately well", "Can explain well", "Can explain expertly"]}]}'),

-- ==================== CANNABIS EDUCATION PROGRAMS ====================

-- Program 3: Cannabis Education and Awareness - Pre-Assessment
(3, 'pre-assessment', '{"questions": [{"id": 1, "question": "How would you rate your current knowledge about cannabis and its effects?", "options": ["Very limited", "Limited", "Moderate", "Good", "Extensive"]}, {"id": 2, "question": "What do you know about the difference between THC and CBD?", "options": ["Nothing", "Very little", "Basic differences", "Good understanding", "Comprehensive knowledge"]}, {"id": 3, "question": "How familiar are you with cannabis laws in your area?", "options": ["Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Extremely familiar"]}, {"id": 4, "question": "What concerns you most about cannabis use?", "options": ["Health effects", "Legal issues", "Mental health impacts", "Addiction potential", "Social consequences", "No concerns"]}, {"id": 5, "question": "How confident do you feel discussing cannabis topics with others?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 6, "question": "What motivates you to learn about cannabis education?", "options": ["Personal interest", "Family concerns", "Professional development", "Peer pressure situations", "Health awareness", "All of the above"]}]}'),

-- Program 3: Cannabis Education and Awareness - Post-Assessment
(3, 'post-assessment', '{"questions": [{"id": 1, "question": "After completing this program, how would you rate your cannabis knowledge?", "options": ["Very limited", "Limited", "Moderate", "Good", "Extensive"]}, {"id": 2, "question": "How confident are you now in explaining THC vs CBD differences?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 3, "question": "Which aspect of cannabis education was most valuable?", "options": ["Medical vs recreational use", "Legal considerations", "Health risks and benefits", "Myths vs facts", "Mental health impacts", "All were equally valuable"]}, {"id": 4, "question": "How has this program influenced your perspective on cannabis use?", "options": ["Significantly changed my views", "Moderately changed my views", "Slightly changed my views", "Reinforced existing views", "No change in perspective"]}, {"id": 5, "question": "How prepared do you feel to make informed decisions about cannabis?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}, {"id": 6, "question": "Rate the effectiveness of this cannabis education program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 7, "question": "How likely are you to share cannabis facts with others to dispel myths?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}]}'),

-- ==================== COMMUNITY EVENT PROGRAMS ====================

-- Program 25: Community Prevention Fair - Pre-Assessment
(25, 'pre-assessment', '{"questions": [{"id": 1, "question": "How familiar are you with organizing community prevention events?", "options": ["Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Extremely familiar"]}, {"id": 2, "question": "What experience do you have with community engagement activities?", "options": ["No experience", "Very little experience", "Some experience", "Good experience", "Extensive experience"]}, {"id": 3, "question": "How confident do you feel about planning prevention fair activities?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 4, "question": "What challenges do you anticipate in organizing a prevention fair?", "options": ["Community engagement", "Resource coordination", "Activity planning", "Volunteer management", "Logistics and setup", "All of the above"]}, {"id": 5, "question": "What do you hope to learn about community prevention fair planning?", "options": ["Event logistics", "Activity design", "Community outreach", "Resource management", "Impact measurement", "All aspects"]}, {"id": 6, "question": "How important do you think prevention fairs are for community health?", "options": ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]}]}'),

-- Program 25: Community Prevention Fair - Post-Assessment
(25, 'post-assessment', '{"questions": [{"id": 1, "question": "After this program, how confident do you feel about organizing a prevention fair?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 2, "question": "Which aspect of prevention fair planning did you find most valuable?", "options": ["Activity design for all ages", "Community outreach strategies", "Resource coordination", "Volunteer management", "Impact measurement", "All were equally valuable"]}, {"id": 3, "question": "How likely are you to organize or help with a prevention fair in your community?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}, {"id": 4, "question": "What prevention fair component do you think has the most impact?", "options": ["Educational booths", "Interactive activities", "Resource distribution", "Community networking", "Family engagement", "All components together"]}, {"id": 5, "question": "How has this program changed your understanding of community prevention work?", "options": ["Significantly increased understanding", "Moderately increased understanding", "Slightly increased understanding", "No change", "Decreased understanding"]}, {"id": 6, "question": "Rate the effectiveness of this prevention fair planning program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 7, "question": "How prepared do you feel to engage diverse community members in prevention activities?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}]}'),

-- Program 26: Recovery Walk & Support Rally - Pre-Assessment
(26, 'pre-assessment', '{"questions": [{"id": 1, "question": "How familiar are you with recovery support events and their purpose?", "options": ["Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Extremely familiar"]}, {"id": 2, "question": "What experience do you have with community wellness events?", "options": ["No experience", "Very little experience", "Some experience", "Good experience", "Extensive experience"]}, {"id": 3, "question": "How comfortable do you feel discussing recovery and mental health topics?", "options": ["Very uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very comfortable"]}, {"id": 4, "question": "What do you hope to gain from learning about recovery walks?", "options": ["Event planning skills", "Understanding recovery support", "Community building knowledge", "Stigma reduction strategies", "Personal growth", "All of the above"]}, {"id": 5, "question": "How important do you think recovery support events are for communities?", "options": ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]}, {"id": 6, "question": "What concerns do you have about organizing recovery support events?", "options": ["Privacy and confidentiality", "Community acceptance", "Resource requirements", "Safety considerations", "Emotional support needs", "No concerns"]}]}'),

-- Program 26: Recovery Walk & Support Rally - Post-Assessment
(26, 'post-assessment', '{"questions": [{"id": 1, "question": "After this program, how confident do you feel about organizing recovery support events?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 2, "question": "Which aspect of recovery walk planning was most enlightening?", "options": ["Creating inclusive environments", "Managing emotional safety", "Building community partnerships", "Honoring recovery journeys", "Reducing stigma", "All were equally important"]}, {"id": 3, "question": "How likely are you to participate in or organize recovery support events?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}, {"id": 4, "question": "What impact do you think recovery walks have on community attitudes?", "options": ["No impact", "Minimal impact", "Moderate impact", "Significant impact", "Transformative impact"]}, {"id": 5, "question": "How has this program influenced your understanding of recovery and support?", "options": ["Significantly deepened understanding", "Moderately deepened understanding", "Slightly deepened understanding", "No change", "Confused my understanding"]}, {"id": 6, "question": "Rate the effectiveness of this recovery support program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 7, "question": "How prepared do you feel to create supportive environments for people in recovery?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}]}'),

-- ==================== GENERAL PREVENTION PROGRAMS ====================

-- General Pre-Assessment Survey for All Prevention Programs
(NULL, 'pre-assessment', '{"questions": [{"id": 1, "question": "How would you rate your overall knowledge about substance abuse prevention?", "options": ["Very Low", "Low", "Moderate", "High", "Very High"]}, {"id": 2, "question": "How confident are you in your ability to make healthy decisions regarding substances?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 3, "question": "What motivates you to participate in prevention education programs?", "options": ["Personal interest", "Family concerns", "Professional development", "Community involvement", "Health awareness", "All of the above"]}, {"id": 4, "question": "How often do you seek out information about health and wellness topics?", "options": ["Never", "Rarely", "Sometimes", "Often", "Always"]}, {"id": 5, "question": "What are your main sources of support for making healthy choices?", "options": ["Family", "Friends", "Healthcare providers", "Community programs", "Online resources", "Multiple sources"]}, {"id": 6, "question": "How prepared do you feel to help others make informed decisions about substances?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}]}'),

-- General Post-Assessment Survey for All Prevention Programs  
(NULL, 'post-assessment', '{"questions": [{"id": 1, "question": "How would you rate your knowledge about substance abuse prevention after completing this program?", "options": ["Very Low", "Low", "Moderate", "High", "Very High"]}, {"id": 2, "question": "How confident do you feel now in making informed decisions about substances?", "options": ["Not confident at all", "Slightly confident", "Moderately confident", "Very confident", "Extremely confident"]}, {"id": 3, "question": "Which program components were most beneficial to your learning?", "options": ["Educational materials", "Interactive activities", "Practical exercises", "Group discussions", "Resource information", "All components"]}, {"id": 4, "question": "How likely are you to apply the knowledge gained from this program?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}, {"id": 5, "question": "How has your understanding of prevention resources and support changed?", "options": ["Significantly improved", "Moderately improved", "Slightly improved", "No change", "Decreased"]}, {"id": 6, "question": "How prepared do you feel now to support others in making healthy choices?", "options": ["Not prepared at all", "Slightly prepared", "Moderately prepared", "Well prepared", "Very well prepared"]}, {"id": 7, "question": "Rate the overall effectiveness of this prevention program", "options": ["Very ineffective", "Ineffective", "Neutral", "Effective", "Very effective"]}, {"id": 8, "question": "How likely are you to recommend this program to others?", "options": ["Very unlikely", "Unlikely", "Neutral", "Likely", "Very likely"]}]}');

-- Insert Survey Responses

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, 'Understanding the Science of Addiction', 'Addiction is a complex disease that affects the brain''s reward, motivation, and memory systems. In this article, we explore the neurobiological changes that occur with substance use and how understanding these changes can reduce stigma and improve treatment outcomes...', '2024-01-10 09:00:00', 'published', '/uploads/blog-images/science-addiction.jpg'),
(3, '5 Ways to Support a Loved One in Recovery', 'Supporting someone in recovery can be challenging but incredibly rewarding. Here are five evidence-based strategies that family members and friends can use to provide meaningful support: 1. Educate yourself about addiction, 2. Set healthy boundaries...', '2024-01-12 14:00:00', 'published', '/uploads/blog-images/support-recovery.jpg'),
(4, 'Prevention Strategies That Actually Work', 'Research shows that effective prevention programs share several key characteristics. This post examines evidence-based prevention strategies and how they can be implemented in schools, communities, and families...', '2024-01-15 11:00:00', 'published', '/uploads/blog-images/prevention-strategies.jpg'),
(1, 'New Research on Teen Brain Development and Substance Use', 'Recent neuroscience research reveals important insights about adolescent brain development and vulnerability to substance use. Understanding these developmental factors is crucial for designing effective prevention programs...', '2024-01-18 16:00:00', 'draft', '/uploads/blog-images/teen-brain.jpg');

-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, 'Content contains medical information that should be reviewed by professionals before publication', '2024-01-19 10:00:00');
