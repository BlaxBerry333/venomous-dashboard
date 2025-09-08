# Venomous Dashboard

A multi-language microservices project for learning and demonstration purposes.

## Server List

|     Category     |             Service Name              |    Main Skill     |                                              |
| :--------------: | :-----------------------------------: | :---------------: | -------------------------------------------- |
|   Application    |       [dashboard](./dashboard/)       |      Next.js      | Main user interface.                         |
|   Application    |        [document](./document/)        |         -         |                                              |
|   API Gateway    | [api-gateway](./servers/api-gateway/) |    Go ( Gin )     | Single entry point for all backend requests. |
| Headless Service |   [auth](./servers/authorization/)    |   Rust ( Axum )   | User registration, login, JWT management.    |
| Headless Service |       [notes](./servers/notes/)       |  Ruby ( Rails )   | Note management service.                     |
| Headless Service |       [media](./servers/media/)       |      Node.js      | Media and file management service.           |
| Headless Service |   [workflows](./servers/workflows/)   | Python ( Django ) | Workflow management service.                 |
|     Database     |                  db                   |    PostgresSQL    | Primary relational database.                 |
|      Cache       |                 redis                 |       Redis       | Caching layer.                               |
|     Storage      |                 minio                 |         -         | S3-compatible object storage.                |

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
├── servers/                                    # Headless Servers ( Microservices )
│   │
│   ├── api-gateway/                            # ( Routing、Authorization、Rate Limiting、Caching )
│   │   ├── Dockerfile.[ENV]
│   │   └── ...
│   │
│   ├── authorization/                          # ( Registration、Login、Hashed Storage、JWT Token Issuance & Verification )
│   │   ├── Dockerfile.[ENV]
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
