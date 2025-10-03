# MongoDB 本地运行指南

## ✅ 你的状态

根据检测，你的 MongoDB 已经配置完成：

- ✅ MongoDB 8.2.0 已安装
- ✅ MongoDB 服务正在运行
- ✅ 连接测试成功
- ✅ 数据库：nextdrive
- ✅ 地址：localhost:27017

## 🎯 你现在可以直接使用！

只需确保 `.env.local` 文件包含：

```env
MONGODB_URI=mongodb://localhost:27017/nextdrive
```

## 📋 MongoDB 服务管理命令

### 查看服务状态
```powershell
Get-Service -Name MongoDB
```

### 启动服务
```powershell
Start-Service -Name MongoDB
```

### 停止服务
```powershell
Stop-Service -Name MongoDB
```

### 重启服务
```powershell
Restart-Service -Name MongoDB
```

## 🛠️ 常用操作

### 1. 使用 MongoDB Compass（图形化工具）

如果安装时包含了 Compass：

1. 搜索并打开 "MongoDB Compass"
2. 连接字符串：`mongodb://localhost:27017`
3. 点击 "Connect"

可以可视化查看：
- 数据库列表
- 集合（表）
- 文档（数据）
- 执行查询

### 2. 使用 mongosh（命令行工具）

如果需要安装 mongosh：

**下载并安装**:
```powershell
# 使用 chocolatey（如果已安装）
choco install mongodb-shell

# 或从官网下载
# https://www.mongodb.com/try/download/shell
```

**连接到数据库**:
```bash
mongosh mongodb://localhost:27017/nextdrive
```

**常用命令**:
```javascript
// 显示所有数据库
show dbs

// 切换到 nextdrive 数据库
use nextdrive

// 显示所有集合
show collections

// 查看用户
db.users.find()

// 查看文件
db.fileitems.find()

// 统计文档数量
db.users.countDocuments()
db.fileitems.countDocuments()

// 删除所有数据（谨慎使用）
db.dropDatabase()

// 退出
exit
```

### 3. 使用 VS Code 扩展

安装 MongoDB for VS Code 扩展：

1. 打开 VS Code
2. 扩展市场搜索 "MongoDB for VS Code"
3. 安装官方扩展
4. 连接字符串：`mongodb://localhost:27017`

## 🗂️ 数据库结构

NextDrive 使用以下集合：

### users（用户表）
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "加密后的密码",
  name: "用户名",
  avatar: "头像URL",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### fileitems（文件/文件夹表）
```javascript
{
  _id: ObjectId,
  name: "文件名",
  type: "folder" | "image/png" | "application/pdf",
  path: "/文件夹/子文件夹",
  parentId: ObjectId | null,
  ownerId: ObjectId,
  isFolder: true | false,
  size: 0,
  url: "文件URL",
  starred: false,
  isDeleted: false,
  sharedWith: [],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 🔍 查看应用数据

### 方法 1: 创建查看脚本

创建 `scripts/view-data.js`:

```javascript
const mongoose = require('mongoose');

async function viewData() {
  await mongoose.connect('mongodb://localhost:27017/nextdrive');
  
  const db = mongoose.connection.db;
  
  // 查看所有用户
  const users = await db.collection('users').find().toArray();
  console.log('👥 用户列表:', users.length);
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.email})`);
  });
  
  // 查看所有文件
  const files = await db.collection('fileitems').find().toArray();
  console.log('\n📁 文件列表:', files.length);
  files.forEach(file => {
    console.log(`  - ${file.name} (${file.isFolder ? '文件夹' : '文件'})`);
  });
  
  await mongoose.connection.close();
}

viewData();
```

运行：
```bash
node scripts/view-data.js
```

### 方法 2: 使用 MongoDB Compass

1. 打开 MongoDB Compass
2. 连接到 `mongodb://localhost:27017`
3. 选择 `nextdrive` 数据库
4. 点击集合查看数据

## 🧹 清理数据

如果需要重置数据库：

```javascript
// 删除所有用户
db.users.deleteMany({})

// 删除所有文件
db.fileitems.deleteMany({})

// 或删除整个数据库
use nextdrive
db.dropDatabase()
```

## 🔒 安全建议

### 生产环境配置

1. **启用认证**:
   ```javascript
   // 创建管理员用户
   use admin
   db.createUser({
     user: "admin",
     pwd: "强密码",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
   })
   ```

2. **配置文件** (`mongod.cfg`):
   ```yaml
   security:
     authorization: enabled
   ```

3. **更新连接字符串**:
   ```env
   MONGODB_URI=mongodb://admin:密码@localhost:27017/nextdrive?authSource=admin
   ```

## 📊 性能监控

### 查看慢查询
```javascript
// 启用分析器
db.setProfilingLevel(1, { slowms: 100 })

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### 查看索引
```javascript
db.fileitems.getIndexes()
db.users.getIndexes()
```

## 🔧 故障排除

### 服务无法启动

**查看错误日志**:
```powershell
# 日志位置通常在：
C:\Program Files\MongoDB\Server\8.2\log\mongod.log
```

**常见原因**:
1. 端口 27017 被占用
2. 数据目录权限问题
3. 配置文件错误

**解决方法**:
```powershell
# 检查端口占用
netstat -ano | findstr :27017

# 重启服务
Restart-Service -Name MongoDB
```

### 连接被拒绝

**检查防火墙**:
```powershell
# 允许 MongoDB 端口
New-NetFirewallRule -DisplayName "MongoDB" -Direction Inbound -Protocol TCP -LocalPort 27017 -Action Allow
```

### 数据目录空间不足

**查看数据大小**:
```javascript
db.stats()
```

**清理旧数据**:
```javascript
// 删除 30 天前的回收站文件
db.fileitems.deleteMany({
  isDeleted: true,
  deletedAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})
```

## 📚 更多资源

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [Mongoose 文档](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - 免费课程

## ✨ 快速测试

测试你的 MongoDB 是否正常工作：

```bash
# 在项目根目录运行
node -e "require('mongoose').connect('mongodb://localhost:27017/nextdrive').then(() => console.log('✅ OK')).catch(e => console.log('❌ Error:', e.message))"
```

---

**当前状态**: ✅ MongoDB 8.2.0 运行中  
**数据库**: nextdrive  
**地址**: localhost:27017

