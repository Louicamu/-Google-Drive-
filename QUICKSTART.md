# 🚀 快速启动指南

## ⚠️ 重要：解决 NextAuth 错误

如果你看到 `CLIENT_FETCH_ERROR` 错误，请按以下步骤操作：

### 1️⃣ 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件：

**使用 PowerShell（推荐）**:
```powershell
@"
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/nextdrive

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nextdrive-secret-key-change-in-production-2025

# Google OAuth (可选)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**或者手动创建**:
1. 在项目根目录右键 → 新建 → 文本文档
2. 重命名为 `.env.local`（注意前面有个点）
3. 用记事本打开，粘贴以下内容：

```env
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/nextdrive

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nextdrive-secret-key-change-in-production-2025

# Google OAuth (可选)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2️⃣ 启动 MongoDB

**选项 A: 使用 MongoDB Atlas（推荐，无需安装）**

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. 创建免费账户和集群
3. 获取连接字符串
4. 在 `.env.local` 中替换：
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextdrive
   ```

**选项 B: 本地 MongoDB**

如果已安装 MongoDB，在新的终端窗口运行：
```bash
mongod
```

### 3️⃣ 重启开发服务器

**重要**：创建 `.env.local` 后必须重启！

```bash
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

### 4️⃣ 访问应用

打开浏览器访问: http://localhost:3000

## 📝 第一次使用

1. **注册账户**
   - 访问注册页面
   - 输入姓名、邮箱和密码
   - 点击"注册"

2. **登录**
   - 使用注册的邮箱和密码登录

3. **开始使用**
   - 点击"新建文件夹"创建文件夹
   - 点击"上传"按钮上传文件（当前为模拟上传）
   - 右键文件/文件夹查看更多操作

## 🐛 常见问题

### 问题 1: MongoDB 连接失败

**错误**: `MongooseServerSelectionError`

**解决方案**:
- 确保 MongoDB 正在运行（如果使用本地）
- 或使用 MongoDB Atlas（云服务）
- 检查 `MONGODB_URI` 是否正确

### 问题 2: NextAuth 错误仍然存在

**解决方案**:
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件中有 `NEXTAUTH_SECRET`
3. 完全停止并重启开发服务器
4. 清除浏览器缓存（Ctrl+Shift+Delete）

### 问题 3: 无法创建 `.env.local` 文件

**Windows 解决方案**:

在 PowerShell 中运行：
```powershell
New-Item -Path .env.local -ItemType File
notepad .env.local
```

然后粘贴环境变量内容。

### 问题 4: 端口 3000 被占用

**解决方案**:

指定其他端口：
```bash
# 使用端口 3001
npm run dev -- -p 3001
```

然后记得在 `.env.local` 中更新：
```env
NEXTAUTH_URL=http://localhost:3001
```

## 📱 测试账户

首次使用需要注册新账户。建议使用：
- **邮箱**: test@example.com
- **密码**: test123456
- **姓名**: 测试用户

## ✨ 主要功能

- ✅ 用户注册和登录
- ✅ 创建文件夹
- ✅ 文件夹导航
- ✅ 网格/列表视图切换
- ✅ 星标收藏
- ✅ 文件上传界面（模拟）
- ✅ 回收站
- ⏳ 真实文件上传（需配置云存储）
- ⏳ 文件预览
- ⏳ 文件分享

## 🎯 下一步

1. 尝试创建文件夹和导航
2. 测试星标功能
3. 切换网格和列表视图
4. 查看文档了解如何配置云存储

## 📚 更多文档

- **详细配置**: 查看 `docs/SETUP.md`
- **API 文档**: 查看 `docs/API.md`
- **项目说明**: 查看 `README.md`

## 🆘 需要帮助？

如果问题仍未解决：
1. 检查控制台错误信息
2. 检查 MongoDB 日志
3. 提交 GitHub Issue
4. 联系开发者

---

**提示**: 所有环境变量更改后都需要重启开发服务器！

