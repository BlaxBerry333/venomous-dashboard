# Venomous Dashboard

A multi-language microservices project for learning and demonstration purposes.

## Server List

|     Category     |              Service Name              |    Main Skill     |                                              |
| :--------------: | :------------------------------------: | :---------------: | -------------------------------------------- |
|   Application    |       [dashboard](./dashboard/)        |      Next.js      | Main user interface.                         |
|   Application    |        [document](./document/)         |         -         |                                              |
|   API Gateway    | [api-gateway](./services/api-gateway/) |    Go ( Gin )     | Single entry point for all backend requests. |
| Headless Service |        [auth](./services/auth/)        |   Rust ( Axum )   | User registration, login, JWT management.    |
| Headless Service |       [notes](./services/notes/)       |  Ruby ( Rails )   | Note management service.                     |
| Headless Service |       [media](./services/media/)       |      Node.js      | Media and file management service.           |
| Headless Service |   [workflows](./services/workflows/)   | Python ( Django ) | Workflow management service.                 |
|     Database     |                   db                   |    PostgresSQL    | Primary relational database.                 |
|      Cache       |                 redis                  |       Redis       | Caching layer.                               |
|     Storage      |                 minio                  |         -         | S3-compatible object storage.                |

## Directory Structure

```shell
.
├── .github/
│   └── workflows/
│       └── ...
│
├── infrastructure/                             # Infrastructure
│   ├── docker/
│   │   └── docker-compose.[ENV].yml
│   ├── database/
│   │   └── db-init.sh
│   └── ...
│
├── dashboard/                                  # Dashboard Application
│   ├── docker/
│   │   └── Dockerfile.[ENV]
│   └── ...
│
├── document/                                   # Documentation Application
│   └── ...
│
├── services/                                   # Headless Services ( Microservices )
│   │
│   ├── api-gateway/                            # ( Routing、Authorization、Rate Limiting、Caching )
│   │   ├── Dockerfile.[ENV]
│   │   └── ...
│   │
│   ├── auth/                                   # ( Registration、Login、Hashed Storage、JWT Token Issuance & Verification )
│   │   ├── Dockerfile.[ENV]
│   │   ├── migrations/
│   │   │   └── ... <NAME>.sql
│   │   └── ...
│   │
│   ├── notes/                                  # ( Note Management )
│   │   ├── Dockerfile.[ENV]
│   │   └── ...
│   │
│   ├── media/                                  # ( Media Management )
│   │   ├── Dockerfile.[ENV]
│   │   └── ...
│   │
│   ├── workflows/                              # ( Workflow Management )
│   │   ├── Dockerfile.[ENV]
│   │   └── ...
│   │
│   └── ...
│
└── Makefile
```

## Local Commands

```shell
$ make help
```

### Migration

```shell
# 1. create new migration SQL file by command
$ make db-migrate SERVICE=<service_name>

# 2. edit migration SQL file

# 3. apply migration SQL file by command
$ make db-migrate SERVICE=<service_name>

# 4. show migration status by command
$ make db-showmigrations SERVICE=<service_name>
```
