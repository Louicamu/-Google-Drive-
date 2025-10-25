import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { existsSync } from 'fs';
import { join } from 'path';

// 文件同步检查API
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    await connectDB();

    // 获取用户的所有文件
    const files = await FileItem.find({
      ownerId: session.user.id,
      isFolder: false,
      isDeleted: false,
    });

    const syncResults = files.map(file => {
      const filePath = join(process.cwd(), 'public', file.url || '');
      const exists = existsSync(filePath);
      
      return {
        id: file._id,
        name: file.name,
        url: file.url,
        path: filePath,
        exists,
        size: file.size,
        createdAt: file.createdAt,
      };
    });

    const stats = {
      total: files.length,
      exists: syncResults.filter(f => f.exists).length,
      missing: syncResults.filter(f => !f.exists).length,
      uploadsDir: join(process.cwd(), 'public', 'uploads'),
      uploadsDirExists: existsSync(join(process.cwd(), 'public', 'uploads')),
    };

    return NextResponse.json({
      stats,
      files: syncResults,
    });
  } catch (error) {
    console.error('文件同步检查错误:', error);
    return NextResponse.json({ error: '检查失败' }, { status: 500 });
  }
}
