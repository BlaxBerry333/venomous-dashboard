# Notes Service Database Design

## Overview

PostgreSQL database for managing user memos and articles with chapters. Supports soft deletion and rich content management.

## Schema

### `memos` - Quick Notes

| Column       | Type        | Constraints                 | Description               |
| ------------ | ----------- | --------------------------- | ------------------------- |
| `id`         | UUID        | PRIMARY KEY                 | Memo identifier           |
| `user_id`    | UUID        | NOT NULL                    | User reference            |
| `content`    | TEXT        | NOT NULL                    | Memo content              |
| `color`      | TEXT        | NOT NULL, DEFAULT '#FFF9C4' | Hex color (e.g., #FFF9C4) |
| `is_pinned`  | BOOLEAN     | NOT NULL, DEFAULT FALSE     | Pin status                |
| `created_at` | TIMESTAMPTZ | NOT NULL                    | Creation time             |
| `updated_at` | TIMESTAMPTZ | NOT NULL                    | Update time               |
| `deleted_at` | TIMESTAMPTZ | NULLABLE                    | Soft delete               |

**Color Palette:**

- Light Yellow: `#FFF9C4` (default)
- Light Green: `#C8E6C9`
- Light Pink: `#F8BBD0`

### `articles` - Long-form Content

| Column            | Type        | Constraints               | Description        |
| ----------------- | ----------- | ------------------------- | ------------------ |
| `id`              | UUID        | PRIMARY KEY               | Article identifier |
| `user_id`         | UUID        | NOT NULL                  | User reference     |
| `title`           | TEXT        | NOT NULL                  | Article title      |
| `description`     | TEXT        | NULLABLE                  | Brief description  |
| `cover_image_url` | TEXT        | NULLABLE                  | Cover image URL    |
| `category`        | TEXT        | NULLABLE                  | Article category   |
| `status`          | TEXT        | NOT NULL, DEFAULT 'draft' | Status             |
| `created_at`      | TIMESTAMPTZ | NOT NULL                  | Creation time      |
| `updated_at`      | TIMESTAMPTZ | NOT NULL                  | Update time        |
| `deleted_at`      | TIMESTAMPTZ | NULLABLE                  | Soft delete        |

**Status Values:**

- `draft`: Work in progress
- `published`: Public visibility
- `archived`: Hidden from view

### `article_chapters` - Chapter Content

| Column           | Type        | Constraints             | Description        |
| ---------------- | ----------- | ----------------------- | ------------------ |
| `id`             | UUID        | PRIMARY KEY             | Chapter identifier |
| `article_id`     | UUID        | NOT NULL, FK → articles | Parent article     |
| `title`          | TEXT        | NOT NULL                | Chapter title      |
| `content`        | TEXT        | NOT NULL                | Chapter content    |
| `chapter_number` | INTEGER     | NOT NULL                | Sequence number    |
| `word_count`     | INTEGER     | NOT NULL, DEFAULT 0     | Word count         |
| `created_at`     | TIMESTAMPTZ | NOT NULL                | Creation time      |
| `updated_at`     | TIMESTAMPTZ | NOT NULL                | Update time        |
| `deleted_at`     | TIMESTAMPTZ | NULLABLE                | Soft delete        |

## Relationships

```
articles (1) → (*) article_chapters
```

- One article can have multiple chapters
- Chapters are ordered by `chapter_number`
- Deleting an article soft-deletes all chapters

## Indexes

Recommended indexes for optimal performance:

```sql
-- Memos
CREATE INDEX idx_memos_user_id ON memos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_memos_pinned ON memos(user_id, is_pinned, updated_at) WHERE deleted_at IS NULL;

-- Articles
CREATE INDEX idx_articles_user_id ON articles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_status ON articles(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_category ON articles(category) WHERE deleted_at IS NULL;

-- Chapters
CREATE INDEX idx_chapters_article_id ON article_chapters(article_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chapters_number ON article_chapters(article_id, chapter_number) WHERE deleted_at IS NULL;
```

## Features

### Soft Deletion

- All tables use `deleted_at` timestamp
- Data is never physically deleted
- Easy recovery and audit trail

### Memo Organization

- Pin important memos
- Customizable hex colors
- Sorted by pinned status and update time

### Article Management

- Draft → Published → Archived lifecycle
- Multi-chapter support
- Automatic word count tracking
- Cover images and categories
