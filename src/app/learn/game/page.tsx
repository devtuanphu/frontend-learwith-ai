'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { QuizGame } from '@/components/game/QuizGame';
import { GameResult } from '@/components/game/GameResult';
import { PolyaChatInterface } from '@/components/practice/PolyaChatInterface';
import { useGameStore } from '@/store/game';
import Link from 'next/link';

// Updated phases to match the new flow:
// game → game-result → practice2 (Polya 4 steps) → advanced → application → completed
type Phase = 'game' | 'game-result' | 'practice2' | 'advanced' | 'application' | 'completed';

const PHASE_STORAGE_KEY = 'learn-game-phase';

export default function GamePage() {
  const router = useRouter();
  const { totalScore, resetGame } = useGameStore();
  const hasMounted = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Always initialize as 'game' to avoid hydration mismatch
  // Then sync with localStorage after first render
  const [phase, setPhase] = useState<Phase>('game');

  // Hydrate phase from localStorage after mount
  // Using startTransition to avoid cascading render warning
  useEffect(() => {
    const savedPhase = localStorage.getItem(PHASE_STORAGE_KEY) as Phase | null;
    if (
      savedPhase &&
      ['game', 'game-result', 'practice2', 'advanced', 'application', 'completed'].includes(
        savedPhase,
      )
    ) {
      // Wrap in startTransition to avoid cascading render warning
      startTransition(() => setPhase(savedPhase as Phase));
    }
    startTransition(() => setIsHydrated(true));
  }, []);

  // Save phase to localStorage when it changes (skip initial render)
  useEffect(() => {
    if (isHydrated && hasMounted.current) {
      localStorage.setItem(PHASE_STORAGE_KEY, phase);
    } else {
      hasMounted.current = true;
    }
  }, [phase, isHydrated]);

  const handleGameComplete = () => {
    setPhase('game-result');
  };

  const handleStartPractice = () => {
    setPhase('practice2');
  };

  // Practice2 complete → move to Advanced Practice
  const handlePractice2Complete = () => {
    setPhase('advanced');
  };

  // Advanced complete → move to Application
  const handleAdvancedComplete = () => {
    setPhase('application');
  };

  

  // Application complete → Final completed
  const handleApplicationComplete = () => {
    setPhase('completed');
  };

  const handlePlayAgain = () => {
    resetGame();
    localStorage.removeItem(PHASE_STORAGE_KEY);
    // Clear all session storage
    localStorage.removeItem('practice_session');
    localStorage.removeItem('advanced_practice_session');
    localStorage.removeItem('polya_practice_session');
    localStorage.removeItem('application_session');
    setPhase('game');
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
          {/* Progress indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${phase === 'game' || phase === 'game-result' ? 'bg-blue-500' : 'bg-green-500'}`} title="Khởi động" />
              <div className={`w-3 h-3 rounded-full ${phase === 'practice2' || phase === 'advanced' ? 'bg-blue-500' : phase === 'application' || phase === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} title="Luyện tập" />
              <div className={`w-3 h-3 rounded-full ${phase === 'application' ? 'bg-blue-500' : phase === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} title="Vận dụng" />
            </div>
          </div>
        </div>
      </header>

      {/* Phase: Game (Khởi động - 3 exercises) */}
      {phase === 'game' && (
        <div className="py-6">
          <QuizGame onComplete={handleGameComplete} />
        </div>
      )}

      {/* Phase: Game Result with AI Feedback */}
      {phase === 'game-result' && (
        <div className="py-6">
          <GameResult onStartPractice={handleStartPractice} />
        </div>
      )}

      {/* Phase: Practice2 - Luyện tập cơ bản với Polya 4 bước */}
      {phase === 'practice2' && (
        <div className="py-6 px-4">
          <PolyaChatInterface practiceType="basic" onComplete={handlePractice2Complete} />
        </div>
      )}

      {/* Phase: Advanced Practice - Luyện tập nâng cao với Polya 4 bước */}
      {phase === 'advanced' && (
        <div className="py-6 px-4">
          <PolyaChatInterface practiceType="advanced" onComplete={handleAdvancedComplete} />
        </div>
      )}

      {/* Phase: Application (VẬN DỤNG) - Polya 4 bước với bài tổng hợp thực tiễn */}
      {phase === 'application' && (
        <div className="py-6 px-4">
          <PolyaChatInterface practiceType="application" onComplete={handleApplicationComplete} />
        </div>
      )}

      {/* Phase: Completed */}
      {phase === 'completed' && (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tuyệt vời!</h2>
            <p className="text-gray-600 mb-6">
              Bạn đã hoàn thành tất cả các phần học tập!
            </p>
            
            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-2">🎯 Bạn đã đạt được:</h3>
              <ul className="text-left text-green-700 space-y-2">
                <li>✅ Hoàn thành Khởi động với {totalScore} điểm</li>
                <li>✅ Luyện tập cơ bản, củng cố</li>
                <li>✅ Luyện tập nâng cao, mở rộng</li>
                <li>✅ Vận dụng thực tiễn</li>
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
