# 🚀 NextDrive 部署到 Vercel 指南

## 📋 部署前准备

### ⚠️ 重要提示

Vercel 是一个**无服务器平台**，需要做以下调整：

1. **MongoDB**: 必须使用 **MongoDB Atlas**（云数据库）
2. **文件存储**: 必须使用 **Vercel Blob**（云存储）
3. **环境变量**: 需要在 Vercel 配置

---

## 第一步：准备 MongoDB Atlas

### 1.1 创建 MongoDB Atlas 账户

**访问**: https://www.mongodb.com/cloud/atlas/register

1. 点击 "Start Free"
2. 使用 Google 账号或邮箱注册
3. 完成注册流程

### 1.2 创建数据库集群

**步骤**:
```
1. 登录 MongoDB Atlas
2. 点击 "Build a Database"
3. 选择 "M0 Free" 免费套餐
4. 选择服务器位置（推荐：Singapore 或 Hong Kong）
5. 集群名称：nextdrive-cluster
6. 点击 "Create"
```

### 1.3 配置数据库访问

**创建数据库用户**:
```
1. 左侧菜单 → "Database Access"
2. 点击 "Add New Database User"
3. 认证方法：Password
4. 用户名：nextdrive_admin
5. 密码：生成一个强密码（记住它！）
6. 权限：Atlas Admin
7. 点击 "Add User"
```

**配置网络访问**:
```
1. 左侧菜单 → "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   ⚠️ 生产环境建议配置特定 IP
4. 点击 "Confirm"
```

### 1.4 获取连接字符串

**步骤**:
```
1. 左侧菜单 → "Database"
2. 点击 "Connect"
3. 选择 "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. 复制连接字符串
```

**连接字符串示例**:
```
mongodb+srv://nextdrive_admin:<password>@nextdrive-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**替换密码**:
```
将 <password> 替换为实际密码
```

**最终连接字符串**:
```
mongodb+srv://nextdrive_admin:your_password_here@nextdrive-cluster.xxxxx.mongodb.net/nextdrive?retryWrites=true&w=majority
```

⚠️ **注意**: 在 URL 末尾添加 `/nextdrive` 指定数据库名称

---

## 第二步：推送代码到 GitHub

### 2.1 初始化 Git 仓库

如果还没有初始化 Git：

```powershell
cd D:\next-drive
git init
git add .
git commit -m "Initial commit: NextDrive project"
```

### 2.2 创建 GitHub 仓库

**访问**: https://github.com/new

```
1. Repository name: next-drive
2. Description: NextDrive - Google Drive Clone
3. Visibility: Private（推荐）或 Public
4. 不要勾选任何初始化选项
5. 点击 "Create repository"
```

### 2.3 推送到 GitHub

**在终端运行**:
```powershell
# 添加远程仓库
git remote add origin https://github.com/你的用户名/next-drive.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 第三步：配置 Vercel Blob（文件存储）

### 3.1 安装 Vercel Blob

```powershell
npm install @vercel/blob
```

### 3.2 创建 Blob 上传 API

创建新文件：`src/app/api/upload-blob/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const parentId = formData.get('parentId') as string | null;
    const path = formData.get('path') as string || '/';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    await connectDB();

    const uploadedFiles = [];

    for (const file of files) {
      // 上传到 Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
      });

      // 保存到数据库
      const fileItem = await FileItem.create({
        name: file.name,
        type: file.type,
        path: `${path}/${file.name}`,
        parentId: parentId || null,
        ownerId: session.user.id,
        isFolder: false,
        size: file.size,
        url: blob.url,
        sharedWith: [],
        isDeleted: false,
        starred: false,
      });

      uploadedFiles.push(fileItem);
    }

    return NextResponse.json({
      message: '上传成功',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}
```

### 3.3 更新上传组件

修改 `src/components/UploadModal.tsx`，将 API 路径改为：

```typescript
const res = await fetch('/api/upload-blob', {  // 改这里
  method: 'POST',
  body: singleFormData,
});
```

---

## 第四步：部署到 Vercel

### 4.1 创建 Vercel 账户

**访问**: https://vercel.com/signup

```
1. 点击 "Continue with GitHub"
2. 授权 Vercel 访问 GitHub
3. 完成注册
```

### 4.2 导入项目

**步骤**:
```
1. 登录 Vercel Dashboard
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库：next-drive
4. 点击 "Import"
```

### 4.3 配置项目

**Framework Preset**: 自动检测为 Next.js

**Root Directory**: ./

**Build and Output Settings**: 使用默认设置

### 4.4 配置环境变量

**在 "Environment Variables" 部分添加**:

```
MONGODB_URI
Value: mongodb+srv://nextdrive_admin:your_password@nextdrive-cluster.xxxxx.mongodb.net/nextdrive?retryWrites=true&w=majority

NEXTAUTH_URL
Value: https://你的域名.vercel.app

NEXTAUTH_SECRET
Value: 运行命令生成: openssl rand -base64 32
```

**如何生成 NEXTAUTH_SECRET**:

**Windows PowerShell**:
```powershell
# 生成随机密钥
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**或使用在线工具**: https://generate-secret.vercel.app/32

### 4.5 部署

```
1. 检查所有环境变量已配置
2. 点击 "Deploy"
3. 等待部署完成（约 2-5 分钟）
```

---

## 第五步：配置 Vercel Blob 存储

### 5.1 创建 Blob Store

**步骤**:
```
1. Vercel Dashboard → 你的项目
2. 顶部菜单 → "Storage"
3. 点击 "Create Database"
4. 选择 "Blob"
5. Store Name: nextdrive-files
6. 点击 "Create"
```

### 5.2 连接 Blob 到项目

```
1. 在 Blob 页面，点击 "Connect Project"
2. 选择你的项目：next-drive
3. 点击 "Connect"
```

这会自动添加环境变量：
- `BLOB_READ_WRITE_TOKEN`

### 5.3 重新部署

```
1. 返回项目的 "Deployments" 页面
2. 点击最新部署右侧的 "..." 菜单
3. 选择 "Redeploy"
4. 勾选 "Use existing Build Cache"
5. 点击 "Redeploy"
```

---

## 第六步：配置自定义域名（可选）

### 6.1 添加域名

**步骤**:
```
1. 项目 → "Settings" → "Domains"
2. 输入你的域名
3. 点击 "Add"
```

### 6.2 配置 DNS

**在你的域名提供商**:
```
Type: CNAME
Name: www (或 @)
Value: cname.vercel-dns.com
```

### 6.3 更新环境变量

```
NEXTAUTH_URL → 改为你的自定义域名
例如: https://nextdrive.yourdomain.com
```

---

## 第七步：验证部署

### 7.1 访问应用

```
访问: https://你的项目名.vercel.app
```

### 7.2 测试功能

**检查清单**:
```
✅ 能否打开首页
✅ 能否注册新用户
✅ 能否登录
✅ 能否创建文件夹
✅ 能否上传文件
✅ 能否下载文件
✅ 能否创建分享链接
✅ 能否访问分享链接
```

### 7.3 查看日志

如果有问题：
```
1. Vercel Dashboard → 你的项目
2. 顶部菜单 → "Logs"
3. 查看实时日志
4. 查找错误信息
```

---

## 📋 完整的环境变量清单

### 必需的环境变量

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextdrive?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key

# Vercel Blob（自动添加）
BLOB_READ_WRITE_TOKEN=自动生成
```

### 可选的环境变量

```env
# Google OAuth（如果使用）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🔧 部署后的优化

### 1. 性能优化

**启用图片优化**:
```typescript
// next.config.ts
export default {
  images: {
    domains: ['vercel-blob-store.com'],
  },
}
```

**启用缓存**:
```typescript
// src/app/api/files/route.ts
export const revalidate = 60; // 60秒缓存
```

### 2. 监控和分析

**启用 Vercel Analytics**:
```
1. 项目 → "Analytics"
2. 点击 "Enable Analytics"
```

**安装 Web Vitals**:
```powershell
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. 安全配置

**添加安全头部**:
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}
```

---

## 🐛 常见问题

### 问题 1: 部署失败

**错误**: Build Error

**解决**:
```
1. 检查 package.json 中的依赖版本
2. 确保所有 TypeScript 错误已修复
3. 查看构建日志找出具体错误
```

### 问题 2: MongoDB 连接失败

**错误**: MongooseServerSelectionError

**解决**:
```
1. 检查 MONGODB_URI 是否正确
2. 确认 MongoDB Atlas IP 白名单包含 0.0.0.0/0
3. 检查数据库用户权限
4. 确认连接字符串中包含数据库名称
```

### 问题 3: 环境变量未生效

**错误**: undefined environment variable

**解决**:
```
1. Vercel Dashboard → Settings → Environment Variables
2. 确认所有变量已添加
3. 重新部署项目
```

### 问题 4: 文件上传失败

**错误**: Blob upload error

**解决**:
```
1. 确认已创建 Blob Store
2. 确认 BLOB_READ_WRITE_TOKEN 已设置
3. 检查文件大小限制（Vercel 限制 4.5MB）
```

### 问题 5: NextAuth 错误

**错误**: NEXTAUTH_URL missing

**解决**:
```
1. 设置 NEXTAUTH_URL 为完整域名
2. 确保 NEXTAUTH_SECRET 已设置
3. 重新部署
```

---

## 📊 Vercel 免费套餐限制

### 了解限制

```
✅ 带宽: 100GB/月
✅ 构建时间: 100小时/月
✅ 无服务器函数执行: 100GB-Hrs
✅ 边缘函数执行: 无限制
✅ 图片优化: 1,000张/月
⚠️ 函数大小: 最大 50MB
⚠️ 函数执行时间: 最大 10秒
⚠️ 文件上传大小: 4.5MB
```

### 超出限制的解决方案

**大文件上传**:
- 使用 AWS S3
- 使用 Cloudinary
- 升级 Vercel Pro

**长时间任务**:
- 使用后台任务队列
- 使用 Vercel Cron Jobs

---

## 🎯 部署检查清单

### 部署前

- [ ] 代码已推送到 GitHub
- [ ] MongoDB Atlas 已配置
- [ ] 环境变量已准备好
- [ ] 测试本地构建：`npm run build`

### 部署时

- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] Blob Store 已创建并连接
- [ ] 首次部署成功

### 部署后

- [ ] 应用可以访问
- [ ] 用户可以注册和登录
- [ ] 文件上传功能正常
- [ ] 分享功能正常
- [ ] 没有控制台错误
- [ ] 查看 Vercel 日志确认无错误

---

## 📚 相关资源

### 官方文档

- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob

### 有用的工具

- **环境变量生成**: https://generate-secret.vercel.app
- **MongoDB 连接测试**: MongoDB Compass
- **Vercel CLI**: `npm install -g vercel`

---

## 🎉 完成！

恭喜！你的 NextDrive 应用现在已经在线了！

### 下一步

1. ✅ 分享你的应用链接
2. ✅ 配置自定义域名
3. ✅ 启用分析
4. ✅ 监控性能
5. ✅ 收集用户反馈

### 保持更新

**每次代码更新后**:
```powershell
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会自动检测并重新部署！

---

**部署状态**: 🟢 准备部署  
**预计时间**: 30-60 分钟  
**难度**: ⭐⭐⭐ 中等  

祝部署顺利！🚀

