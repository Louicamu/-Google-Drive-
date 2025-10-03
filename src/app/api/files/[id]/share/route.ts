import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 生成分享链接
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const { permission, expiresAt, password } = await req.json();

    await connectDB();

    const file = await FileItem.findOne({
      _id: id,
      ownerId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 生成唯一的分享令牌
    const token = crypto.randomBytes(16).toString('hex');

    // 如果有密码，加密存储
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 更新文件的分享信息
    file.sharedLink = {
      token,
      permission: permission || 'view',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      password: hashedPassword,
    };

    await file.save();

    // 生成分享链接
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      message: '分享链接创建成功',
      shareUrl,
      token,
      permission: file.sharedLink.permission,
      expiresAt: file.sharedLink.expiresAt,
      hasPassword: !!password,
    });
  } catch (error) {
    console.error('创建分享链接错误:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// 删除分享链接
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

    // 删除分享链接
    file.sharedLink = undefined;
    await file.save();

    return NextResponse.json({ message: '分享链接已删除' });
  } catch (error) {
    console.error('删除分享链接错误:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}

