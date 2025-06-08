-- DROP TABLES (in dependency-safe order)
DROP TABLE IF EXISTS Survey_Responses;
DROP TABLE IF EXISTS Surveys;
DROP TABLE IF EXISTS Content;
DROP TABLE IF EXISTS Enroll;
DROP TABLE IF EXISTS Programs;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Assessments;
DROP TABLE IF EXISTS Action;
DROP TABLE IF EXISTS console_log;
DROP TABLE IF EXISTS Ticket_Support;
DROP TABLE IF EXISTS Flags;
DROP TABLE IF EXISTS Blogs;
DROP TABLE IF EXISTS Profile;
DROP TABLE IF EXISTS Booking_Session;
DROP TABLE IF EXISTS Consultant_Slot;
DROP TABLE IF EXISTS Slot;
DROP TABLE IF EXISTS Consultant;
DROP TABLE IF EXISTS Users;

-- USERS
CREATE TABLE Users (
  user_id INT IDENTITY(1,1) PRIMARY KEY,
  date_create DATETIME NOT NULL DEFAULT GETDATE(),
  role VARCHAR(50) NOT NULL,
  password NVARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'banned')),
  email NVARCHAR(255) NOT NULL UNIQUE
);

-- CONSULTANT
CREATE TABLE Consultant (
  id_consultant INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  cost DECIMAL(10,2),
  certification NVARCHAR(MAX),
  bios NVARCHAR(MAX),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- SLOT
CREATE TABLE Slot (
  slot_id INT IDENTITY(1,1) PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- CONSULTANT_SLOT
CREATE TABLE Consultant_Slot (
  consultant_id INT NOT NULL,
  slot_id INT NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  PRIMARY KEY (consultant_id, slot_id, day_of_week),
  FOREIGN KEY (consultant_id) REFERENCES Consultant(id_consultant),
  FOREIGN KEY (slot_id) REFERENCES Slot(slot_id)
);

-- BOOKING_SESSION
CREATE TABLE Booking_Session (
  booking_id INT IDENTITY(1,1) PRIMARY KEY,
  consultant_id INT,
  member_id INT,
  slot_id INT,
  booking_date DATE NOT NULL,
  status VARCHAR(20),
  notes NVARCHAR(MAX),
  FOREIGN KEY (consultant_id) REFERENCES Consultant(id_consultant),
  FOREIGN KEY (member_id) REFERENCES Users(user_id),
  FOREIGN KEY (slot_id) REFERENCES Slot(slot_id)
);

-- PROFILE
CREATE TABLE Profile (
  user_id INT PRIMARY KEY,
  name NVARCHAR(100),
  bio_json NVARCHAR(MAX),
  date_of_birth DATE,
  job NVARCHAR(MAX),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- BLOGS
CREATE TABLE Blogs (
  blog_id INT IDENTITY(1,1) PRIMARY KEY,
  author_id INT,
  title NVARCHAR(255),
  body NVARCHAR(MAX),
  created_at DATETIME,
  status VARCHAR(50),
  FOREIGN KEY (author_id) REFERENCES Users(user_id)
);

-- FLAGS
CREATE TABLE Flags (
  flag_id INT IDENTITY(1,1) PRIMARY KEY,
  blog_id INT,
  flagged_by INT,
  reason NVARCHAR(255),
  created_at DATETIME,
  FOREIGN KEY (blog_id) REFERENCES Blogs(blog_id),
  FOREIGN KEY (flagged_by) REFERENCES Users(user_id)
);

-- TICKET SUPPORT
CREATE TABLE Ticket_Support (
  ticket_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  content NVARCHAR(MAX),
  status VARCHAR(50),
  type VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- CONSOLE LOG
CREATE TABLE console_log (
  log_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  status VARCHAR(50),
  error_log NVARCHAR(MAX),
  date DATETIME,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ACTION
CREATE TABLE Action (
  action_id INT IDENTITY(1,1) PRIMARY KEY,
  description NVARCHAR(255),
  range VARCHAR(50),
  type VARCHAR(50)
);

-- ASSESSMENTS
CREATE TABLE Assessments (
  assessment_id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT,
  type VARCHAR(50),
  result_json NVARCHAR(MAX),
  create_at DATETIME,
  action_id INT,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (action_id) REFERENCES Action(action_id)
);

-- CATEGORY
CREATE TABLE Category (
  category_id INT IDENTITY(1,1) PRIMARY KEY,
  description NVARCHAR(255)
);

-- PROGRAMS
CREATE TABLE Programs (
  program_id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255),
  description NVARCHAR(MAX),
  create_by INT,
  status VARCHAR(50),
  age_group VARCHAR(50),
  create_at DATETIME,
  category_id INT,
  FOREIGN KEY (create_by) REFERENCES Users(user_id),
  FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

-- ENROLL
CREATE TABLE Enroll (
  user_id INT,
  program_id INT,
  start_at DATETIME,
  complete_at DATETIME,
  progress FLOAT,
  PRIMARY KEY (user_id, program_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- CONTENT
CREATE TABLE Content (
  content_id INT IDENTITY(1,1) PRIMARY KEY,
  program_id INT,
  content_json NVARCHAR(MAX),
  type VARCHAR(50),
  orders INT,
  FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- SURVEYS
CREATE TABLE Surveys (
  survey_id INT IDENTITY(1,1) PRIMARY KEY,
  program_id INT,
  type VARCHAR(50),
  questions_json NVARCHAR(MAX),
  FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- SURVEY RESPONSES
CREATE TABLE Survey_Responses (
  response_id INT IDENTITY(1,1) PRIMARY KEY,
  survey_id INT,
  user_id INT,
  answer_json NVARCHAR(MAX),
  submitted_at DATETIME,
  FOREIGN KEY (survey_id) REFERENCES Surveys(survey_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
