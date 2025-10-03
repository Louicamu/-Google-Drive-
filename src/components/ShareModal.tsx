'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Copy, Check, Lock, Calendar } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

export default function ShareModal({ isOpen, onClose, fileId, fileName }: ShareModalProps) {
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [password, setPassword] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);

  if (!isOpen) return null;

  const handleCreateShare = async () => {
    setLoading(true);

    try {
      // 计算过期时间
      let expiresAt = undefined;
      if (expiresIn !== 'never') {
        const now = new Date();
        switch (expiresIn) {
          case '1hour':
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
            break;
          case '1day':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case '7days':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case '30days':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      const res = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permission,
          expiresAt,
          password: password || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建分享失败');
      }

      const data = await res.json();
      setShareUrl(data.shareUrl);
      setIsShared(true);
    } catch (error) {
      console.error('创建分享错误:', error);
      alert('创建分享失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteShare = async () => {
    if (!confirm('确定要删除分享链接吗？')) return;

    try {
      const res = await fetch(`/api/files/${fileId}/share`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('删除失败');
      }

      setShareUrl('');
      setIsShared(false);
      alert('分享链接已删除');
    } catch (error) {
      console.error('删除分享错误:', error);
      alert('删除失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">分享文件</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">文件名</p>
          <p className="font-medium">{fileName}</p>
        </div>

        {!isShared ? (
          <>
            {/* 权限设置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                访问权限
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPermission('view')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                    permission === 'view'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  仅查看
                </button>
                <button
                  onClick={() => setPermission('edit')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                    permission === 'edit'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  可编辑
                </button>
              </div>
            </div>

            {/* 过期时间 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                过期时间
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="never">永不过期</option>
                <option value="1hour">1 小时后</option>
                <option value="1day">1 天后</option>
                <option value="7days">7 天后</option>
                <option value="30days">30 天后</option>
              </select>
            </div>

            {/* 密码保护 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                密码保护（可选）
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="留空表示不设置密码"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 创建按钮 */}
            <button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '创建中...' : '创建分享链接'}
            </button>
          </>
        ) : (
          <>
            {/* 分享链接 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分享链接
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 分享信息 */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <LinkIcon className="w-4 h-4" />
                <span>权限：{permission === 'view' ? '仅查看' : '可编辑'}</span>
              </div>
              {expiresIn !== 'never' && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>过期时间：{expiresIn}</span>
                </div>
              )}
              {password && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>已设置密码保护</span>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteShare}
                className="flex-1 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                删除分享
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                完成
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

