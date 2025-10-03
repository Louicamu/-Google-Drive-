'use client';

import { useState, useCallback } from 'react';
import { X, Upload, File } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { formatFileSize } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

// 检测可用的上传 API
let cachedEndpoint: string | null = null;

async function detectUploadEndpoint(): Promise<string> {
  if (cachedEndpoint) return cachedEndpoint;

  // 检查是否有 BLOB_READ_WRITE_TOKEN (Vercel 环境)
  try {
    const testRes = await fetch('/api/upload-blob', {
      method: 'HEAD',
    });
    if (testRes.ok || testRes.status === 405) {
      cachedEndpoint = '/api/upload-blob';
      return cachedEndpoint;
    }
  } catch {
    // Blob API 不可用，使用本地上传
  }

  cachedEndpoint = '/api/upload';
  return cachedEndpoint;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const { currentParentId, currentPath } = useStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    const formData = new FormData();
    
    // 添加所有文件
    files.forEach(({ file }) => {
      formData.append('files', file);
    });
    
    // 添加其他参数（可以从 store 获取当前路径和父文件夹 ID）
    formData.append('parentId', '');
    formData.append('path', '/');

    try {
      setUploadError('');
      
      // 检测上传 API（先尝试 Blob，失败则使用本地）
      const uploadEndpoint = await detectUploadEndpoint();

      // 逐个上传文件并显示进度
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' as const } : f
          )
        );

        const singleFormData = new FormData();
        singleFormData.append('files', files[i].file);
        singleFormData.append('parentId', currentParentId || '');
        singleFormData.append('path', currentPath || '/');

        // 模拟进度（实际上传很快，这里添加视觉反馈）
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f, idx) => {
              if (idx === i && f.progress < 90) {
                return { ...f, progress: f.progress + 10 };
              }
              return f;
            })
          );
        }, 100);

        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          body: singleFormData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || '上传失败');
        }

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 100, status: 'completed' as const } : f
          )
        );
      }

      // 所有文件上传完成
      setTimeout(() => {
        onSuccess();
        setFiles([]);
        onClose();
      }, 500);
    } catch (error) {
      console.error('上传错误:', error);
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      setUploadError(errorMessage);
      
      // 标记失败的文件
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'error' as const } : f
        )
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">上传文件</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 错误提示 */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {uploadError}
          </div>
        )}

        {/* 拖拽区域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">放开以上传文件...</p>
          ) : (
            <>
              <p className="text-gray-700 mb-2">拖拽文件到这里，或点击选择文件</p>
              <p className="text-sm text-gray-500">支持任意类型的文件</p>
            </>
          )}
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {item.file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>
                    {item.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-xs text-green-600">✓ 上传完成</span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs text-red-600">✗ 上传失败</span>
                    )}
                  </div>
                  {(item.status === 'pending' || item.status === 'error') && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="移除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || files.some((f) => f.status === 'uploading')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上传 {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

