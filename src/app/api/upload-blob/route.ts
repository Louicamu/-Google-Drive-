import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';

// Vercel Blob 上传
// 需要先安装: npm install @vercel/blob
// 需要在 Vercel 创建 Blob Store

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查是否在 Vercel 环境
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: '未配置 Vercel Blob',
          message: '请在 Vercel 创建 Blob Store 或使用本地上传 API'
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const parentId = formData.get('parentId') as string | null;
    const path = formData.get('path') as string || '/';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 });
    }

    await connectDB();

    const uploadedFiles = [];

    // 动态导入 Vercel Blob
    const { put } = await import('@vercel/blob');

    for (const file of files) {
      // 上传到 Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      // 保存到数据库
      const fileItem = await FileItem.create({
        name: file.name,
        type: file.type,
        path: `${path}/${file.name}`,
        parentId: parentId || null,
        ownerId: session.user.id,
        isFolder: false,
        size: file.size,
        url: blob.url,
        sharedWith: [],
        isDeleted: false,
        starred: false,
      });

      uploadedFiles.push(fileItem);
    }

    return NextResponse.json({
      message: '上传成功',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}

