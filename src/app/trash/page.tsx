'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              清空回收站
            </button>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">🗑️</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              回收站为空
            </h3>
            <p className="text-gray-500">
              删除的文件将在 30 天后永久删除
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

