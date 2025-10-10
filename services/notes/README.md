# Notes Service

Headless Service for Notes Management in Venomous Dashboard.

## Technology Stack

- Docker Compose
- Node.js
- Fastify
- TypeScript
- Drizzle

## Development Commands

### Update Dependencies

```shell
# Make sure you are in the notes service's directory
% pwd
/venomous-dashboard/services/notes

# Install or update dependencies
% npm install <packages>
% npm update <packages>

# Move to the root directory
% cd ../..
% pwd
/venomous-dashboard

# Run script to build and start the notes service's container
% make setup SERVICE=notes
```

---

## API

### Authentication

All endpoints require JWT authentication via the `Authorization` header.

User ID is extracted from the JWT token automatically.

```
Authorization: Bearer <JWT_TOKEN>
```

---

### List Memos

**Endpoint:**

`GET /api/notes/memos`

**Query Parameters:**

| Parameter   | Type    | Default      | Description                                         |
| ----------- | ------- | ------------ | --------------------------------------------------- |
| `page`      | number  | 1            | Page number                                         |
| `pageSize`  | number  | 20           | Items per page (max: 100)                           |
| `color`     | string  | -            | Filter by hex color (e.g., #FFF9C4)                 |
| `isPinned`  | boolean | -            | Filter by pinned status                             |
| `search`    | string  | -            | Search in content (fuzzy match)                     |
| `sortBy`    | string  | `updated_at` | Sort field: `created_at`, `updated_at`, `is_pinned` |
| `sortOrder` | string  | `desc`       | Sort order: `asc`, `desc`                           |

**Response:**

- `200 OK`

```typescript
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Meeting notes...",
      "color": "#FFF9C4",
      "isPinned": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

---

### Get Single Memo

**Endpoint:**

`GET /api/notes/memos/:id`

**Response:**

- `200 OK`
- `404 Not Found`: Memo not found or not owned by user

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "Important reminder",
    "color": "#C8E6C9",
    "isPinned": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### Create Memo

**Endpoint:**

`POST /api/notes/memos`

**Request Body:**

| Parameter  | Type    | Required | Default   | Description      |
| ---------- | ------- | -------- | --------- | ---------------- |
| `content`  | string  | Yes      | -         | Memo content     |
| `color`    | string  | No       | `#FFF9C4` | Hex color string |
| `isPinned` | boolean | No       | `false`   | Pin status       |

**Response:**

- `201 Created`

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "New memo content",
    "color": "#FFF9C4",
    "isPinned": false,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### Update Memo

**Endpoint:**

`PUT /api/notes/memos/:id`

**Request Body:**

| Parameter  | Type    | Required | Description      |
| ---------- | ------- | -------- | ---------------- |
| `content`  | string  | No       | Memo content     |
| `color`    | string  | No       | Hex color string |
| `isPinned` | boolean | No       | Pin status       |

**Response:**

- `200 OK`
- `400 Bad Request`: No fields to update
- `404 Not Found`: Memo not found

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "content": "Updated content",
    "color": "#C8E6C9",
    "isPinned": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T11:30:00Z"
  }
}
```

---

### Delete Memo

**Endpoint:**

`DELETE /api/notes/memos/:id`

**Response:**

- `200 OK`

```typescript
{
  "success": true
}
```

---

### List Articles

**Endpoint:**

`GET /api/notes/articles`

**Query Parameters:**

| Parameter   | Type   | Default      | Description                                        |
| ----------- | ------ | ------------ | -------------------------------------------------- |
| `page`      | number | 1            | Page number                                        |
| `pageSize`  | number | 20           | Items per page (max: 100)                          |
| `status`    | string | -            | Filter by status: `draft`, `published`, `archived` |
| `category`  | string | -            | Filter by category                                 |
| `search`    | string | -            | Search in title and description                    |
| `sortBy`    | string | `updated_at` | Sort field: `created_at`, `updated_at`, `title`    |
| `sortOrder` | string | `desc`       | Sort order: `asc`, `desc`                          |

**Response:**

- `200 OK`

```typescript
{
  "success": true,
  "data": [
    {
      "article": {
        "id": "uuid",
        "userId": "uuid",
        "title": "Building Microservices",
        "description": "A comprehensive guide",
        "coverImageUrl": "https://example.com/cover.jpg",
        "category": "Backend",
        "status": "published",
        "createdAt": "2025-01-10T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      },
      "chapterCount": 5
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

### Get Article with Chapters

**Endpoint:**

`GET /api/notes/articles/:id`

**Response:**

- `200 OK`

```typescript
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "userId": "uuid",
      "title": "Building Microservices",
      "description": "A comprehensive guide",
      "category": "Backend",
      "status": "published",
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    },
    "chapters": [
      {
        "id": "uuid",
        "articleId": "uuid",
        "title": "Introduction",
        "content": "Chapter content...",
        "chapterNumber": 1,
        "wordCount": 1500,
        "createdAt": "2025-01-10T10:00:00Z",
        "updatedAt": "2025-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Article

**Endpoint:**

`POST /api/notes/articles`

**Request Body:**

| Parameter       | Type   | Required | Default | Description                      |
| --------------- | ------ | -------- | ------- | -------------------------------- |
| `title`         | string | Yes      | -       | Article title                    |
| `description`   | string | No       | -       | Brief description                |
| `category`      | string | No       | -       | Article category                 |
| `coverImageUrl` | string | No       | -       | Cover image URL                  |
| `status`        | string | No       | `draft` | Status: draft/published/archived |

**Response:**

- `201 Created`

---

### Update Article

**Endpoint:**

`PUT /api/notes/articles/:id`

**Request Body:**

| Parameter       | Type   | Required | Description                      |
| --------------- | ------ | -------- | -------------------------------- |
| `title`         | string | No       | Article title                    |
| `description`   | string | No       | Brief description                |
| `category`      | string | No       | Article category                 |
| `coverImageUrl` | string | No       | Cover image URL                  |
| `status`        | string | No       | Status: draft/published/archived |

**Response:**

- `200 OK`

---

### Delete Article

**Endpoint:**

`DELETE /api/notes/articles/:id`

**Response:**

- `200 OK`

```typescript
{
  "success": true
}
```

---

### Get Chapter

**Endpoint:**

`GET /api/notes/articles/:articleId/chapters/:chapterId`

**Response:**

- `200 OK`

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "articleId": "uuid",
    "title": "Chapter Title",
    "content": "Full chapter content...",
    "chapterNumber": 1,
    "wordCount": 2500,
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-12T14:00:00Z"
  }
}
```

---

### Create Chapter

**Endpoint:**

`POST /api/notes/articles/:articleId/chapters`

**Request Body:**

| Parameter       | Type   | Required | Description                  |
| --------------- | ------ | -------- | ---------------------------- |
| `title`         | string | Yes      | Chapter title                |
| `content`       | string | Yes      | Chapter content              |
| `chapterNumber` | number | Yes      | Chapter number               |
| `wordCount`     | number | No       | Word count (auto-calculated) |

**Response:**

- `201 Created`

---

### Update Chapter

**Endpoint:**

`PUT /api/notes/articles/:articleId/chapters/:chapterId`

**Request Body:**

| Parameter       | Type   | Required | Description                     |
| --------------- | ------ | -------- | ------------------------------- |
| `title`         | string | No       | Chapter title                   |
| `content`       | string | No       | Chapter content                 |
| `chapterNumber` | number | No       | Chapter number (for reordering) |
| `wordCount`     | number | No       | Word count                      |

**Response:**

- `200 OK`

---

### Delete Chapter

**Endpoint:**

`DELETE /api/notes/articles/:articleId/chapters/:chapterId`

**Response:**

- `200 OK`

```typescript
{
  "success": true
}
```
