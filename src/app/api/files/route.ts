import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import FileItem from '@/models/FileItem';

// 获取文件列表
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type'); // recent, starred, shared

    await connectDB();

    interface QueryType {
      ownerId?: string;
      isDeleted?: boolean;
      starred?: boolean;
      parentId?: string | null;
      'sharedWith.userId'?: string;
    }

    let query: QueryType = {
      ownerId: session.user.id,
      isDeleted: false,
    };

    // 根据不同类型构建查询
    switch (type) {
      case 'recent':
        // 获取最近修改的文件
        const files = await FileItem.find(query)
          .sort({ updatedAt: -1 })
          .limit(20);
        return NextResponse.json(files);

      case 'starred':
        query.starred = true;
        break;

      case 'shared':
        // 获取分享给我的文件
        query = {
          'sharedWith.userId': session.user.id,
          isDeleted: false,
        };
        break;

      case 'trash':
        // 获取回收站中的文件
        query = {
          ownerId: session.user.id,
          isDeleted: true,
        };
        const trashedFiles = await FileItem.find(query)
          .sort({ deletedAt: -1 });
        return NextResponse.json(trashedFiles);

      default:
        // 获取指定文件夹下的文件
        if (parentId && parentId !== 'null') {
          query.parentId = parentId;
        } else {
          query.parentId = null;
        }
    }

    const files = await FileItem.find(query).sort({ isFolder: -1, name: 1 });

    return NextResponse.json(files);
  } catch (error) {
    console.error('获取文件列表错误:', error);
    return NextResponse.json({ error: '获取文件失败' }, { status: 500 });
  }
}

// 创建文件夹
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { name, parentId, path } = await req.json();

    if (!name) {
      return NextResponse.json({ error: '文件夹名称不能为空' }, { status: 400 });
    }

    await connectDB();

    // 检查同名文件夹
    const existing = await FileItem.findOne({
      name,
      parentId: parentId || null,
      ownerId: session.user.id,
      isDeleted: false,
    });

    if (existing) {
      return NextResponse.json({ error: '文件夹已存在' }, { status: 400 });
    }

    const folder = await FileItem.create({
      name,
      type: 'folder',
      path: path || `/${name}`,
      parentId: parentId || null,
      ownerId: session.user.id,
      isFolder: true,
      size: 0,
      sharedWith: [],
      isDeleted: false,
      starred: false,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('创建文件夹错误:', error);
    return NextResponse.json({ error: '创建文件夹失败' }, { status: 500 });
  }
}

