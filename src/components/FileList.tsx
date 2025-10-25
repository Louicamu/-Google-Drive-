'use client';

import { Folder, File, Star, MoreVertical, Download, Trash, Share } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';
import ShareModal from './ShareModal';

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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileItem;
  } | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleDownload = async (file: FileItem) => {
    if (file.isFolder) return;
    
    try {
      const res = await fetch(`/api/download/${file._id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '下载失败');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载错误:', error);
      alert(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    closeContextMenu();
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`确定要删除 "${file.name}" 吗？`)) return;
    
    try {
      const res = await fetch(`/api/files/${file._id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '删除失败');
      }
      
      // 刷新列表
      window.location.reload();
    } catch (error) {
      console.error('删除错误:', error);
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    closeContextMenu();
  };

  const handleStar = async (file: FileItem) => {
    try {
      const res = await fetch(`/api/files/${file._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !file.starred }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '操作失败');
      }
      
      // 刷新列表
      window.location.reload();
    } catch (error) {
      console.error('星标错误:', error);
      alert(`操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    closeContextMenu();
  };

  const handleShare = (file: FileItem) => {
    setShareFile(file);
    closeContextMenu();
  };
  return (
    <>
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
              onContextMenu={(e) => handleContextMenu(e, file)}
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
                    handleContextMenu(e, file);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {!contextMenu.file.isFolder && (
              <button 
                onClick={() => handleDownload(contextMenu.file)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
              >
                <Download className="w-4 h-4" />
                <span>下载</span>
              </button>
            )}
            <button 
              onClick={() => handleShare(contextMenu.file)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <Share className="w-4 h-4" />
              <span>分享</span>
            </button>
            <button 
              onClick={() => handleStar(contextMenu.file)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
            >
              <Star className="w-4 h-4" />
              <span>{contextMenu.file.starred ? '取消星标' : '添加星标'}</span>
            </button>
            <div className="border-t border-gray-200 my-2" />
            <button 
              onClick={() => handleDelete(contextMenu.file)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-red-600"
            >
              <Trash className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </>
      )}

      {/* 分享模态框 */}
      {shareFile && (
        <ShareModal
          isOpen={!!shareFile}
          onClose={() => setShareFile(null)}
          fileId={shareFile._id}
          fileName={shareFile.name}
        />
      )}
    </>
  );
}

