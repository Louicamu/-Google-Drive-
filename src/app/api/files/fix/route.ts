import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// 文件修复API
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: '缺少文件ID' }, { status: 400 });
    }

    await connectDB();

    // 查找文件记录
    const file = await FileItem.findOne({
      _id: fileId,
      ownerId: session.user.id,
      isFolder: false,
    });

    if (!file) {
      return NextResponse.json({ error: '文件记录不存在' }, { status: 404 });
    }

    // 尝试在uploads目录中查找匹配的文件
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadsDir);
    
    // 查找可能的匹配文件
    const possibleFiles = files.filter(fileName => {
      // 检查文件名是否包含原始文件名的部分
      const originalName = file.name.toLowerCase();
      const currentFileName = fileName.toLowerCase();
      return currentFileName.includes(originalName.split('.')[0]) || 
             originalName.includes(currentFileName.split('.')[0]);
    });

    if (possibleFiles.length > 0) {
      // 找到可能的匹配文件，更新URL
      const matchedFile = possibleFiles[0];
      const newUrl = `/uploads/${matchedFile}`;
      
      await FileItem.findByIdAndUpdate(fileId, {
        url: newUrl,
      });

      return NextResponse.json({
        message: '文件URL已修复',
        oldUrl: file.url,
        newUrl,
        matchedFile,
      });
    } else {
      return NextResponse.json({
        error: '未找到匹配的物理文件',
        availableFiles: files,
        fileInfo: {
          name: file.name,
          url: file.url,
        },
      }, { status: 404 });
    }
  } catch (error) {
    console.error('文件修复错误:', error);
    return NextResponse.json({ error: '修复失败' }, { status: 500 });
  }
}
