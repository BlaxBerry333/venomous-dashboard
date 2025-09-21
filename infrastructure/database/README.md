# Django 风格数据库管理系统

## 概述

为 Venomous Dashboard 项目设计的 Django 风格数据库管理系统，提供熟悉的命令接口和统一的管理体验。

## 📁 目录结构

```
infrastructure/database/
├── db-init.sh              # 🎯 Docker 容器初始化脚本（仅首次运行）
├── db-commands.sh          # 🎯 Django 风格数据库命令脚本
├── migrations/             # 迁移文件目录
│   └── 001_create_roles_table.sql
└── README.md               # 本文档
```

## 🔄 工作流程

### 数据库初始化
1. **容器创建**: PostgreSQL 容器首次启动时，`db-init.sh` 自动运行
2. **数据库创建**: 创建所有微服务数据库和初始模式
3. **一次性**: 仅在数据库卷为空时运行

### Django 风格管理
1. **熟悉命令**: 使用 Django 风格的命令（migrate, showmigrations, makemigrations）
2. **版本化**: 每个迁移都有版本号（如 `001_`, `002_`）
3. **跟踪**: 已应用的迁移记录在 `schema_migrations` 表中
4. **幂等性**: 迁移可以安全地多次运行

## 📖 使用方法

### 🎯 Makefile 命令（推荐）

```bash
# 查看迁移状态（类似 Django showmigrations）
make db-status

# 应用数据库迁移（类似 Django migrate）
make db-migrate

# 初始化数据库架构（类似 Django migrate --run-syncdb）
make db-sync

# 显示当前架构版本
make db-version
```

### 🔧 进入容器进行高级操作

```bash
# 进入数据库容器
make enter SERVICE=db

# 在容器内使用 Django 风格命令
./infrastructure/database/db-commands.sh help
./infrastructure/database/db-commands.sh makemigrations "add user preferences"
./infrastructure/database/db-commands.sh showmigrations
./infrastructure/database/db-commands.sh migrate
```

### 📋 db-commands.sh Django 风格命令

```bash
# 直接使用脚本（需要容器运行）
./infrastructure/database/db-commands.sh showmigrations     # 显示迁移状态
./infrastructure/database/db-commands.sh migrate           # 应用迁移
./infrastructure/database/db-commands.sh makemigrations "desc" # 创建迁移
./infrastructure/database/db-commands.sh version           # 显示版本
./infrastructure/database/db-commands.sh dbsync            # 同步数据库
./infrastructure/database/db-commands.sh flush             # 清空数据库
./infrastructure/database/db-commands.sh help              # 显示帮助
```

## 💡 最佳实践

### 🔄 迁移管理流程

#### 1. 创建新迁移（类似 Django makemigrations）
```bash
# 进入容器创建迁移（推荐）
make enter SERVICE=db
./infrastructure/database/db-commands.sh makemigrations "add user preferences table"
```

#### 2. 编辑迁移文件
```sql
-- Migration: 002_add_user_preferences.sql
-- Description: Add user preferences table

\c venomous_auth_db;

\echo 'Running migration 002: Add user preferences...'

-- 添加你的 SQL
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 记录迁移
INSERT INTO schema_migrations (version, description) VALUES
    ('002', 'Add user preferences table')
ON CONFLICT (version) DO NOTHING;

\echo 'Migration 002 completed!'
```

#### 3. 应用迁移（类似 Django migrate）
```bash
make db-migrate
```

## 🎯 Django 命令对照

| Django 命令 | 我们的命令 | 说明 |
|------------|----------|------|
| `python manage.py showmigrations` | `make db-status` | 显示迁移状态 |
| `python manage.py migrate` | `make db-migrate` | 应用迁移 |
| `python manage.py makemigrations` | `db-commands.sh makemigrations` | 创建迁移 |
| `python manage.py migrate --run-syncdb` | `make db-sync` | 同步数据库架构 |
| `python manage.py flush` | `db-commands.sh flush` | 清空数据库 |

## 🎯 常见问题

### Q: 为什么使用 Django 风格的命令？
**A**: Django 的数据库管理命令直观易懂，被广泛认知，降低学习成本。

### Q: showmigrations 显示什么？
**A**: 类似 Django，显示所有迁移及其状态：
```
auth:
 [X] 001 create_roles_table
 [ ] 002 add_user_preferences
```

### Q: makemigrations 和 migrate 的区别？
**A**:
- `makemigrations`: 创建新的迁移文件（需要手动编辑 SQL）
- `migrate`: 应用未运行的迁移到数据库

### Q: 数据库初始化时机？
**A**: `db-init.sh` 只在 Docker 容器**首次创建**时自动执行。

## 🚀 快速开始

```bash
# 查看迁移状态（Django showmigrations）
make db-status

# 进入容器进行高级操作
make enter SERVICE=db
./infrastructure/database/db-commands.sh help
```