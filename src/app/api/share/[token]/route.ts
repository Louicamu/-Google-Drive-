import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

// 访问分享链接
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    console.log('🔗 访问分享链接:', { token: token.substring(0, 8) + '...', hasPassword: !!password });

    await connectDB();

    const file = await FileItem.findOne({
      'sharedLink.token': token,
      isDeleted: false,
    });

    if (!file) {
      console.log('❌ 分享链接不存在:', token);
      return NextResponse.json({ error: '分享链接不存在或已失效' }, { status: 404 });
    }

    console.log('✅ 找到文件:', { 
      name: file.name, 
      hasSharedLink: !!file.sharedLink,
      hasExpiry: !!file.sharedLink?.expiresAt,
      hasPassword: !!file.sharedLink?.password
    });

    // 检查是否过期
    if (file.sharedLink?.expiresAt && new Date() > new Date(file.sharedLink.expiresAt)) {
      console.log('⏰ 分享链接已过期');
      return NextResponse.json({ error: '分享链接已过期' }, { status: 410 });
    }

    // 检查密码
    if (file.sharedLink?.password) {
      if (!password) {
        console.log('🔒 需要密码');
        return NextResponse.json(
          { 
            error: '需要密码',
            requiresPassword: true,
          },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, file.sharedLink.password);
      if (!isValid) {
        console.log('❌ 密码错误');
        return NextResponse.json({ error: '密码错误' }, { status: 403 });
      }
      console.log('✅ 密码验证通过');
    }

    // 返回文件信息（不包含敏感信息）
    const fileInfo = {
      _id: file._id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      isFolder: file.isFolder,
      permission: file.sharedLink?.permission,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };

    console.log('✅ 返回文件信息:', { name: fileInfo.name });
    return NextResponse.json(fileInfo);
  } catch (error) {
    console.error('❌ 访问分享链接错误:', error);
    return NextResponse.json({ 
      error: '访问失败', 
      message: error instanceof Error ? error.message : '未知错误' 
    }, { status: 500 });
  }
}

// 下载分享的文件
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const { password } = await req.json();

    await connectDB();

    const file = await FileItem.findOne({
      'sharedLink.token': token,
      isDeleted: false,
    });

    if (!file) {
      return NextResponse.json({ error: '分享链接不存在或已失效' }, { status: 404 });
    }

    // 检查是否过期
    if (file.sharedLink?.expiresAt && new Date() > new Date(file.sharedLink.expiresAt)) {
      return NextResponse.json({ error: '分享链接已过期' }, { status: 410 });
    }

    // 检查密码
    if (file.sharedLink?.password) {
      if (!password) {
        return NextResponse.json({ error: '需要密码' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, file.sharedLink.password);
      if (!isValid) {
        return NextResponse.json({ error: '密码错误' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        _id: file._id,
        name: file.name,
        url: file.url,
      },
    });
  } catch (error) {
    console.error('下载分享文件错误:', error);
    return NextResponse.json({ error: '下载失败' }, { status: 500 });
  }
}

