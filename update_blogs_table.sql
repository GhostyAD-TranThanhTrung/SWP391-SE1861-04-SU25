-- Add metadata_json column to Blogs table if it doesn't exist
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Blogs' 
    AND COLUMN_NAME = 'metadata_json'
)
BEGIN
    ALTER TABLE Blogs
    ADD metadata_json NVARCHAR(MAX) NULL;
    
    PRINT 'metadata_json column added to Blogs table';
END
ELSE
BEGIN
    PRINT 'metadata_json column already exists in Blogs table';
END

-- Check if img_link column exists, add if it doesn't
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Blogs' 
    AND COLUMN_NAME = 'img_link'
)
BEGIN
    ALTER TABLE Blogs
    ADD img_link NVARCHAR(MAX) NULL;
    
    PRINT 'img_link column added to Blogs table';
END
ELSE
BEGIN
    PRINT 'img_link column already exists in Blogs table';
END 