import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 恢复文件/文件夹
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    // 恢复文件
    await FileItem.findByIdAndUpdate(id, {
      isDeleted: false,
      deletedAt: undefined,
    });

    console.log('✅ 文件已恢复:', file.name);
    return NextResponse.json({ message: '文件已恢复', file });
  } catch (error) {
    console.error('❌ 恢复文件错误:', error);
    return NextResponse.json({ error: '恢复失败' }, { status: 500 });
  }
}

