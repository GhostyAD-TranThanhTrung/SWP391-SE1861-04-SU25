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


-- ASSESSMENTS TABLE
CREATE TABLE Assessments (
    assessment_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    result_json NVARCHAR(MAX) NULL,
    create_at DATETIME NOT NULL DEFAULT GETDATE(),
    action_id INT,

    CONSTRAINT FK_Assessments_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Assessments_Action FOREIGN KEY (action_id)
        REFERENCES Action(action_id)
        ON DELETE SET NULL
);

-- ACTION TABLE
CREATE TABLE Action (
    action_id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL,
    range VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- CATEGORY TABLE
CREATE TABLE Category (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL
);

-- PROGRAMS TABLE
CREATE TABLE Programs (
    program_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    create_by INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    age_group VARCHAR(50),
    create_at DATETIME NOT NULL DEFAULT GETDATE(),
    category_id INT,

    CONSTRAINT FK_Programs_Users FOREIGN KEY (create_by)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Programs_Category FOREIGN KEY (category_id)
        REFERENCES Category(category_id)
        ON DELETE SET NULL
);

-- Actions related to interpreting assessment results
INSERT INTO Action (description, range, type)
VALUES 
(N'Refer to specialist for substance abuse', 'High', 'ASSIST'),
(N'Monitor periodically', 'Moderate', 'ASSIST'),
(N'No intervention needed', 'Low', 'ASSIST'),
(N'Follow up with counseling', 'Moderate', 'STAFF');


-- Categories for different programs
INSERT INTO Category (description)
VALUES 
(N'Substance Use Awareness'),
(N'Mental Health Support'),
(N'Youth Development');


-- Program created by Manager (user_id = 4)
INSERT INTO Programs (title, description, create_by, status, age_group, create_at, category_id)
VALUES 
(N'Substance Use Recovery Path', N'12-week guided counseling for moderate to severe users.', 4, 'active', '18-35', GETDATE(), 1),
(N'Teen Drug Awareness Program', N'Educational support for teens at risk.', 4, 'active', '13-19', GETDATE(), 1);

-- Anna Nguyen (user_id = 1), a member, took an ASSIST test
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id)
VALUES 
(1, 'ASSIST', N'{"alcohol": 5, "cannabis": 2, "tobacco": 0}', GETDATE(), 2),  -- Moderate score

-- Bao Tran (user_id = 2), staff, took STAFF test for internal screening
(2, 'STAFF', N'{"stress_level": "moderate", "burnout_risk": "low"}', GETDATE(), 4),

-- Chi Le (user_id = 3), consultant, ran self-screening (though usually not typical)
(3, 'ASSIST', N'{"alcohol": 1, "cannabis": 0, "tobacco": 0}', GETDATE(), 3),

-- Dat Pham (user_id = 4), manager, took STAFF test
(4, 'STAFF', N'{"stress_level": "high", "burnout_risk": "moderate"}', GETDATE(), 4);
-- USERS TABLE
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    date_create DATETIME NOT NULL DEFAULT GETDATE(),
    role VARCHAR(50) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'banned')),
    email NVARCHAR(255) NOT NULL UNIQUE
);

-- PROFILES TABLE
CREATE TABLE Profiles (
    user_id INT PRIMARY KEY,
    name NVARCHAR(100) NULL,
    certification NVARCHAR(255) NULL,
    work_hours_json NVARCHAR(MAX) NULL,
    bio_json NVARCHAR(MAX) NULL,
    date_of_birth DATE NULL,
    jobs NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Profiles_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- ACTION TABLE
CREATE TABLE Action (
    action_id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL,
    range VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- CATEGORY TABLE
CREATE TABLE Category (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    description NVARCHAR(255) NOT NULL
);

-- PROGRAMS TABLE
CREATE TABLE Programs (
    program_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    create_by INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    age_group VARCHAR(50),
    create_at DATETIME NOT NULL DEFAULT GETDATE(),
    category_id INT,

    CONSTRAINT FK_Programs_Users FOREIGN KEY (create_by)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Programs_Category FOREIGN KEY (category_id)
        REFERENCES Category(category_id)
        ON DELETE SET NULL
);

-- ASSESSMENTS TABLE
CREATE TABLE Assessments (
    assessment_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    result_json NVARCHAR(MAX) NULL,
    create_at DATETIME NOT NULL DEFAULT GETDATE(),
    action_id INT,

    CONSTRAINT FK_Assessments_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Assessments_Action FOREIGN KEY (action_id)
        REFERENCES Action(action_id)
        ON DELETE SET NULL
);

-- INSERT USERS
INSERT INTO Users (role, password, status, email)
VALUES 
('member', 'hashed_password1', 'active', 'customer1@example.com'),
('staff', 'hashed_password2', 'active', 'staff1@example.com'),
('consultant', 'hashed_password3', 'active', 'consultant1@example.com'),
('manager', 'hashed_password4', 'inactive', 'manager1@example.com'),
('admin', 'hashed_password5', 'active', 'admin1@example.com');

-- INSERT PROFILES
INSERT INTO Profiles (user_id, name, certification, work_hours_json, bio_json, date_of_birth, jobs)
VALUES
(1, N'Anna Nguyen', NULL, NULL, N'{"bio": "University student interested in self-help"}', '2002-05-21', N'Student'),
(2, N'Bao Tran', NULL, N'{"mon-fri": "08:30-17:30"}', N'{"experience": "1 year handling support tickets"}', '1995-10-12', N'Teacher'),
(3, N'Chi Le', N'Certified Cognitive Behavioral Therapist', NULL, N'{"specialty": "CBT for young adults"}', '1990-03-18', N'Psychologist'),
(4, N'Dat Pham', N'Master of Public Health', NULL, N'{"note": "Leads consultant team"}', '1985-07-09', N'Clinical Manager'),
(5, N'Emily Do', NULL, NULL, N'{"role": "System administrator"}', '1988-12-01', NULL);

-- INSERT ACTIONS
INSERT INTO Action (description, range, type)
VALUES 
(N'Refer to specialist for substance abuse', 'High', 'ASSIST'),
(N'Monitor periodically', 'Moderate', 'ASSIST'),
(N'No intervention needed', 'Low', 'ASSIST'),
(N'Follow up with counseling', 'Moderate', 'STAFF');

-- INSERT CATEGORIES
INSERT INTO Category (description)
VALUES 
(N'Substance Use Awareness'),
(N'Mental Health Support'),
(N'Youth Development');

-- INSERT PROGRAMS
INSERT INTO Programs (title, description, create_by, status, age_group, create_at, category_id)
VALUES 
(N'Substance Use Recovery Path', N'12-week guided counseling for moderate to severe users.', 4, 'active', '18-35', GETDATE(), 1),
(N'Teen Drug Awareness Program', N'Educational support for teens at risk.', 4, 'active', '13-19', GETDATE(), 1);

-- INSERT ASSESSMENTS
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id)
VALUES 
(1, 'ASSIST', N'{"alcohol": 5, "cannabis": 2, "tobacco": 0}', GETDATE(), 2),
(2, 'STAFF', N'{"stress_level": "moderate", "burnout_risk": "low"}', GETDATE(), 4),
(3, 'ASSIST', N'{"alcohol": 1, "cannabis": 0, "tobacco": 0}', GETDATE(), 3),
(4, 'STAFF', N'{"stress_level": "high", "burnout_risk": "moderate"}', GETDATE(), 4);
