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

// 更新文件/文件夹
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    await connectDB();

    const file = await FileItem.findOne({
      _id: id,
      ownerId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 允许的更新字段
    const allowedFields = ['name', 'starred', 'parentId'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const updatedFile = await FileItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('更新文件错误:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// 删除文件/文件夹（移到回收站）
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
    });

    if (!file) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 软删除
    await FileItem.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ message: '已移到回收站' });
  } catch (error) {
    console.error('删除文件错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

