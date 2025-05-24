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

    CONSTRAINT FK_Profiles_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

INSERT INTO Users (role, password, status, email)
VALUES 
('customer', 'hashed_password_1', 'active', 'alice@example.com'),
('staff', 'hashed_password_2', 'active', 'bob@example.com'),
('consultant', 'hashed_password_3', 'inactive', 'carol@example.com'),
('manager', 'hashed_password_4', 'active', 'dave@example.com'),
('admin', 'hashed_password_5', 'banned', 'eve@example.com');

INSERT INTO Profiles (user_id, name, certification, work_hours_json, bio_json, date_of_birth)
VALUES
(1, 'Alice Nguyen', NULL, NULL, '{"bio": "Customer since 2023"}', '1990-05-10'),
(2, 'Bob Tran', NULL, '{"monday": "9-5", "friday": "9-3"}', '{"bio": "Support staff"}', '1985-09-15'),
(3, 'Carol Le', 'Certified Consultant ABC', NULL, '{"bio": "Expert in career guidance"}', '1992-03-22'),
(4, 'Dave Pham', 'Management Certificate XYZ', NULL, '{"bio": "Oversees team performance"}', '1980-11-02'),
(5, 'Eve Dao', NULL, NULL, '{"bio": "System administrator"}', '1988-07-30');