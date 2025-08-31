## 功能模块

```shell
utils/
└── <功能某块>/
  │
  ├── 子模块.ts
  │
  ├── <子模块目录>/       # 子模块目录中不指定出口文件
  │  ├── 子模块.ts
  │  └── 子模块.ts
  │
  ├── [config].ts       # 相关配置，非必需，供子模块内直接调用
  ├── [instance].ts     # 实例对象，非必需，供子模块内直接调用
  │
  ├── index.client.ts   # 供客户端导入使用的入口
  └── index.server.ts   # 供服务端导入使用的入口
```

### i18n

[详细开发文档](./utils/i18n.md)

### TRPC

[详细开发文档](./utils/trpc.md)

### Prisma
