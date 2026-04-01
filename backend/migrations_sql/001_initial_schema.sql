/*
-- Initial schema generated from architecture document

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE,
    type VARCHAR(50) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    website VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by_admin_id UUID,
    subscription_plan_id UUID,
    blockchain_wallet_address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_picture_url VARCHAR(500),
    bio TEXT,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP,
    login_count INT DEFAULT 0,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    sso_provider VARCHAR(50),
    sso_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    enrollment_number VARCHAR(100) UNIQUE,
    enrollment_date DATE,
    class_id UUID,
    decentralized_id VARCHAR(255),
    did_document JSONB,
    total_certificates INT DEFAULT 0,
    active_certificates INT DEFAULT 0,
    revoked_certificates INT DEFAULT 0,
    total_skills INT DEFAULT 0,
    portfolio_public BOOLEAN DEFAULT FALSE,
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    employee_id VARCHAR(100) UNIQUE,
    department VARCHAR(100),
    specialization VARCHAR(255),
    qualification VARCHAR(255),
    experience_years INT,
    certification_authority_level BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by UUID,
    total_issued_certificates INT DEFAULT 0,
    total_students_taught INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    grade INT,
    section VARCHAR(10),
    teacher_id UUID,
    academic_year VARCHAR(50),
    start_date DATE,
    end_date DATE,
    student_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    industry_standard_code VARCHAR(100),
    nsqf_level INT,
    soc_code VARCHAR(50),
    difficulty_level VARCHAR(50) DEFAULT 'BEGINNER',
    icon_url VARCHAR(500),
    prerequisites JSONB,
    learning_outcomes JSONB,
    assessment_criteria JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    student_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    class_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    proficiency_level VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    certificate_number VARCHAR(100) UNIQUE,
    sequence_number INT,
    blockchain_network VARCHAR(50),
    contract_address VARCHAR(255),
    token_id VARCHAR(255),
    transaction_hash VARCHAR(255),
    issuance_block_number INT,
    gas_used INT,
    gas_price DECIMAL(20, 8),
    certificate_hash VARCHAR(255),
    qr_code_url VARCHAR(255),
    qr_code_id VARCHAR(255),
    public_access_token VARCHAR(255),
    public_url VARCHAR(500),
    verification_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'DRAFT',
    issued_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    revoking_admin_id UUID,
    ipfs_hash VARCHAR(255),
    metadata JSONB,
    verification_count INT DEFAULT 0,
    last_verified_at TIMESTAMP,
    share_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Additional tables would continue similarly...

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_organization ON certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_blockchain_hash ON certificates(transaction_hash);
*/
