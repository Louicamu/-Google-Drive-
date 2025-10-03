'use client';

import { ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Breadcrumb() {
  const { currentPath } = useStore();

  const pathSegments = currentPath.split('/').filter(Boolean);
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <button className="hover:text-blue-600 font-medium">我的云盘</button>
      {pathSegments.map((segment, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button className="hover:text-blue-600">{segment}</button>
        </div>
      ))}
    </div>
  );
}

