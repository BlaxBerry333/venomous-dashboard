# tRPC 开发文档

Dashboard 中使用了 tRPC 来实现 API 请求的调用

## 处理流程

```
  【 Next.js 客户端组件 】
──────────────────────────────────────
1. 通过 Tanstack Query 调用 tRPC 的 procedure
2. tRPC Client 自动发起 HTTP 请求, 比如：GET/POST /api/trpc/<procedure_path>?...
──────────────────────────────────────
          │
          ▼
  【 Next.js API 路由 】
──────────────────────────────────────
捕获所有 /api/trpc/<procedure_path>?...
──────────────────────────────────────
          │
          ▼
  【 tRPC 服务器端 】
──────────────────────────────────────
1. trpcAppRouter 根据请求路径匹配到对应的 procedure
2. createTRPCContext 创建请求上下文
3. 执行 procedure 的逻辑并将结果作为 HTTP 响应返回
──────────────────────────────────────
          │
          ▼
  【 Next.js 客户端组件 】
──────────────────────────────────────
1. tRPC Client 接收 HTTP 响应
2. TanStack Query 获取并处理请求结果 ( data, isLoading, error )
3. UI 刷新
──────────────────────────────────────
```

## 核心文件概览

```shell
dashboard/
└── src/
    ├── app/
    │   └── api/
    │       └── trpc/
    │           └── [...trpc]/
    │               └── route.ts                # Next.js API 路由处理器
    │
    ├── server/
    │   └── routes/                             # 存放所有 tRPC API 路由模块
    │       └── ...
    │
    └── utils/
        └── trpc/
            ├── provider/
            │   ├── TRPCProvider.tsx            # React Context Provider 和 Hooks
            │   └── TRPCQueryClientProvider.tsx # 包裹应用的根 Provider，集成 TanStack Query
            │
            ├── client.ts                       # 客户端 tRPC 实例
            ├── context.ts                      # 服务端上下文创建函数
            ├── instance.ts                     # 服务端 tRPC 根实例
            ├── router.ts                       # 服务端主路由
            │
            ├── index.client.ts                 # 供客户端导入使用的入口
            └── index.server.ts                 # 供服务端导入使用的入口
```

## 创建 API

1. 服务端在`@/server/routes`目录下定义 tRPC 的具体 procedure
2. 服务端在`@/utils/trpc/router.ts`中将 procedure 注册到主路由 `trpcAppRouter`
3. 客户端通过 `useTRPC()` 获取 tRPC 的客户端实例后通过 TanStack Query 的 `useQuery()`、`useMutation()` 发起请求
