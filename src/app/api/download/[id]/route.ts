import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = await params;

    // 验证文件ID格式
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: '无效的文件ID' }, { status: 400 });
    }

    await connectDB();

    // 查找文件
    const file = await FileItem.findOne({
      _id: id,
      ownerId: session.user.id,
      isFolder: false,
      isDeleted: false,
    });

    if (!file) {
      return NextResponse.json({ error: '文件不存在或已被删除' }, { status: 404 });
    }

    if (!file.url) {
      return NextResponse.json({ error: '文件URL不存在' }, { status: 404 });
    }

    // 构建文件路径
    const filePath = join(process.cwd(), 'public', file.url);
    
    // 调试信息
    console.log('下载调试信息:');
    console.log('- 文件ID:', id);
    console.log('- 文件名:', file.name);
    console.log('- 文件URL:', file.url);
    console.log('- 构建路径:', filePath);
    console.log('- 当前工作目录:', process.cwd());
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error(`文件不存在: ${filePath}`);
      
      // 尝试其他可能的路径
      const alternativePaths = [
        join(process.cwd(), file.url),
        join(process.cwd(), 'public', 'uploads', file.url.split('/').pop() || ''),
        file.url
      ];
      
      console.log('尝试的替代路径:');
      alternativePaths.forEach((altPath, index) => {
        console.log(`- 路径${index + 1}: ${altPath} (存在: ${existsSync(altPath)})`);
      });
      
      return NextResponse.json({ 
        error: '文件在服务器上不存在',
        debug: {
          filePath,
          alternativePaths: alternativePaths.map(p => ({ path: p, exists: existsSync(p) }))
        }
      }, { status: 404 });
    }

    // 检查文件大小
    const fileStats = await stat(filePath);
    if (fileStats.size === 0) {
      return NextResponse.json({ error: '文件为空' }, { status: 400 });
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);

    // 设置正确的Content-Type
    let contentType = file.type;
    if (!contentType || contentType === 'application/octet-stream') {
      // 根据文件扩展名推断类型
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
      };
      contentType = mimeTypes[ext || ''] || 'application/octet-stream';
    }

    // 返回文件
    return new NextResponse(fileBuffer as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('下载错误:', error);
    
    // 根据错误类型返回不同的错误信息
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        return NextResponse.json({ error: '文件不存在' }, { status: 404 });
      }
      if (error.message.includes('EACCES')) {
        return NextResponse.json({ error: '文件访问权限不足' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: '下载失败，请稍后重试' }, { status: 500 });
  }
}

