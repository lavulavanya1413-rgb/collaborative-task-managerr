CREATE DATABASE IF NOT EXISTS collaborative_task_manager;

USE collaborative_task_manager;

-- 1. Users and roles
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('manager', 'user', 'developer', 'qa_tester')
        NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Sprints
CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    sprint_name VARCHAR(100) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('Planned', 'Active', 'Closed')
        DEFAULT 'Planned',
    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE
);

-- 4. Requirements
CREATE TABLE requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    requirement_code VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    acceptance_criteria TEXT,
    priority ENUM('Low', 'Medium', 'High', 'Critical')
        DEFAULT 'Medium',
    status ENUM('Draft', 'Approved', 'In Development',
                'In QA', 'Completed') DEFAULT 'Draft',
    owner_id INT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    UNIQUE (project_id, requirement_code)
);

-- 5. Tasks
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id INT,
    sprint_id INT,
    requirement_id INT,
    created_by INT NOT NULL,
    assigned_to INT,
    priority ENUM('Low', 'Medium', 'High', 'Critical')
        DEFAULT 'Medium',
    status ENUM('Backlog', 'To Do', 'In Progress',
                'Code Review', 'Ready for QA',
                'Completed', 'Rework') DEFAULT 'To Do',
    start_date DATE,
    due_date DATE,
    estimated_hours DECIMAL(7,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE SET NULL,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
        ON DELETE SET NULL,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id)
        ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
        ON DELETE SET NULL,
    INDEX idx_task_assignee (assigned_to),
    INDEX idx_task_status (status),
    INDEX idx_task_due_date (due_date)
);

-- 6. Task activity history
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    INDEX idx_activity_task (task_id, created_at)
);

-- 7. QA test cases
CREATE TABLE test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_code VARCHAR(30) NOT NULL UNIQUE,
    requirement_id INT NOT NULL,
    created_by INT NOT NULL,
    scenario TEXT NOT NULL,
    preconditions TEXT,
    steps TEXT,
    test_data TEXT,
    expected_result TEXT,
    priority ENUM('Low', 'Medium', 'High', 'Critical')
        DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id)
        ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 8. Test execution history
CREATE TABLE test_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_id INT NOT NULL,
    task_id INT,
    tester_id INT NOT NULL,
    build_version VARCHAR(100),
    environment VARCHAR(100),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actual_result TEXT,
    evidence_url TEXT,
    status ENUM('Not Run', 'Pass', 'Fail', 'Blocked')
        DEFAULT 'Not Run',
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE SET NULL,
    FOREIGN KEY (tester_id) REFERENCES users(id)
);

-- 9. Bugs and defects
CREATE TABLE bugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bug_code VARCHAR(30) NOT NULL UNIQUE,
    test_run_id INT,
    task_id INT,
    requirement_id INT,
    assigned_developer INT,
    summary VARCHAR(255) NOT NULL,
    reproduction_steps TEXT,
    expected_result TEXT,
    actual_result TEXT,
    severity ENUM('Low', 'Medium', 'High', 'Critical')
        DEFAULT 'Medium',
    priority ENUM('Low', 'Medium', 'High', 'Critical')
        DEFAULT 'Medium',
    status ENUM('Open', 'Assigned', 'In Progress',
                'Fixed', 'Ready for Retest',
                'Closed', 'Reopened') DEFAULT 'Open',
    fix_notes TEXT,
    pull_request_url VARCHAR(500),
    evidence_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_run_id) REFERENCES test_runs(id)
        ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE SET NULL,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id)
        ON DELETE SET NULL,
    FOREIGN KEY (assigned_developer) REFERENCES users(id)
        ON DELETE SET NULL
);

SHOW TABLES;
