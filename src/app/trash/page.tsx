'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface FileItem {
  _id: string;
  name: string;
  type: string;
  path: string;
  isFolder: boolean;
  size: number;
  deletedAt: string;
}

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDeletedFiles();
    }
  }, [session]);

  const fetchDeletedFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files?type=trash');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('获取回收站文件错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    if (!confirm('确定要恢复此文件吗？')) return;

    try {
      const res = await fetch(`/api/files/${fileId}/restore`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '恢复失败');
      }

      alert('文件已恢复');
      fetchDeletedFiles();
    } catch (error) {
      console.error('恢复文件错误:', error);
      alert(error instanceof Error ? error.message : '恢复失败');
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    if (!confirm('确定要永久删除此文件吗？此操作无法撤销！')) return;

    try {
      const res = await fetch(`/api/files/${fileId}/permanent`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }

      alert('文件已永久删除');
      fetchDeletedFiles();
    } catch (error) {
      console.error('永久删除文件错误:', error);
      alert(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('确定要清空回收站吗？此操作无法撤销！')) return;

    try {
      const res = await fetch('/api/files/trash/empty', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '清空失败');
      }

      alert('回收站已清空');
      fetchDeletedFiles();
    } catch (error) {
      console.error('清空回收站错误:', error);
      alert(error instanceof Error ? error.message : '清空失败');
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
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">回收站</h1>
            {files.length > 0 && (
              <button 
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-600"
              >
                清空回收站
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                回收站为空
              </h3>
              <p className="text-gray-500">
                删除的文件将在 30 天后永久删除
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">名称</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">大小</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">删除时间</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {file.isFolder ? '📁' : '📄'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.isFolder ? '文件夹' : file.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {file.isFolder ? '-' : formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(file.deletedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(file._id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="恢复"
                          >
                            <RotateCcw className="w-4 h-4" />
                            恢复
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(file._id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="永久删除"
                          >
                            <Trash2 className="w-4 h-4" />
                            永久删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

