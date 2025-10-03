'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
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

export default function SharedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { viewMode } = useStore();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSharedFiles();
    }
  }, [session]);

  const fetchSharedFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files?type=shared');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('获取共享文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      router.push('/drive');
    } else {
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
      <Navbar onFileUploaded={fetchSharedFiles} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">共享给我</h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                暂无共享文件
              </h3>
              <p className="text-gray-500">
                其他用户分享给您的文件将显示在这里
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

