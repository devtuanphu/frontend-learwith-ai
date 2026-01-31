'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator, Percent, Hash } from 'lucide-react';
import Link from 'next/link';

interface TopicCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  available: boolean;
}

const topics: TopicCard[] = [
  {
    id: 'decimal_numbers',
    name: 'Số thập phân',
    description: 'Khái niệm và cách đọc, viết số thập phân',
    icon: <Hash className="w-8 h-8 text-white" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-400 to-blue-600',
    available: false,
  },
  {
    id: 'decimal_operations',
    name: 'Các phép tính với số thập phân',
    description: 'Cộng, trừ, nhân, chia số thập phân',
    icon: <Calculator className="w-8 h-8 text-white" />,
    color: 'text-green-600',
    bgGradient: 'from-green-400 to-emerald-600',
    available: true,
  },
  {
    id: 'ratio_percentage',
    name: 'Tỉ số. Tỉ số phần trăm',
    description: 'Tỉ số, tỉ lệ và phần trăm',
    icon: <Percent className="w-8 h-8 text-white" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-400 to-purple-600',
    available: false,
  },
];

export default function LearnPage() {
  const router = useRouter();

  const handleTopicClick = (topic: TopicCard) => {
    if (topic.available) {
      router.push(`/learn/game?category=${topic.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-800">Chọn chủ đề học</h1>
            <p className="text-sm text-gray-500">Lớp 5 - Số và Phép tính</p>
          </div>
        </div>
      </header>

      {/* Topic Selection */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📚 Chọn chủ đề bạn muốn học
          </h2>
          <p className="text-gray-600">
            Chọn một chủ đề để bắt đầu trò chơi học toán cùng AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              disabled={!topic.available}
              className={`relative group bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 text-left
                ${topic.available 
                  ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Gradient background effect */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${topic.bgGradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${topic.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {topic.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {topic.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {topic.description}
                </p>

                {/* Status Badge */}
                {topic.available ? (
                  <div className={`inline-flex items-center ${topic.color} font-medium text-sm`}>
                    Bắt đầu học
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                ) : (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    Sắp ra mắt
                  </span>
                )}
              </div>

              {/* Available indicator */}
              {topic.available && (
                <div className="absolute top-4 right-4">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-white/60 backdrop-blur rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">
            💡 Các chủ đề khác sẽ được mở trong thời gian tới. Hãy bắt đầu với 
            <span className="font-medium text-green-600"> Các phép tính với số thập phân</span>!
          </p>
        </div>
      </main>
    </div>
  );
}
