# Auth Service Database Design

## Overview

PostgreSQL with RBAC system. Separates user business data from authentication credentials.

## Schema

### `users` - Business Information

| Column        | Type        | Constraints   | Description     |
| ------------- | ----------- | ------------- | --------------- |
| `id`          | UUID        | PRIMARY KEY   | User identifier |
| `email`       | VARCHAR     | UNIQUE        | Email address   |
| `name`        | VARCHAR     | NOT NULL      | Display name    |
| `avatar_path` | TEXT        | NULLABLE      | Avatar path     |
| `role_id`     | UUID        | FK → roles.id | User role       |
| `created_at`  | TIMESTAMPTZ | NOT NULL      | Creation time   |
| `updated_at`  | TIMESTAMPTZ | NOT NULL      | Update time     |
| `deleted_at`  | TIMESTAMPTZ | NULLABLE      | Soft delete     |

### `auth_users` - Authentication Data

| Column                | Type        | Constraints   | Description     |
| --------------------- | ----------- | ------------- | --------------- |
| `id`                  | UUID        | PRIMARY KEY   | Auth record ID  |
| `user_id`             | UUID        | FK → users.id | User reference  |
| `email`               | VARCHAR     | NOT NULL      | Email for auth  |
| `password_hash`       | VARCHAR     | NOT NULL      | Bcrypt hash     |
| `email_verified`      | BOOLEAN     | DEFAULT FALSE | Email status    |
| `last_login`          | TIMESTAMPTZ | NULLABLE      | Last login      |
| `login_failure_count` | INTEGER     | DEFAULT 0     | Failed attempts |
| `is_login_locked`     | BOOLEAN     | DEFAULT FALSE | Lock status     |
| `deleted_at`          | TIMESTAMPTZ | NULLABLE      | Soft delete     |

### `roles` - Access Control

| Column        | Type        | Constraints | Description      |
| ------------- | ----------- | ----------- | ---------------- |
| `id`          | UUID        | PRIMARY KEY | Role identifier  |
| `name`        | VARCHAR     | UNIQUE      | Role name        |
| `description` | TEXT        | NULLABLE    | Role description |
| `created_at`  | TIMESTAMPTZ | NOT NULL    | Creation time    |
| `updated_at`  | TIMESTAMPTZ | NOT NULL    | Update time      |
| `deleted_at`  | TIMESTAMPTZ | NULLABLE    | Soft delete      |

| Role        | Name          | Permissions     |
| ----------- | ------------- | --------------- |
| User        | `user`        | Basic access    |
| Admin       | `admin`       | User management |
| Super Admin | `super_admin` | Full access     |

## Relationships

```
roles (1) → (*) users (1) ← → (1) auth_users
```

## Security Features

### Password Security

- **Algorithm**: Bcrypt with configurable cost (default: 12)
- **Storage**: Hash only, never plain text

### Account Protection

- **Lock**: After 5 failed attempts
- **Auto-unlock**: 30 minutes
- **Soft delete**: Data preservation
