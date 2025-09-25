# Auth 服务数据库设计

## 概述

使用 PostgreSQL 和 RBAC 系统。用户业务数据与认证凭证分离存储。

## 表结构

### `users` - 用户业务信息

| 字段          | 类型        | 约束          | 描述       |
| ------------- | ----------- | ------------- | ---------- |
| `id`          | UUID        | PRIMARY KEY   | 用户标识符 |
| `email`       | VARCHAR     | UNIQUE        | 邮箱地址   |
| `name`        | VARCHAR     | NOT NULL      | 显示名称   |
| `avatar_path` | TEXT        | NULLABLE      | 头像路径   |
| `role_id`     | UUID        | FK → roles.id | 用户角色   |
| `created_at`  | TIMESTAMPTZ | NOT NULL      | 创建时间   |
| `updated_at`  | TIMESTAMPTZ | NOT NULL      | 更新时间   |
| `deleted_at`  | TIMESTAMPTZ | NULLABLE      | 软删除     |

### `auth_users` - 认证数据

| 字段                  | 类型        | 约束          | 描述         |
| --------------------- | ----------- | ------------- | ------------ |
| `id`                  | UUID        | PRIMARY KEY   | 认证记录 ID  |
| `user_id`             | UUID        | FK → users.id | 用户引用     |
| `email`               | VARCHAR     | NOT NULL      | 认证邮箱     |
| `password_hash`       | VARCHAR     | NOT NULL      | Bcrypt 哈希  |
| `email_verified`      | BOOLEAN     | DEFAULT FALSE | 邮箱验证状态 |
| `last_login`          | TIMESTAMPTZ | NULLABLE      | 最后登录     |
| `login_failure_count` | INTEGER     | DEFAULT 0     | 失败次数     |
| `is_login_locked`     | BOOLEAN     | DEFAULT FALSE | 锁定状态     |
| `deleted_at`          | TIMESTAMPTZ | NULLABLE      | 软删除       |

### `roles` - 角色权限

| 字段          | 类型        | 约束        | 描述       |
| ------------- | ----------- | ----------- | ---------- |
| `id`          | UUID        | PRIMARY KEY | 角色标识符 |
| `name`        | VARCHAR     | UNIQUE      | 角色名称   |
| `description` | TEXT        | NULLABLE    | 角色描述   |
| `created_at`  | TIMESTAMPTZ | NOT NULL    | 创建时间   |
| `updated_at`  | TIMESTAMPTZ | NOT NULL    | 更新时间   |
| `deleted_at`  | TIMESTAMPTZ | NULLABLE    | 软删除     |

| 角色       | 名称          | 权限     |
| ---------- | ------------- | -------- |
| 用户       | `user`        | 基本访问 |
| 管理员     | `admin`       | 用户管理 |
| 超级管理员 | `super_admin` | 完全访问 |

## 关系图

```
roles (1) → (*) users (1) ← → (1) auth_users
```

## 安全特性

### 密码安全

- **算法**：Bcrypt 可配置成本（默认：12）
- **存储**：仅哈希值，永不存储明文

### 账户保护

- **锁定**：5 次失败后锁定
- **自动解锁**：30 分钟
- **软删除**：数据保护
