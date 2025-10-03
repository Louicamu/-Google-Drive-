'use client';

import { useEffect, useState, use } from 'react';
import { Download, Lock, File as FileIcon, Folder, ArrowLeft } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

interface FileInfo {
  _id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  isFolder: boolean;
  permission: 'view' | 'edit';
  createdAt: string;
  updatedAt: string;
}

export default function SharePage({ params }: PageProps) {
  const { token } = use(params);
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchFileInfo = async (pwd?: string) => {
    setLoading(true);
    setPasswordError('');

    try {
      const url = new URL(`/api/share/${token}`, window.location.origin);
      if (pwd) {
        url.searchParams.set('password', pwd);
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || '获取文件信息失败');
      }

      setFile(data);
      setRequiresPassword(false);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('请输入密码');
      return;
    }
    fetchFileInfo(password);
  };

  const handleDownload = async () => {
    if (!file || file.isFolder) return;

    try {
      // 如果需要密码，使用验证过的密码
      const res = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '下载失败');
      }

      // 直接下载文件
      const link = document.createElement('a');
      link.href = file.url || '';
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">访问失败</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">需要密码</h1>
            <p className="text-gray-600">此分享链接受密码保护</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                访问密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              访问
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            NextDrive
          </Link>
          <span className="text-sm text-gray-500">分享的文件</span>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 文件信息 */}
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              {file.isFolder ? (
                <Folder className="w-20 h-20 text-blue-500" />
              ) : (
                <FileIcon className="w-20 h-20 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {file.name}
              </h1>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">类型：</span>
                  <span>{file.isFolder ? '文件夹' : file.type}</span>
                </div>
                {!file.isFolder && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">大小：</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">更新时间：</span>
                  <span>
                    {format(new Date(file.updatedAt), 'yyyy-MM-dd HH:mm', {
                      locale: zhCN,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">权限：</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {file.permission === 'view' ? '仅查看' : '可编辑'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 预览区域（如果是图片） */}
          {file.type.startsWith('image/') && file.url && (
            <div className="mb-8">
              <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '200px' }}>
                <Image
                  src={file.url}
                  alt={file.name}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            {!file.isFolder && (
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Download className="w-5 h-5" />
                下载文件
              </button>
            )}
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              访问 NextDrive
            </Link>
          </div>

          {/* 底部提示 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              此文件通过 NextDrive 分享 • 
              <Link href="/" className="text-blue-600 hover:underline ml-1">
                了解更多
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

