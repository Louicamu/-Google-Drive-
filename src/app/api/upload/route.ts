import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
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

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const ext = file.name.split('.').pop();
      const uniqueFileName = `${timestamp}-${randomStr}.${ext}`;
      
      // 保存文件到 public/uploads
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);

      // 文件 URL（相对于 public 目录）
      const fileUrl = `/uploads/${uniqueFileName}`;

      // 保存到数据库
      const fileItem = await FileItem.create({
        name: file.name,
        type: file.type,
        path: `${path}/${file.name}`,
        parentId: parentId || null,
        ownerId: session.user.id,
        isFolder: false,
        size: file.size,
        url: fileUrl,
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

