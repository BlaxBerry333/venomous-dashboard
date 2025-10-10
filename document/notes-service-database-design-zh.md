# Notes 服务数据库设计

## 概述

使用 PostgreSQL 管理用户便签和文章章节。支持软删除和丰富的内容管理功能。

## 表结构

### `memos` - 快速便签

| 字段         | 类型        | 约束                        | 描述                       |
| ------------ | ----------- | --------------------------- | -------------------------- |
| `id`         | UUID        | PRIMARY KEY                 | 便签标识符                 |
| `user_id`    | UUID        | NOT NULL                    | 用户引用                   |
| `content`    | TEXT        | NOT NULL                    | 便签内容                   |
| `color`      | TEXT        | NOT NULL, DEFAULT '#FFF9C4' | 十六进制颜色（如 #FFF9C4） |
| `is_pinned`  | BOOLEAN     | NOT NULL, DEFAULT FALSE     | 置顶状态                   |
| `created_at` | TIMESTAMPTZ | NOT NULL                    | 创建时间                   |
| `updated_at` | TIMESTAMPTZ | NOT NULL                    | 更新时间                   |
| `deleted_at` | TIMESTAMPTZ | NULLABLE                    | 软删除                     |

**颜色调色板：**

- 淡黄色：`#FFF9C4`（默认）
- 淡绿色：`#C8E6C9`
- 淡粉红：`#F8BBD0`

### `articles` - 长文章内容

| 字段              | 类型        | 约束                      | 描述         |
| ----------------- | ----------- | ------------------------- | ------------ |
| `id`              | UUID        | PRIMARY KEY               | 文章标识符   |
| `user_id`         | UUID        | NOT NULL                  | 用户引用     |
| `title`           | TEXT        | NOT NULL                  | 文章标题     |
| `description`     | TEXT        | NULLABLE                  | 简要描述     |
| `cover_image_url` | TEXT        | NULLABLE                  | 封面图片 URL |
| `category`        | TEXT        | NULLABLE                  | 文章分类     |
| `status`          | TEXT        | NOT NULL, DEFAULT 'draft' | 状态         |
| `created_at`      | TIMESTAMPTZ | NOT NULL                  | 创建时间     |
| `updated_at`      | TIMESTAMPTZ | NOT NULL                  | 更新时间     |
| `deleted_at`      | TIMESTAMPTZ | NULLABLE                  | 软删除       |

**状态值：**

- `draft`：草稿中
- `published`：已发布
- `archived`：已归档

### `article_chapters` - 文章章节

| 字段             | 类型        | 约束                    | 描述       |
| ---------------- | ----------- | ----------------------- | ---------- |
| `id`             | UUID        | PRIMARY KEY             | 章节标识符 |
| `article_id`     | UUID        | NOT NULL, FK → articles | 父文章     |
| `title`          | TEXT        | NOT NULL                | 章节标题   |
| `content`        | TEXT        | NOT NULL                | 章节内容   |
| `chapter_number` | INTEGER     | NOT NULL                | 章节序号   |
| `word_count`     | INTEGER     | NOT NULL, DEFAULT 0     | 字数统计   |
| `created_at`     | TIMESTAMPTZ | NOT NULL                | 创建时间   |
| `updated_at`     | TIMESTAMPTZ | NOT NULL                | 更新时间   |
| `deleted_at`     | TIMESTAMPTZ | NULLABLE                | 软删除     |

## 关系图

```
articles (1) → (*) article_chapters
```

- 一篇文章可以有多个章节
- 章节按 `chapter_number` 排序
- 删除文章会软删除所有关联章节

## 索引

推荐的性能优化索引：

```sql
-- Memos 便签
CREATE INDEX idx_memos_user_id ON memos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_memos_pinned ON memos(user_id, is_pinned, updated_at) WHERE deleted_at IS NULL;

-- Articles 文章
CREATE INDEX idx_articles_user_id ON articles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_status ON articles(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_category ON articles(category) WHERE deleted_at IS NULL;

-- Chapters 章节
CREATE INDEX idx_chapters_article_id ON article_chapters(article_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chapters_number ON article_chapters(article_id, chapter_number) WHERE deleted_at IS NULL;
```

## 特性

### 软删除

- 所有表使用 `deleted_at` 时间戳
- 数据从不物理删除
- 易于恢复和审计追踪

### 便签管理

- 置顶重要便签
- 自定义十六进制颜色
- 按置顶状态和更新时间排序

### 文章管理

- 草稿 → 已发布 → 已归档生命周期
- 多章节支持
- 自动字数统计
- 封面图片和分类
