# NextDrive 配置指南

## 📋 环境配置

### 1. 数据库配置

#### 选项 A：本地 MongoDB

1. **安装 MongoDB**
   - Windows: 从 [MongoDB官网](https://www.mongodb.com/try/download/community) 下载安装
   - macOS: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **启动 MongoDB**
   ```bash
   mongod
   ```

3. **配置环境变量**
   ```env
   MONGODB_URI=mongodb://localhost:27017/nextdrive
   ```

#### 选项 B：MongoDB Atlas（推荐用于生产环境）

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 设置数据库用户和密码
4. 获取连接字符串
5. 配置环境变量：
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextdrive?retryWrites=true&w=majority
   ```

### 2. NextAuth 配置

1. **生成密钥**
   ```bash
   # 在终端运行
   openssl rand -base64 32
   ```

2. **配置环境变量**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=生成的密钥
   ```

### 3. Google OAuth 配置（可选）

1. **创建 Google Cloud 项目**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目

2. **启用 OAuth 2.0**
   - 进入"API和服务" > "凭据"
   - 点击"创建凭据" > "OAuth 客户端 ID"
   - 应用类型选择"Web 应用"

3. **配置重定向 URI**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

4. **获取凭据并配置**
   ```env
   GOOGLE_CLIENT_ID=你的客户端ID
   GOOGLE_CLIENT_SECRET=你的客户端密钥
   ```

### 4. 云存储配置（文件上传）

目前文件上传功能是模拟的，要启用真实文件上传，需要配置云存储服务。

#### 选项 A：AWS S3

1. **创建 S3 存储桶**
   - 登录 [AWS Console](https://console.aws.amazon.com/)
   - 创建 S3 存储桶
   - 配置 CORS 策略

2. **创建 IAM 用户**
   - 创建具有 S3 访问权限的 IAM 用户
   - 获取访问密钥

3. **配置环境变量**
   ```env
   AWS_ACCESS_KEY_ID=你的访问密钥
   AWS_SECRET_ACCESS_KEY=你的密钥
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=你的存储桶名称
   ```

#### 选项 B：Vercel Blob（推荐）

1. **在 Vercel 创建 Blob Store**
   - 访问 Vercel Dashboard
   - 进入 Storage
   - 创建 Blob Store

2. **配置环境变量**
   ```env
   BLOB_READ_WRITE_TOKEN=你的令牌
   ```

## 🚀 启动步骤

1. **复制环境变量**
   ```bash
   cp .env.example .env.local
   ```

2. **编辑 `.env.local`**
   填入实际的配置值

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开 http://localhost:3000

## 📝 初次使用

1. **注册账户**
   - 访问 http://localhost:3000/auth/signup
   - 填写邮箱、姓名和密码
   - 点击注册

2. **登录**
   - 使用注册的邮箱和密码登录
   - 或者使用 Google 账户登录（如果已配置）

3. **开始使用**
   - 创建文件夹
   - 上传文件（注意：需要配置云存储才能真实上传）
   - 管理文件和文件夹

## 🐛 常见问题

### MongoDB 连接失败

**问题**: `MongooseServerSelectionError: connect ECONNREFUSED`

**解决方案**:
- 确保 MongoDB 正在运行
- 检查 `MONGODB_URI` 是否正确
- 检查防火墙设置

### NextAuth 会话错误

**问题**: `[next-auth][error][NO_SECRET]`

**解决方案**:
- 确保设置了 `NEXTAUTH_SECRET`
- 重启开发服务器

### 文件上传失败

**问题**: 上传后文件不可访问

**解决方案**:
- 当前版本使用模拟上传
- 需要配置真实的云存储服务（AWS S3 或 Vercel Blob）
- 参考"云存储配置"部分

## 🔒 生产环境部署

### Vercel 部署（推荐）

1. **推送代码到 GitHub**

2. **导入到 Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 导入 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   - `MONGODB_URI`
   - `NEXTAUTH_URL`（生产环境 URL）
   - `NEXTAUTH_SECRET`
   - 其他必要的环境变量

4. **部署**
   - Vercel 会自动构建和部署
   - 每次推送都会触发新部署

### 其他平台部署

- **Railway**: 支持 MongoDB 和 Next.js
- **Render**: 提供免费的 PostgreSQL（需修改数据库）
- **DigitalOcean**: App Platform 支持 Docker 部署

## 📧 技术支持

如遇问题，请：
1. 查看控制台错误信息
2. 检查环境变量配置
3. 查看 MongoDB 日志
4. 提交 GitHub Issue

