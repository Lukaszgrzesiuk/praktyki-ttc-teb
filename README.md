# praktyki-ttc-teb
Koziarski Damian
Mołczan Krystian
Michalak Szymon
Mateusz Ryba
Adrian Zając
Łukasz Grzesiuk
Michał Węglarz

Stage them one afther another - Don't do them all at the same time.. !!!

-- 1. Tworzenie bazy danych
CREATE DATABASE Login_panel;
GO

-- Przełączenie się na nową bazę
USE Login_panel;
GO

-- 2. Tworzenie tabeli użytkowników
CREATE TABLE dbo.user_registration (
    user_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    login_name VARCHAR(50) NOT NULL,
    password_val VARCHAR(255) NOT NULL,
    registration_date DATETIME NULL DEFAULT GETDATE()
);
GO

-- 3. Tworzenie tabeli grup
CREATE TABLE dbo.Groups (
    group_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    group_name NVARCHAR(100) NOT NULL,
    creation_date DATETIME NULL DEFAULT GETDATE()
);
GO

-- 4. NEW: Tworzenie tabeli łączącej użytkowników z grupami (Many-to-Many)
CREATE TABLE dbo.UserGroups (
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    PRIMARY KEY (user_id, group_id),
    CONSTRAINT FK_UserGroups_User FOREIGN KEY (user_id) REFERENCES dbo.user_registration(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_UserGroups_Group FOREIGN KEY (group_id) REFERENCES dbo.Groups(group_id) ON DELETE CASCADE
);
GO

-- 5. NEW: Wstawienie ukrytej grupy 'admin' do weryfikacji uprawnień
INSERT INTO dbo.Groups (group_name) VALUES ('admin');
GO

-- 6. Tworzenie tabeli notatek (z relacjami i ocenami)
CREATE TABLE dbo.Notes (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NULL,
    Permissions NVARCHAR(50) NULL,
    Author NVARCHAR(50) NULL,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
    PhotoUrl NVARCHAR(MAX) NULL,
    VideoUrl NVARCHAR(MAX) NULL,
    AudioUrl NVARCHAR(MAX) NULL,
    
    -- Klucze obce
    group_id INT NULL,
    author_id INT NULL,
    
    -- Oceny (z zabezpieczeniem wartości od 1 do 10)
    HelpfulnessRating TINYINT NULL CHECK (HelpfulnessRating >= 1 AND HelpfulnessRating <= 10),
    CreationEaseRating TINYINT NULL CHECK (CreationEaseRating >= 1 AND CreationEaseRating <= 10),

    -- Definicje relacji (klucze obce)
    CONSTRAINT FK_Notes_Groups FOREIGN KEY (group_id) REFERENCES dbo.Groups(group_id) ON DELETE SET NULL,
    CONSTRAINT FK_Notes_UserRegistration FOREIGN KEY (author_id) REFERENCES dbo.user_registration(user_id) ON DELETE SET NULL
);
GO