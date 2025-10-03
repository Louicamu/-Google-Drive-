# NextDrive - 仿 Google Drive 云存储应用

NextDrive 是一个基于 **React**、**Next.js**、**MongoDB** 和 **Tailwind CSS** 构建的现代化云存储应用，提供类似 Google Drive 的用户体验。

## ✨ 主要特性

### 已实现功能

- ✅ **用户认证**
  - 邮箱/密码登录注册
  - 支持 Google OAuth（可选配置）
  - 会话管理和权限控制

- ✅ **文件管理**
  - 创建文件夹
  - 文件夹导航（面包屑导航）
  - 网格视图和列表视图切换
  - 文件/文件夹重命名、删除
  - 星标收藏功能

- ✅ **界面布局**
  - 响应式设计
  - 侧边栏导航（我的云盘、共享、最近、星标、回收站）
  - 搜索功能
  - 右键菜单

- ✅ **文件操作**
  - 拖拽上传界面
  - 上传进度显示
  - 软删除（回收站）

### 已完成功能

- ✅ **文件分享** - 完整的分享功能，支持链接生成、权限管理、密码保护、过期时间
- ✅ **文件上传下载** - 真实文件上传到服务器，支持下载
- ✅ **文件管理** - 创建文件夹、重命名、删除、星标
- ✅ **用户认证** - 注册、登录、会话管理

### 可选扩展功能

- ⏳ **云存储集成** - 集成 Vercel Blob、AWS S3 或 Google Cloud Storage（生产环境推荐）
- ⏳ **文件预览增强** - 扩展 PDF、视频在线预览
- ⏳ **文件搜索** - 全文搜索、高级筛选
- ⏳ **实时协作** - 多人编辑、版本管理

## 🚀 快速开始

### 环境要求

- ✅ Node.js 18.x 或更高版本
- ✅ MongoDB 数据库（本地或 Atlas 云服务）
- ✅ npm 或 pnpm

### 一键启动（推荐）

**Windows PowerShell**:
```powershell
.\start.ps1
```

这个脚本会自动：
- ✅ 检查并启动 MongoDB 服务
- ✅ 创建 `.env.local` 文件
- ✅ 安装依赖包
- ✅ 测试数据库连接
- ✅ 启动开发服务器

### 手动安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd next-drive
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env.local` 文件：

```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/nextdrive

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

**快速创建（PowerShell）**:
```powershell
@"
MONGODB_URI=mongodb://localhost:27017/nextdrive
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nextdrive-secret-key-change-in-production-2025
"@ | Out-File -FilePath .env.local -Encoding utf8
```

4. **启动 MongoDB**

**如果使用本地 MongoDB**:
```powershell
# 检查服务状态
Get-Service -Name MongoDB

# 如果未运行，启动服务
Start-Service -Name MongoDB
```

**或使用 MongoDB Atlas（推荐）**:
- 访问 https://www.mongodb.com/cloud/atlas
- 创建免费集群
- 获取连接字符串并更新 `.env.local`

详细说明：查看 [docs/MONGODB.md](docs/MONGODB.md)

5. **运行开发服务器**
```bash
npm run dev
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
next-drive/
├── src/
│   ├── app/                    # Next.js 应用路由
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关 API
│   │   │   └── files/         # 文件管理 API
│   │   ├── auth/              # 认证页面
│   │   ├── drive/             # 云盘主页
│   │   ├── recent/            # 最近使用
│   │   ├── starred/           # 星标文件
│   │   ├── shared/            # 共享文件
│   │   ├── trash/             # 回收站
│   │   └── layout.tsx         # 根布局
│   ├── components/            # React 组件
│   │   ├── Navbar.tsx         # 顶部导航栏
│   │   ├── Sidebar.tsx        # 侧边栏
│   │   ├── FileGrid.tsx       # 网格视图
│   │   ├── FileList.tsx       # 列表视图
│   │   ├── CreateFolderModal.tsx  # 新建文件夹
│   │   └── UploadModal.tsx    # 文件上传
│   ├── lib/                   # 工具库
│   │   ├── mongodb.ts         # MongoDB 连接
│   │   └── utils.ts           # 工具函数
│   ├── models/                # 数据模型
│   │   ├── User.ts            # 用户模型
│   │   └── FileItem.ts        # 文件/文件夹模型
│   ├── store/                 # 状态管理
│   │   └── useStore.ts        # Zustand Store
│   └── types/                 # TypeScript 类型定义
├── public/                    # 静态资源
└── package.json
```

## 🛠️ 技术栈

- **前端框架**: React 19 + Next.js 15
- **样式**: Tailwind CSS 4
- **数据库**: MongoDB + Mongoose
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **图标**: Lucide React
- **文件上传**: React Dropzone
- **日期处理**: date-fns
- **TypeScript**: 完整类型支持

## 📊 数据模型

### User（用户）
```typescript
{
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
{
  name: string;
  type: string;           // 'folder' 或 MIME 类型
  path: string;           // 完整路径
  parentId?: ObjectId;    // 父文件夹 ID
  ownerId: ObjectId;      // 所有者 ID
  isFolder: boolean;
  size: number;
  url?: string;           // 文件 URL
  sharedWith: [{
    userId: ObjectId;
    permission: 'view' | 'edit';
  }];
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

## 🔐 安全性

- 密码使用 bcryptjs 加密存储
- JWT 令牌用于会话管理
- API 路由受 NextAuth 保护
- 环境变量存储敏感信息

## 🎨 界面特色

- **现代化设计**: 采用 Tailwind CSS，美观且响应式
- **流畅动画**: 平滑的过渡效果和加载动画
- **直观操作**: 拖拽上传、右键菜单、面包屑导航
- **视图切换**: 网格视图和列表视图自由切换
- **暗色模式**: 支持系统主题（待完善）

## 📝 待办事项

1. **集成云存储服务**
   - 配置 AWS S3 或 Vercel Blob
   - 实现真实文件上传和下载

2. **文件预览功能**
   - 图片预览（支持缩略图）
   - PDF 在线查看
   - 文本文件编辑器

3. **分享功能**
   - 生成分享链接
   - 权限管理（仅查看/可编辑）
   - 链接过期时间

4. **搜索优化**
   - 全文搜索
   - 高级筛选
   - 搜索建议

5. **性能优化**
   - 虚拟滚动
   - 图片懒加载
   - CDN 加速

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

本项目灵感来自 Google Drive，使用了以下优秀的开源项目：

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

**开发者**: 使用 Next.js + MongoDB 构建  
**版本**: 1.0.0  
**更新时间**: 2025-10-03
