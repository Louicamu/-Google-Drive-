'use client';

import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

export default function Breadcrumb() {
  const { currentPath, setCurrentPath, setCurrentParentId } = useStore();
  const [pathMap, setPathMap] = useState<Record<string, string>>({});

  const pathSegments = currentPath.split('/').filter(Boolean);

  // 获取路径映射关系
  useEffect(() => {
    const fetchPathMap = async () => {
      try {
        const res = await fetch('/api/files?type=all');
        if (res.ok) {
          const files = await res.json();
          const map: Record<string, string> = {};
          
          // 构建路径到ID的映射
          files.forEach((file: any) => {
            if (file.isFolder) {
              map[file.path] = file._id;
            }
          });
          
          setPathMap(map);
        }
      } catch (error) {
        console.error('获取路径映射失败:', error);
      }
    };

    fetchPathMap();
  }, []);

  const handleBreadcrumbClick = (targetPath: string) => {
    if (targetPath === currentPath) return;

    // 更新路径
    setCurrentPath(targetPath);
    
    // 找到对应的父文件夹ID
    const parentId = pathMap[targetPath] || null;
    setCurrentParentId(parentId);
  };

  const handleRootClick = () => {
    setCurrentPath('/');
    setCurrentParentId(null);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <button 
        onClick={handleRootClick}
        className="hover:text-blue-600 font-medium transition-colors"
      >
        我的云盘
      </button>
      {pathSegments.map((segment, index) => {
        // 构建到当前段的路径
        const targetPath = '/' + pathSegments.slice(0, index + 1).join('/');
        const isCurrentPath = targetPath === currentPath;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button 
              onClick={() => handleBreadcrumbClick(targetPath)}
              className={`hover:text-blue-600 transition-colors ${
                isCurrentPath ? 'text-blue-600 font-medium' : ''
              }`}
            >
              {segment}
            </button>
          </div>
        );
      })}
    </div>
  );
}

