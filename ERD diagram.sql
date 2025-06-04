-- USERS
CREATE TABLE [Users] (
  [user_id] INT PRIMARY KEY IDENTITY(1, 1),
  [date_create] DATETIME NOT NULL DEFAULT (GETDATE()),
  [role] VARCHAR(50) NOT NULL,
  [password] NVARCHAR(255) NOT NULL,
  [status] VARCHAR(20) NOT NULL,
  [email] NVARCHAR(255) UNIQUE NOT NULL
);
GO

-- PROFILE
CREATE TABLE [Profile] (
  [user_id] INT PRIMARY KEY,
  [name] NVARCHAR(100),
  [certification] NVARCHAR(255),
  [works_hours_json] NVARCHAR(MAX),
  [bio_json] NVARCHAR(MAX),
  [date_of_birth] DATE,
  [job] NVARCHAR(MAX),
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id]) ON DELETE CASCADE
);
GO

-- CONSULTATIONS
CREATE TABLE [Consultations] (
  [consultation_id] INT PRIMARY KEY IDENTITY(1, 1),
  [scheduled_time] DATETIME,
  [meeting_link] NVARCHAR(255),
  [note] NVARCHAR(MAX),
  [status] VARCHAR(20)
);
GO

-- BOOKED CONSULTATION SESSION
CREATE TABLE [Book_Consultation_Session] (
  [consultation_id] INT,
  [session_number] INT,
  [consultant_id] INT,
  [member_id] INT,
  PRIMARY KEY ([consultation_id], [session_number], [consultant_id], [member_id]),
  FOREIGN KEY ([consultation_id]) REFERENCES [Consultations] ([consultation_id]),
  FOREIGN KEY ([consultant_id]) REFERENCES [Users] ([user_id]),
  FOREIGN KEY ([member_id]) REFERENCES [Users] ([user_id])
);
GO

-- BLOGS
CREATE TABLE [Blogs] (
  [blog_id] INT PRIMARY KEY IDENTITY(1, 1),
  [author_id] INT,
  [title] NVARCHAR(255),
  [content] NVARCHAR(MAX),
  [created_at] DATETIME,
  [status] VARCHAR(50),
  FOREIGN KEY ([author_id]) REFERENCES [Users] ([user_id])
);
GO

-- FLAGS
CREATE TABLE [Flags] (
  [flag_id] INT PRIMARY KEY IDENTITY(1, 1),
  [blog_id] INT,
  [flagged_by] INT,
  [reason] NVARCHAR(255),
  [created_at] DATETIME,
  FOREIGN KEY ([blog_id]) REFERENCES [Blogs] ([blog_id]),
  FOREIGN KEY ([flagged_by]) REFERENCES [Users] ([user_id])
);
GO

-- TICKET SUPPORT
CREATE TABLE [Ticket_Support] (
  [ticket_id] INT PRIMARY KEY IDENTITY(1, 1),
  [user_id] INT,
  [content] NVARCHAR(MAX),
  [status] VARCHAR(50),
  [type] VARCHAR(50),
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
);
GO

-- CONSOLE LOG
CREATE TABLE [console_log] (
  [log_id] INT PRIMARY KEY IDENTITY(1, 1),
  [user_id] INT,
  [action] VARCHAR(100),
  [status] VARCHAR(50),
  [error_log] NVARCHAR(MAX),
  [date] DATETIME,
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
);
GO

-- ACTIONS
CREATE TABLE [Action] (
  [action_id] INT PRIMARY KEY IDENTITY(1, 1),
  [description] NVARCHAR(255),
  [range] VARCHAR(50),
  [type] VARCHAR(50)
);
GO

-- ASSESSMENTS
CREATE TABLE [Assessments] (
  [assessment_id] INT PRIMARY KEY IDENTITY(1, 1),
  [user_id] INT,
  [type] VARCHAR(50),
  [result_json] NVARCHAR(MAX),
  [create_at] DATETIME,
  [action_id] INT,
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id]),
  FOREIGN KEY ([action_id]) REFERENCES [Action] ([action_id])
);
GO

-- CATEGORY
CREATE TABLE [Category] (
  [category_id] INT PRIMARY KEY IDENTITY(1, 1),
  [description] NVARCHAR(255)
);
GO

-- PROGRAMS
CREATE TABLE [Programs] (
  [program_id] INT PRIMARY KEY IDENTITY(1, 1),
  [title] NVARCHAR(255),
  [description] NVARCHAR(MAX),
  [create_by] INT,
  [status] VARCHAR(50),
  [age_group] VARCHAR(50),
  [create_at] DATETIME,
  [category_id] INT,
  FOREIGN KEY ([create_by]) REFERENCES [Users] ([user_id]),
  FOREIGN KEY ([category_id]) REFERENCES [Category] ([category_id])
);
GO

-- ENROLL
CREATE TABLE [Enroll] (
  [user_id] INT,
  [program_id] INT,
  [start_at] DATETIME,
  [complete_at] DATETIME,
  [progress] FLOAT,
  PRIMARY KEY ([user_id], [program_id]),
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id]),
  FOREIGN KEY ([program_id]) REFERENCES [Programs] ([program_id])
);
GO

-- CONTENT
CREATE TABLE [Content] (
  [content_id] INT PRIMARY KEY IDENTITY(1, 1),
  [program_id] INT,
  [content_json] NVARCHAR(MAX),
  [type] VARCHAR(50),
  [order] INT,
  FOREIGN KEY ([program_id]) REFERENCES [Programs] ([program_id])
);
GO

-- SURVEYS
CREATE TABLE [Surveys] (
  [survey_id] INT PRIMARY KEY IDENTITY(1, 1),
  [program_id] INT,
  [type] VARCHAR(50),
  [questions_json] NVARCHAR(MAX),
  FOREIGN KEY ([program_id]) REFERENCES [Programs] ([program_id])
);
GO

-- SURVEY RESPONSES
CREATE TABLE [Survey_Responses] (
  [response_id] INT PRIMARY KEY IDENTITY(1, 1),
  [survey_id] INT,
  [user_id] INT,
  [answer_json] NVARCHAR(MAX),
  [submitted_at] DATETIME,
  FOREIGN KEY ([survey_id]) REFERENCES [Surveys] ([survey_id]),
  FOREIGN KEY ([user_id]) REFERENCES [Users] ([user_id])
);
GO

-- EXTENDED PROPERTIES
EXEC sp_addextendedproperty
  @name = N'Column_Description',
  @value = 'Values: active, inactive, banned',
  @level0type = N'Schema', @level0name = 'dbo',
  @level1type = N'Table',  @level1name = 'Users',
  @level2type = N'Column', @level2name = 'status';
GO

EXEC sp_addextendedproperty
  @name = N'Table_Description',
  @value = 'Supports multiple consultants and members per consultation session.',
  @level0type = N'Schema', @level0name = 'dbo',
  @level1type = N'Table',  @level1name = 'Book_Consultation_Session';
GO
