import Link from 'next/link';
import { BookOpen, Gamepad2, Bot, Trophy, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Học Toán Thông Minh
            </h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Đăng ký
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Học toán thông minh với{' '}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trợ lý học tập ảo
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Hệ thống học tập cá nhân hóa dành cho học sinh lớp 5, giúp nắm vững phép nhân số thập phân thông qua trò chơi tương tác và hướng dẫn từ Trợ lý học tập ảo.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30"
          >
            Bắt đầu học ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <Gamepad2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Học qua Game</h3>
            <p className="text-gray-600">
              Trắc nghiệm tương tác với điểm số, thời gian, và bảng xếp hạng giúp học tập trở nên thú vị.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Trợ lý học tập ảo</h3>
            <p className="text-gray-600">
              Trợ lý học tập ảo phân tích lỗi sai và tạo bài tập riêng để giúp bạn cải thiện điểm yếu.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">3 Lộ trình</h3>
            <p className="text-gray-600">
              Khởi động → Luyện tập sửa lỗi → Vận dụng thực tiễn. Học theo quy trình khoa học.
            </p>
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📚 Quy trình học tập
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-green-800">Khởi động</h4>
              </div>
              <p className="text-sm text-green-700">
                Trò chơi trắc nghiệm 3 bài (7 phút). Trợ lý phân tích lỗi sai.
              </p>
            </div>
            <div className="hidden md:block text-3xl text-gray-300">→</div>
            <div className="flex-1 p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-purple-800">Luyện tập</h4>
              </div>
              <p className="text-sm text-purple-700">
                Chat với Trợ lý học tập ảo. Bài tập tập trung vào lỗi sai của bạn.
              </p>
            </div>
            <div className="hidden md:block text-3xl text-gray-300">→</div>
            <div className="flex-1 p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-orange-800">Vận dụng</h4>
              </div>
              <p className="text-sm text-orange-700">
                Bài toán thực tiễn tổng hợp. Kiểm tra tiến bộ của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Học Toán Thông Minh - Dự án học tập thông minh cho học sinh lớp 5</p>
        </div>
      </footer>
    </div>
  );
}
