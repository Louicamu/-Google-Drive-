# NextDrive 快速启动脚本
# 用法: .\start.ps1

Write-Host "🚀 NextDrive 启动脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 MongoDB 服务
Write-Host "📊 检查 MongoDB 服务..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "✅ MongoDB 服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB 服务未运行，正在启动..." -ForegroundColor Yellow
        Start-Service -Name MongoDB
        Write-Host "✅ MongoDB 服务已启动" -ForegroundColor Green
    }
} else {
    Write-Host "❌ 未找到 MongoDB 服务" -ForegroundColor Red
    Write-Host "请先安装 MongoDB 或使用 MongoDB Atlas" -ForegroundColor Yellow
    Write-Host "参考文档: docs/MONGODB.md" -ForegroundColor Yellow
    Write-Host ""
}

# 检查 .env.local 文件
Write-Host ""
Write-Host "📝 检查环境变量文件..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "✅ .env.local 文件已存在" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local 文件不存在，正在创建..." -ForegroundColor Yellow
    
    $envContent = @"
# MongoDB 连接字符串
MONGODB_URI=mongodb://localhost:27017/nextdrive

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=nextdrive-secret-key-change-in-production-2025
"@
    
    $envContent | Out-File -FilePath .env.local -Encoding utf8
    Write-Host "✅ .env.local 文件已创建" -ForegroundColor Green
}

# 检查 node_modules
Write-Host ""
Write-Host "📦 检查依赖包..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "✅ 依赖包已安装" -ForegroundColor Green
} else {
    Write-Host "⚠️  依赖包未安装，正在安装..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ 依赖包安装完成" -ForegroundColor Green
}

# 测试 MongoDB 连接
Write-Host ""
Write-Host "🔗 测试 MongoDB 连接..." -ForegroundColor Yellow
$testScript = "require('mongoose').connect('mongodb://localhost:27017/nextdrive').then(() => { console.log('✅ 连接成功'); process.exit(0); }).catch(e => { console.log('❌ 连接失败:', e.message); process.exit(1); });"

$testResult = node -e $testScript 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $testResult -ForegroundColor Green
} else {
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  MongoDB 连接失败，但你仍可以启动开发服务器" -ForegroundColor Yellow
}

# 启动开发服务器
Write-Host ""
Write-Host "🎯 准备启动开发服务器..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "访问地址: " -NoNewline -ForegroundColor Green
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 启动服务器
npm run dev
