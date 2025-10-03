'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import { useStore } from '@/store/useStore';

interface FileItem {
  _id: string;
  name: string;
  type: string;
  path: string;
  isFolder: boolean;
  size: number;
  starred: boolean;
  updatedAt: string;
  url?: string;
}

export default function DrivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { viewMode, currentParentId, files, setFiles, setCurrentParentId, setCurrentPath } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchFiles();
    }
  }, [session, currentParentId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentParentId) {
        params.append('parentId', currentParentId);
      }

      const res = await fetch(`/api/files?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('获取文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      setCurrentParentId(file._id);
      setCurrentPath(file.path);
    } else {
      // 文件预览逻辑
      console.log('打开文件:', file);
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onFileUploaded={fetchFiles} />
      
      <div className="flex">
        <Sidebar onFolderCreated={fetchFiles} />
        
        <main className="flex-1 p-6">
          {/* 面包屑导航 */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* 文件列表 */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                这里还没有文件
              </h3>
              <p className="text-gray-500">
                点击"新建文件夹"或"上传"按钮开始使用
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid files={files} onFileClick={handleFileClick} />
          ) : (
            <FileList files={files} onFileClick={handleFileClick} />
          )}
        </main>
      </div>
    </div>
  );
}

