# NextDrive API 文档

本文档描述了 NextDrive 的所有 API 接口。

## 🔐 认证

所有 API（除了认证相关接口）都需要用户登录。使用 NextAuth.js 进行会话管理。

### 注册

**POST** `/api/auth/register`

创建新用户账户。

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "message": "注册成功",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "zhangsan@example.com",
    "name": "张三"
  }
}
```

**错误响应**:
- `400`: 缺少必填字段或邮箱已存在
- `500`: 服务器错误

### 登录

**POST** `/api/auth/signin`

使用 NextAuth.js 提供的登录接口。

支持的登录方式：
- 邮箱/密码
- Google OAuth（如果已配置）

## 📁 文件管理

### 获取文件列表

**GET** `/api/files`

获取文件和文件夹列表。

**查询参数**:
- `parentId` (可选): 父文件夹 ID，不传或传 `null` 获取根目录
- `type` (可选): 特殊类型
  - `recent`: 最近使用的文件
  - `starred`: 星标文件
  - `shared`: 共享给我的文件

**示例**:
```
GET /api/files?parentId=507f1f77bcf86cd799439011
GET /api/files?type=starred
```

**响应**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "我的文档",
    "type": "folder",
    "path": "/我的文档",
    "parentId": null,
    "ownerId": "507f191e810c19729de860ea",
    "isFolder": true,
    "size": 0,
    "starred": false,
    "isDeleted": false,
    "createdAt": "2025-10-03T10:00:00.000Z",
    "updatedAt": "2025-10-03T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "文档.pdf",
    "type": "application/pdf",
    "path": "/文档.pdf",
    "parentId": null,
    "ownerId": "507f191e810c19729de860ea",
    "isFolder": false,
    "size": 1024000,
    "url": "https://storage.example.com/files/abc123.pdf",
    "starred": true,
    "isDeleted": false,
    "createdAt": "2025-10-03T11:00:00.000Z",
    "updatedAt": "2025-10-03T11:00:00.000Z"
  }
]
```

### 创建文件夹

**POST** `/api/files`

创建新文件夹。

**请求体**:
```json
{
  "name": "新文件夹",
  "parentId": "507f1f77bcf86cd799439011",
  "path": "/我的文档/新文件夹"
}
```

**响应**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "新文件夹",
  "type": "folder",
  "path": "/我的文档/新文件夹",
  "parentId": "507f1f77bcf86cd799439011",
  "ownerId": "507f191e810c19729de860ea",
  "isFolder": true,
  "size": 0,
  "starred": false,
  "isDeleted": false,
  "createdAt": "2025-10-03T12:00:00.000Z",
  "updatedAt": "2025-10-03T12:00:00.000Z"
}
```

**错误响应**:
- `400`: 文件夹名称为空或已存在
- `401`: 未授权
- `500`: 服务器错误

### 更新文件/文件夹

**PUT** `/api/files/[id]`

更新文件或文件夹的属性。

**请求体**:
```json
{
  "name": "重命名的文件夹",
  "starred": true,
  "parentId": "507f1f77bcf86cd799439014"
}
```

**允许更新的字段**:
- `name`: 重命名
- `starred`: 星标/取消星标
- `parentId`: 移动到其他文件夹

**响应**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "重命名的文件夹",
  "starred": true,
  // ... 其他字段
}
```

**错误响应**:
- `401`: 未授权
- `404`: 文件不存在
- `500`: 服务器错误

### 删除文件/文件夹

**DELETE** `/api/files/[id]`

软删除文件或文件夹（移到回收站）。

**响应**:
```json
{
  "message": "已移到回收站"
}
```

**错误响应**:
- `401`: 未授权
- `404`: 文件不存在
- `500`: 服务器错误

## 📊 数据模型

### User（用户）

```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string;  // bcrypt 加密
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### FileItem（文件/文件夹）

```typescript
interface FileItem {
  _id: ObjectId;
  name: string;
  type: string;           // 'folder' 或 MIME 类型
  path: string;           // 完整路径
  parentId?: ObjectId;    // 父文件夹 ID
  ownerId: ObjectId;      // 所有者 ID
  isFolder: boolean;
  size: number;           // 字节
  url?: string;           // 文件 URL
  sharedWith: Array<{
    userId: ObjectId;
    permission: 'view' | 'edit';
  }>;
  sharedLink?: {
    token: string;
    permission: 'view' | 'edit';
    expiresAt?: Date;
    password?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔜 待实现的 API

以下 API 接口计划在后续版本中实现：

### 文件上传

**POST** `/api/upload`

上传文件到云存储。

**请求**: `multipart/form-data`

**响应**:
```json
{
  "url": "https://storage.example.com/files/abc123.pdf",
  "file": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "上传的文件.pdf",
    // ... 其他字段
  }
}
```

### 文件搜索

**GET** `/api/files/search?q=[query]`

搜索文件和文件夹。

**查询参数**:
- `q`: 搜索关键词
- `type`: 文件类型过滤
- `from`: 开始日期
- `to`: 结束日期

### 文件分享

**POST** `/api/files/[id]/share`

生成分享链接。

**请求体**:
```json
{
  "permission": "view",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "password": "optional-password"
}
```

**响应**:
```json
{
  "shareLink": "https://nextdrive.com/s/abc123token",
  "token": "abc123token",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

### 访问分享

**GET** `/api/share/[token]`

访问分享的文件或文件夹。

**查询参数**:
- `password`: 如果设置了密码保护

## 🛡️ 权限控制

- **所有者**: 完全控制权（读、写、删除、分享）
- **编辑者**: 可以编辑和查看
- **查看者**: 只能查看和下载

## 📝 错误代码

- `400`: 请求参数错误
- `401`: 未授权（未登录）
- `403`: 禁止访问（权限不足）
- `404`: 资源不存在
- `500`: 服务器内部错误

## 🔄 速率限制

目前未实施速率限制。生产环境建议添加：

- 登录: 5次/分钟
- 注册: 3次/小时
- 文件上传: 100次/小时
- API 调用: 1000次/小时

