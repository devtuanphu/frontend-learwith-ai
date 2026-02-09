'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard,
  Users,
  School,
  LogOut,
  Menu,
  X,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { teacherApi } from '@/lib/api';

interface ClassroomInfo {
  name: string;
  classCode: string;
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'TEACHER') {
        router.push('/dashboard');
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'TEACHER') {
      teacherApi.getClassroom().then((data: ClassroomInfo) => {
        setClassroom(data);
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleCopyCode = async () => {
    if (classroom?.classCode) {
      await navigator.clipboard.writeText(classroom.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted || isLoading || !isAuthenticated || user?.role !== 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const navItems = [
    { href: '/teacher', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/teacher/students', icon: Users, label: 'Học sinh' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <span className="font-semibold text-gray-800">Giáo viên</span>
        <div className="w-10" />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Giáo viên</h2>
                  <p className="text-xs text-gray-500">{user?.name}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Class Code Card */}
          {classroom && (
            <div className="mx-4 mt-4 p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Lớp {classroom.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-purple-800 tracking-widest">{classroom.classCode}</span>
                <button onClick={handleCopyCode} className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors" title="Copy mã lớp">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-purple-500" />}
                </button>
              </div>
              <p className="text-xs text-purple-500 mt-1">Chia sẻ mã này cho học sinh</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium w-full"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
