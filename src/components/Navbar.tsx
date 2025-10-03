'use client';

import { signOut, useSession } from 'next-auth/react';
import { Search, Upload, User, LogOut, Grid, List } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import UploadModal from './UploadModal';

interface NavbarProps {
  onFileUploaded?: () => void;
}

export default function Navbar({ onFileUploaded }: NavbarProps) {
  const { data: session } = useSession();
  const { viewMode, setViewMode } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 左侧：Logo 和搜索 */}
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-blue-600">NextDrive</h1>
          
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件和文件夹..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 右侧：操作按钮和用户信息 */}
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="网格视图"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 上传按钮 */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            <span>上传</span>
          </button>

          {/* 用户菜单 */}
          {session?.user && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <span className="text-sm font-medium">{session.user.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="退出登录"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 上传模态框 */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          if (onFileUploaded) {
            onFileUploaded();
          }
        }}
      />
    </nav>
  );
}

