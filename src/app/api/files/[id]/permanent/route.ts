import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { unlink } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 永久删除文件/文件夹
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
      isDeleted: true,
    });

    if (!file) {
      return NextResponse.json({ error: '文件不存在或未删除' }, { status: 404 });
    }

    // 如果是文件且有 URL，尝试删除物理文件
    if (!file.isFolder && file.url && file.url.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', file.url);
        await unlink(filePath);
        console.log('🗑️ 已删除物理文件:', file.url);
      } catch (error) {
        console.log('⚠️ 删除物理文件失败（可能已不存在）:', error);
        // 继续删除数据库记录，即使物理文件删除失败
      }
    }

    // 从数据库永久删除
    await FileItem.findByIdAndDelete(id);

    console.log('✅ 文件已永久删除:', file.name);
    return NextResponse.json({ message: '文件已永久删除' });
  } catch (error) {
    console.error('❌ 永久删除文件错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

