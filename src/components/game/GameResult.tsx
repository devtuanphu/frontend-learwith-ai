'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/game';
import { learningApi } from '@/lib/api';

interface AIFeedback {
  totalFeedback: string;
  questionFeedbacks: Array<{
    questionIndex: number;
    exerciseIndex: number;
    feedback: string;
  }>;
}

export function GameResult({ onStartPractice }: { onStartPractice: () => void }) {
  const { totalScore, exerciseScores, gameResults } = useGameStore();
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchAIFeedback = async () => {
      try {
        const response = await learningApi.getGameFeedback(gameResults);
        setAiFeedback(response);
      } catch (error) {
        console.error('Error fetching AI feedback:', error);
        // Generate simple feedback on error
        setAiFeedback({
          totalFeedback: `Bạn đã hoàn thành trò chơi với ${totalScore} điểm! Tiếp tục luyện tập để cải thiện nhé!`,
          questionFeedbacks: gameResults.map((r) => ({
            questionIndex: r.questionIndex,
            exerciseIndex: r.exerciseIndex,
            feedback: r.isCorrect 
              ? 'Chính xác! Bạn làm rất tốt câu này.' 
              : `Câu này bạn còn nhầm lẫn. ${r.errorDescription || 'Hãy xem lại cách làm nhé!'}`,
          })),
        });
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchAIFeedback();
  }, [gameResults, totalScore]);

  const exerciseColors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];

  const correctCount = gameResults.filter(r => r.isCorrect).length;
  const totalQuestions = gameResults.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header - Score Summary */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white mb-6 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Hoàn thành! 🎉</h1>
        <p className="text-center text-white/80 mb-6">Bạn đã hoàn thành trò chơi</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-sm text-white/70">Tổng điểm</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-white/70">Độ chính xác</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{correctCount}/{totalQuestions}</div>
            <div className="text-sm text-white/70">Câu đúng</div>
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="flex justify-center gap-4">
          {exerciseScores.map((score, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${exerciseColors[i]}`}>
                Bài {i + 1}
              </span>
              <span className="font-bold">{score} đ</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Feedback Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Trợ lý học tập ảo nhận xét</h2>
            <p className="text-sm text-gray-500">Phân tích chi tiết kết quả của bạn</p>
          </div>
        </div>

        {isLoadingFeedback ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            <span className="ml-3 text-gray-600">Trợ lý học tập ảo đang phân tích kết quả...</span>
          </div>
        ) : aiFeedback && (
          <>
            {/* Overall Feedback */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">{aiFeedback.totalFeedback}</p>
            </div>

            {/* Per-Question Feedback */}
            <div className="space-y-3">
              {gameResults.map((result, index) => {
                const isExpanded = expandedQuestion === index;

                return (
                  <div 
                    key={index}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      result.isCorrect ? 'border-green-200' : 'border-orange-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                      className={`w-full p-4 text-left flex items-center gap-3 ${
                        result.isCorrect ? 'bg-green-50' : 'bg-orange-50'
                      }`}
                    >
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-orange-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${exerciseColors[result.exerciseIndex]} text-white`}>
                            Bài {result.exerciseIndex + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            Câu {result.questionIndex + 1}
                          </span>
                          <span className="text-sm text-gray-500">
                            +{result.earnedPoints} đ
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white border-t">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Câu hỏi:</strong> {result.questionContent}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Bạn chọn:</strong> {result.selectedOption}
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-600 mb-2">
                            <strong>Đáp án đúng:</strong> {result.correctOption}
                          </p>
                        )}
                        <div className={`mt-3 p-3 rounded-lg ${result.isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}>
                          <p className="text-sm">{result.feedback || (result.isCorrect ? 'Chính xác! Bạn làm rất tốt câu này.' : 'Hãy xem lại cách làm nhé!')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onStartPractice}
        className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
      >
        🤖 Luyện tập cùng Trợ lí học tập ảo →
      </button>
    </div>
  );
}
