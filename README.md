# Venomous Dashboard

A multi-language microservices project for learning and demonstration purposes.

## Server List

|     Category     |             Service Name              |    Main Skill     |
| :--------------: | :-----------------------------------: | :---------------: |
|   Application    |       [dashboard](./dashboard/)       |      Next.js      |
|   Application    |        [document](./document/)        |         -         |
|   API Gateway    | [api-gateway](./servers/api-gateway/) |    Go ( Gin )     |
| Headless Service |   [auth](./servers/authorization/)    |   Rust ( Axum )   |
| Headless Service |       [notes](./servers/notes/)       |  Ruby ( Rails )   |
| Headless Service |       [media](./servers/media/)       |      Node.js      |
| Headless Service |   [workflows](./servers/workflows/)   | Python ( Django ) |
|     Database     |                  db                   |    PostgresSQL    |
|      Cache       |                 redis                 |         -         |
|     Storage      |                 minio                 |         -         |

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
