# Authorization Service Database Design

## 概述

授权服务使用 PostgreSQL 数据库存储用户身份验证和授权数据。数据库设计采用分离关注点的原则，将用户信息、认证数据、角色权限分开管理。

## 数据库连接

- **数据库名**: `venomous_auth_db`
- **连接字符串**: `postgresql://venomous_dashboard_db:venomous@db:5432/venomous_auth_db`
- **ORM**: Diesel (Rust)

## 表结构设计

### 1. users (用户基础信息)

存储用户的基本信息，与认证数据分离。

| 字段       | 类型         | 约束            | 说明         |
| ---------- | ------------ | --------------- | ------------ |
| id         | UUID         | PRIMARY KEY     | 用户唯一标识 |
| email      | VARCHAR(255) | UNIQUE NOT NULL | 用户邮箱     |
| name       | VARCHAR(255) | NOT NULL        | 用户姓名     |
| avatar     | TEXT         | NULLABLE        | 头像 URL     |
| locale     | VARCHAR(10)  | DEFAULT 'en'    | 用户语言偏好 |
| timezone   | VARCHAR(50)  | NULLABLE        | 用户时区     |
| created_at | TIMESTAMPTZ  | DEFAULT NOW()   | 创建时间     |
| updated_at | TIMESTAMPTZ  | DEFAULT NOW()   | 更新时间     |

**设计理念**: 分离用户基础信息与认证信息，便于扩展和维护。

### 2. auth_users (认证数据)

存储用户的认证相关信息，包括密码、登录状态等。

| 字段                  | 类型         | 约束            | 说明             |
| --------------------- | ------------ | --------------- | ---------------- |
| id                    | UUID         | PRIMARY KEY     | 认证记录唯一标识 |
| user_id               | UUID         | FK(users.id)    | 关联的用户 ID    |
| email                 | VARCHAR(255) | UNIQUE NOT NULL | 认证邮箱         |
| password_hash         | VARCHAR(255) | NOT NULL        | bcrypt 密码哈希  |
| email_verified        | BOOLEAN      | DEFAULT FALSE   | 邮箱验证状态     |
| last_login            | TIMESTAMPTZ  | NULLABLE        | 最后登录时间     |
| failed_login_attempts | INTEGER      | DEFAULT 0       | 失败登录次数     |
| account_locked_until  | TIMESTAMPTZ  | NULLABLE        | 账户锁定截止时间 |
| created_at            | TIMESTAMPTZ  | DEFAULT NOW()   | 创建时间         |
| updated_at            | TIMESTAMPTZ  | DEFAULT NOW()   | 更新时间         |

**安全特性**:

- 密码使用 bcrypt 哈希存储
- 支持账户锁定机制防止暴力破解
- 记录登录失败次数

### 3. user_profiles (用户扩展信息)

存储用户的详细档案信息。

| 字段       | 类型         | 约束          | 说明          |
| ---------- | ------------ | ------------- | ------------- |
| id         | UUID         | PRIMARY KEY   | 档案唯一标识  |
| user_id    | UUID         | FK(users.id)  | 关联的用户 ID |
| bio        | TEXT         | NULLABLE      | 用户简介      |
| phone      | VARCHAR(20)  | NULLABLE      | 电话号码      |
| company    | VARCHAR(255) | NULLABLE      | 公司信息      |
| website    | VARCHAR(255) | NULLABLE      | 个人网站      |
| created_at | TIMESTAMPTZ  | DEFAULT NOW() | 创建时间      |
| updated_at | TIMESTAMPTZ  | DEFAULT NOW() | 更新时间      |

### 4. roles (角色定义)

定义系统中的各种角色。

| 字段        | 类型        | 约束            | 说明         |
| ----------- | ----------- | --------------- | ------------ |
| id          | UUID        | PRIMARY KEY     | 角色唯一标识 |
| name        | VARCHAR(50) | UNIQUE NOT NULL | 角色名称     |
| description | TEXT        | NULLABLE        | 角色描述     |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()   | 创建时间     |

**默认角色**:

- `admin`: 管理员，拥有完全访问权限
- `user`: 普通用户，基础访问权限

### 5. permissions (权限定义)

定义系统中的各种权限。

| 字段       | 类型        | 约束            | 说明         |
| ---------- | ----------- | --------------- | ------------ |
| id         | UUID        | PRIMARY KEY     | 权限唯一标识 |
| name       | VARCHAR(50) | UNIQUE NOT NULL | 权限名称     |
| resource   | VARCHAR(50) | NOT NULL        | 资源类型     |
| action     | VARCHAR(50) | NOT NULL        | 操作类型     |
| created_at | TIMESTAMPTZ | DEFAULT NOW()   | 创建时间     |

**权限格式**: `{action}_{resource}` (如: `read_users`, `write_admin`)

**默认权限**:

- `read_users`: 读取用户信息
- `write_users`: 修改用户信息
- `delete_users`: 删除用户
- `read_admin`: 访问管理功能
- `write_admin`: 修改管理配置

### 6. user_roles (用户角色关联)

多对多关系表，关联用户和角色。

| 字段        | 类型        | 约束          | 说明     |
| ----------- | ----------- | ------------- | -------- |
| user_id     | UUID        | FK(users.id)  | 用户 ID  |
| role_id     | UUID        | FK(roles.id)  | 角色 ID  |
| assigned_at | TIMESTAMPTZ | DEFAULT NOW() | 分配时间 |

**主键**: (user_id, role_id)

### 7. role_permissions (角色权限关联)

多对多关系表，关联角色和权限。

| 字段          | 类型 | 约束               | 说明    |
| ------------- | ---- | ------------------ | ------- |
| role_id       | UUID | FK(roles.id)       | 角色 ID |
| permission_id | UUID | FK(permissions.id) | 权限 ID |

**主键**: (role_id, permission_id)

## 索引设计

为了优化查询性能，创建了以下索引：

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_auth_users_email ON auth_users(email);
CREATE INDEX idx_auth_users_user_id ON auth_users(user_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

## 关系图

```
users (1) ←→ (1) auth_users
users (1) ←→ (1) user_profiles
users (M) ←→ (N) roles (通过 user_roles)
roles (M) ←→ (N) permissions (通过 role_permissions)
```

## 安全考虑

1. **密码安全**: 使用 bcrypt 哈希存储密码
2. **账户保护**: 支持账户锁定机制
3. **数据分离**: 认证数据与用户基础信息分离
4. **权限控制**: 基于角色的访问控制(RBAC)
5. **外键约束**: 确保数据一致性

## 扩展性设计

1. **多租户支持**: 可通过添加 tenant_id 字段支持多租户
2. **审计日志**: 可添加操作日志表记录用户行为
3. **第三方登录**: 可扩展 OAuth 提供商表
4. **会话管理**: 可添加用户会话表管理 JWT 令牌
