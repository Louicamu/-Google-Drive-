import { create } from 'zustand';

interface FileItem {
  _id: string;
  name: string;
  type: string;
  path: string;
  parentId?: string;
  ownerId: string;
  isFolder: boolean;
  size: number;
  url?: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  currentPath: string;
  currentParentId: string | null;
  files: FileItem[];
  viewMode: 'grid' | 'list';
  setCurrentPath: (path: string) => void;
  setCurrentParentId: (id: string | null) => void;
  setFiles: (files: FileItem[]) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  removeFile: (id: string) => void;
}

export const useStore = create<Store>((set) => ({
  currentPath: '/',
  currentParentId: null,
  files: [],
  viewMode: 'grid',
  setCurrentPath: (path) => set({ currentPath: path }),
  setCurrentParentId: (id) => set({ currentParentId: id }),
  setFiles: (files) => set({ files }),
  setViewMode: (mode) => set({ viewMode: mode }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f._id === id ? { ...f, ...updates } : f)),
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f._id !== id),
    })),
}));

