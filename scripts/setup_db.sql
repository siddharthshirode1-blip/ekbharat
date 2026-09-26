-- ==============================================================================
-- Database Schema for Government AI Data Intelligence Platform
-- Target Database: government_ai
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS government_ai;
USE government_ai;

-- Drop existing tables for a clean rebuild in proper dependency order
DROP TABLE IF EXISTS financials;
DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS schemes;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS data_sources;

-- 1. Data Sources Register
CREATE TABLE data_sources (
    source_id VARCHAR(100) PRIMARY KEY, -- Handles text string IDs like 'SRC-9928'
    dataset_name VARCHAR(255) NOT NULL,
    ministry_name VARCHAR(255),
    department_name VARCHAR(255),
    official_source_url TEXT,
    data_period VARCHAR(100),
    source_updated_date VARCHAR(50) NULL,
    downloaded_date VARCHAR(50) NULL,
    original_file_name VARCHAR(255),
    file_format VARCHAR(20),
    description TEXT,
    notes TEXT
) ENGINE=InnoDB;

-- 2. Departments
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(200) NOT NULL UNIQUE,
    department_code VARCHAR(50),
    ministry_name VARCHAR(200)
) ENGINE=InnoDB;

-- 3. Schemes
CREATE TABLE schemes (
    scheme_id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    scheme_code VARCHAR(100),
    department_id INT,
    scheme_type VARCHAR(100),
    description TEXT,
    source_id VARCHAR(100),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Locations
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    village VARCHAR(150),
    pincode VARCHAR(20),
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    UNIQUE KEY uq_location (state, district, taluka, village)
) ENGINE=InnoDB;

-- 5. Projects
CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(100),
    project_name VARCHAR(255) NOT NULL,
    department_id INT,
    scheme_id INT,
    location_id INT,
    status VARCHAR(50) DEFAULT 'UNKNOWN',
    original_status VARCHAR(100),
    start_date DATE NULL,
    expected_completion_date DATE NULL,
    actual_completion_date DATE NULL,
    last_updated DATE NULL,
    source_id VARCHAR(100),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Beneficiaries
CREATE TABLE beneficiaries (
    beneficiary_record_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    scheme_id INT,
    location_id INT,
    beneficiary_count INT DEFAULT 0,
    beneficiary_category VARCHAR(150),
    financial_year VARCHAR(20),
    source_id VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Financials
CREATE TABLE financials (
    financial_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    scheme_id INT,
    financial_year VARCHAR(20) NOT NULL,
    budget_allocated DECIMAL(15, 2) DEFAULT 0.00,
    amount_released DECIMAL(15, 2) DEFAULT 0.00,
    amount_spent DECIMAL(15, 2) DEFAULT 0.00,
    source_id VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES data_sources(source_id) ON DELETE SET NULL
) ENGINE=InnoDB;
