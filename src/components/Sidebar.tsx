'use client';

import { Home, Share2, Clock, Star, Trash2, FolderPlus } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CreateFolderModal from './CreateFolderModal';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

interface SidebarProps {
  onFolderCreated?: () => void;
}

export default function Sidebar({ onFolderCreated }: SidebarProps) {
  const pathname = usePathname();
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  const navItems: NavItem[] = [
    { name: '我的云盘', icon: <Home className="w-5 h-5" />, href: '/drive' },
    { name: '共享给我', icon: <Share2 className="w-5 h-5" />, href: '/shared' },
    { name: '最近使用', icon: <Clock className="w-5 h-5" />, href: '/recent' },
    { name: '星标', icon: <Star className="w-5 h-5" />, href: '/starred' },
    { name: '回收站', icon: <Trash2 className="w-5 h-5" />, href: '/trash' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
      {/* 新建按钮 */}
      <div className="p-4">
        <button
          onClick={() => setShowNewFolderModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <FolderPlus className="w-5 h-5" />
          <span className="font-medium">新建文件夹</span>
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 存储空间 */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-2 text-sm text-gray-600">存储空间</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }} />
        </div>
        <div className="text-xs text-gray-500">已使用 3.5 GB / 10 GB</div>
      </div>

      {/* 新建文件夹模态框 */}
      <CreateFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onSuccess={() => {
          if (onFolderCreated) {
            onFolderCreated();
          }
        }}
      />
    </aside>
  );
}

