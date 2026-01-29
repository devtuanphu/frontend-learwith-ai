'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Clock, Star } from 'lucide-react';
import { QuizGame } from '@/components/game/QuizGame';
import { ChatInterface } from '@/components/practice/ChatInterface';
import { useGameStore } from '@/store/game';
import Link from 'next/link';

type Phase = 'warmup' | 'warmup-result' | 'practice-basic' | 'practice-advanced' | 'application' | 'completed';

const PHASE_STORAGE_KEY = 'learn-game-phase';

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('warmup');
  const [isHydrated, setIsHydrated] = useState(false);
  const { totalScore, resetGame } = useGameStore();

  // Restore phase from localStorage after hydration (client-side only)
  useEffect(() => {
    const savedPhase = localStorage.getItem(PHASE_STORAGE_KEY) as Phase | null;
    if (savedPhase && ['warmup', 'warmup-result', 'practice-basic', 'practice-advanced', 'application', 'completed'].includes(savedPhase)) {
      setPhase(savedPhase);
    }
    setIsHydrated(true);
  }, []);

  // Save phase to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(PHASE_STORAGE_KEY, phase);
    }
  }, [phase, isHydrated]);

  const handleWarmupComplete = () => {
    setPhase('warmup-result');
  };

  const handleStartPractice = () => {
    setPhase('practice-basic');
  };

  const handlePracticeBasicComplete = () => {
    setPhase('practice-advanced');
  };

  const handlePracticeAdvancedComplete = () => {
    setPhase('application');
  };

  const handleApplicationComplete = () => {
    setPhase('completed');
  };

  const handlePlayAgain = () => {
    resetGame();
    localStorage.removeItem(PHASE_STORAGE_KEY);
    setPhase('warmup');
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
            <h1 className="font-bold text-gray-800">Phép nhân số thập phân</h1>
            <p className="text-sm text-gray-500">Lớp 5 - Số và Phép tính</p>
          </div>
        </div>
      </header>

      {/* Phase: Warm-up Game */}
      {phase === 'warmup' && (
        <div className="py-6">
          <QuizGame onComplete={handleWarmupComplete} />
        </div>
      )}

      {/* Phase: Warm-up Result */}
      {phase === 'warmup-result' && (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Xuất sắc! 🎉</h2>
            <p className="text-gray-600 mb-6">Bạn đã hoàn thành phần Khởi động</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4">
                <Star className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{totalScore}</div>
                <div className="text-sm text-gray-500">Tổng điểm</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">3</div>
                <div className="text-sm text-gray-500">Bài hoàn thành</div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-purple-700">
                🤖 Trợ lí AI đã phân tích kết quả của bạn và sẵn sàng giúp bạn luyện tập những phần còn chưa chắc!
              </p>
            </div>

            <button
              onClick={handleStartPractice}
              className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Luyện tập cùng Trợ lí AI →
            </button>
          </div>
        </div>
      )}

      {/* Phase: Practice Basic (Phase 2) */}
      {phase === 'practice-basic' && (
        <div className="py-6 px-4">
          <ChatInterface phase={2} onComplete={handlePracticeBasicComplete} />
        </div>
      )}

      {/* Phase: Practice Advanced (still Phase 2) */}
      {phase === 'practice-advanced' && (
        <div className="py-6 px-4">
          <ChatInterface phase={2} onComplete={handlePracticeAdvancedComplete} />
        </div>
      )}

      {/* Phase: Application (Phase 3) */}
      {phase === 'application' && (
        <div className="py-6 px-4">
          <ChatInterface phase={3} onComplete={handleApplicationComplete} />
        </div>
      )}

      {/* Phase: Completed */}
      {phase === 'completed' && (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tuyệt vời!</h2>
            <p className="text-gray-600 mb-6">
              Bạn đã hoàn thành cả 3 lộ trình học tập!
            </p>
            
            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-2">🎯 Bạn đã đạt được:</h3>
              <ul className="text-left text-green-700 space-y-2">
                <li>✅ Hoàn thành phần Khởi động với {totalScore} điểm</li>
                <li>✅ Luyện tập sửa lỗi cùng Trợ lí AI</li>
                <li>✅ Vận dụng kiến thức vào bài toán thực tiễn</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePlayAgain}
                className="flex-1 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Chơi lại
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
