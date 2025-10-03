'use client';

import { Folder, File, Star, MoreVertical } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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

interface FileListProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
}

export default function FileList({ files, onFileClick }: FileListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-600">
        <div className="col-span-6">名称</div>
        <div className="col-span-2">修改时间</div>
        <div className="col-span-2">大小</div>
        <div className="col-span-2 text-right">操作</div>
      </div>

      {/* 文件列表 */}
      <div className="divide-y divide-gray-100">
        {files.map((file) => (
          <div
            key={file._id}
            onClick={() => onFileClick(file)}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
          >
            {/* 名称 */}
            <div className="col-span-6 flex items-center gap-3">
              {file.isFolder ? (
                <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : (
                <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <span className="truncate font-medium">{file.name}</span>
              {file.starred && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            {/* 修改时间 */}
            <div className="col-span-2 flex items-center text-sm text-gray-600">
              {format(new Date(file.updatedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </div>

            {/* 大小 */}
            <div className="col-span-2 flex items-center text-sm text-gray-600">
              {file.isFolder ? '-' : formatFileSize(file.size)}
            </div>

            {/* 操作 */}
            <div className="col-span-2 flex items-center justify-end">
              <button
                className="p-2 hover:bg-gray-200 rounded transition"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

