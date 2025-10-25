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
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

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
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error('物理文件不存在:', filePath);
      return NextResponse.json({ error: '文件不存在于服务器' }, { status: 404 });
    }

    // 获取文件信息
    const fileStats = await stat(filePath);
    
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
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('下载错误:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '下载失败' 
    }, { status: 500 });
  }
}

