'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { BookOpen, Gamepad2, Trophy, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Học Toán Cùng AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Xin chào, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Hãy bắt đầu hành trình học toán thú vị cùng Trợ lí AI nhé!
          </p>
        </div>

        {/* Learning Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Trò Chơi Card */}
          <button
            onClick={() => router.push('/game')}
            className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Trò chơi</h3>
              <p className="text-gray-600 mb-4">
                Chọn chủ đề và bắt đầu chơi game toán học thú vị
              </p>
              <div className="flex items-center text-green-600 font-medium">
                Bắt đầu chơi
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>

          {/* Thành tích Card */}
          <button
            onClick={() => router.push('/progress')}
            className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Thành Tích</h3>
              <p className="text-gray-600 mb-4">
                Xem tiến trình học tập, điểm số và các lỗi sai cần cải thiện
              </p>
              <div className="flex items-center text-orange-600 font-medium">
                Xem thành tích
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Topic Selection Preview */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Chủ đề hiện có</h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Phép nhân số thập phân</h4>
                <p className="text-sm text-gray-500">Lớp 5 - Số và Phép tính</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Đang mở
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
