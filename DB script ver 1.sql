CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    date_create DATETIME NOT NULL DEFAULT GETDATE(),
    role VARCHAR(50) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'banned')),
    email NVARCHAR(255) NOT NULL UNIQUE
);

-- Profiles Table
CREATE TABLE Profiles (
    user_id INT PRIMARY KEY,
    name NVARCHAR(100) NULL,
    certification NVARCHAR(255) NULL, -- Nullable; required for consultant, manager
    work_hours_json NVARCHAR(MAX) NULL, -- Nullable; expected for staff
    bio_json NVARCHAR(MAX) NULL,
    date_of_birth DATE NULL,
    jobs NVARCHAR(MAX) NULL, -- Nullable; expected for staff, consultant, manager


    CONSTRAINT FK_Profiles_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- Insert Users
INSERT INTO Users (role, password, status, email)
VALUES 
('member', 'hashed_password1', 'active', 'customer1@example.com'),
('staff', 'hashed_password2', 'active', 'staff1@example.com'),
('consultant', 'hashed_password3', 'active', 'consultant1@example.com'),
('manager', 'hashed_password4', 'inactive', 'manager1@example.com'),
('admin', 'hashed_password5', 'active', 'admin1@example.com');

-- Insert corresponding Profiles
INSERT INTO Profiles (user_id, name, certification, work_hours_json, bio_json, date_of_birth, jobs)
VALUES
-- Customer
(1, N'Anna Nguyen', NULL, NULL, N'{"bio": "University student interested in self-help"}', '2002-05-21', N'Student'),

-- Staff
(2, N'Bao Tran', NULL, N'{"mon-fri": "08:30-17:30"}', N'{"experience": "1 year handling support tickets"}', '1995-10-12', N'Teacher'),

-- Consultant
(3, N'Chi Le', N'Certified Cognitive Behavioral Therapist', NULL, N'{"specialty": "CBT for young adults"}', '1990-03-18', N'Psychologist'),

-- Manager
(4, N'Dat Pham', N'Master of Public Health', NULL, N'{"note": "Leads consultant team"}', '1985-07-09', N'Clinical Manager'),

-- Admin
(5, N'Emily Do', NULL, NULL, N'{"role": "System administrator"}', '1988-12-01', NULL);