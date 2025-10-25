import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { unlink } from 'fs/promises';
import { join } from 'path';

// 清空回收站
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    await connectDB();

    // 获取所有已删除的文件
    const deletedFiles = await FileItem.find({
      ownerId: session.user.id,
      isDeleted: true,
    });

    if (deletedFiles.length === 0) {
      return NextResponse.json({ message: '回收站已经是空的' });
    }

    let deletedCount = 0;
    let physicalFilesDeleted = 0;

    // 删除物理文件和数据库记录
    for (const file of deletedFiles) {
      // 如果是文件且有 URL，尝试删除物理文件
      if (!file.isFolder && file.url && file.url.startsWith('/uploads/')) {
        try {
          const filePath = join(process.cwd(), 'public', file.url);
          await unlink(filePath);
          physicalFilesDeleted++;
          console.log('🗑️ 已删除物理文件:', file.url);
        } catch {
          console.log('⚠️ 删除物理文件失败:', file.url);
          // 继续删除数据库记录
        }
      }

      // 从数据库删除
      await FileItem.findByIdAndDelete(file._id);
      deletedCount++;
    }

    console.log(`✅ 回收站已清空: ${deletedCount} 个项目, ${physicalFilesDeleted} 个物理文件`);
    
    return NextResponse.json({ 
      message: '回收站已清空',
      deletedCount,
      physicalFilesDeleted,
    });
  } catch (error) {
    console.error('❌ 清空回收站错误:', error);
    return NextResponse.json({ error: '清空失败' }, { status: 500 });
  }
}

