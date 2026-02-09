'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface PhaseExercise {
  id: string;
  exerciseName: string;
  score: number;
  timeSpent: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  answersCount: number;
  type?: 'quiz' | 'polya';
}

interface PhaseData {
  phase: number;
  phaseName: string;
  exercises: PhaseExercise[];
}

interface ErrorData {
  errorType: string;
  count: number;
  examples: string[];
}

interface LeaderboardData {
  topicName: string;
  score: number;
  accuracy: number;
  timeMs: number;
}

interface StepResult {
  step: number;
  stepName: string;
  passed: boolean;
  level: string | null;
  score: number;
  levelLabel: string;
  attemptCount: number;
  hintCount: number;
  aiNotes: string | null;
}

interface PolyaEvaluation {
  exerciseId: string;
  problem: string;
  phase: string;
  phaseName: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  steps: StepResult[];
  totalScore: number;
  maxScore: number;
  overallLevel: string;
}

interface StudentDetail {
  student: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  };
  phases: PhaseData[];
  polyaEvaluations: PolyaEvaluation[];
  commonErrors: ErrorData[];
  leaderboardEntries: LeaderboardData[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(0);
  const [expandedEvals, setExpandedEvals] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (studentId) {
      teacherApi.getStudentDetail(studentId).then((d: StudentDetail) => {
        setData(d);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy thông tin học sinh
      </div>
    );
  }

  const { student, phases, polyaEvaluations, commonErrors, leaderboardEntries } = data;

  const toggleEval = (id: string) => {
    setExpandedEvals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Tốt':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Đạt':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cần cố gắng':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 4) return 'bg-blue-500';
    if (score > 0) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const translateErrorType = (type: string) => {
    const map: Record<string, string> = {
      misunderstanding: 'Hiểu sai đề bài',
      calculation_error: 'Lỗi tính toán',
      conceptual_error: 'Sai khái niệm',
      careless_error: 'Lỗi bất cẩn',
      incomplete_answer: 'Trả lời chưa đầy đủ',
      unknown: 'Lỗi khác',
    };
    return map[type] || type;
  };

  const totalExercises = phases.reduce((sum, p) => sum + p.exercises.length, 0);
  const completedExercises = phases.reduce(
    (sum, p) => sum + p.exercises.filter((e) => e.status === 'COMPLETED').length,
    0,
  );
  const totalScore = phases.reduce(
    (sum, p) => sum + p.exercises.reduce((s, e) => s + e.score, 0),
    0,
  );
  const avgScore = totalExercises > 0 ? Math.round(totalScore / totalExercises) : 0;

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}p ${sec}s` : `${sec}s`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back Button + Header */}
      <div className="mb-6">
        <Link href="/teacher/students" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Quay lại</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-xl">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-gray-500">{student.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Tham gia: {new Date(student.joinedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-sm text-gray-500">Bài tập</p>
          <p className="text-xl font-bold text-gray-800">{completedExercises}/{totalExercises}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-sm text-gray-500">Điểm TB</p>
          <p className="text-xl font-bold text-gray-800">{avgScore}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-sm text-gray-500">Lỗi</p>
          <p className="text-xl font-bold text-gray-800">
            {commonErrors.reduce((s, e) => s + e.count, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-sm text-gray-500">Leaderboard</p>
          <p className="text-xl font-bold text-gray-800">{leaderboardEntries.length} chủ đề</p>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          {phases.map((phase, index) => (
            <button
              key={phase.phase}
              onClick={() => setActivePhase(index)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activePhase === index
                  ? 'text-purple-700 border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {phase.phaseName} ({phase.exercises.length})
            </button>
          ))}
        </div>

        <div className="p-4">
          {phases[activePhase]?.exercises.length > 0 ? (
            <div className="space-y-2">
              {phases[activePhase].exercises.map((ex) => (
                <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  {ex.status === 'COMPLETED' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : ex.status === 'IN_PROGRESS' ? (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {ex.type === 'polya' ? ex.exerciseName : 'Bài tập'}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      {ex.type === 'polya' ? (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Polya 4 bước
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {ex.score} điểm
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(ex.timeSpent)}
                          </span>
                          <span>{ex.answersCount} câu trả lời</span>
                        </>
                      )}
                    </div>
                  </div>
                  {ex.startedAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(ex.startedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có bài tập ở giai đoạn này</p>
          )}
        </div>
      </div>

      {/* Polya Evaluations - Đánh giá năng lực GQVĐTH */}
      {polyaEvaluations && polyaEvaluations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-lg">
              📊 Đánh giá năng lực giải quyết vấn đề
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Thang điểm: 0-3 (Cần cố gắng) · 4-6 (Đạt) · 7-8 (Tốt)
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {polyaEvaluations.map((evalItem) => (
              <div key={evalItem.exerciseId}>
                {/* Exercise Header - Click to expand */}
                <button
                  onClick={() => toggleEval(evalItem.exerciseId)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        evalItem.phase === 'BASIC'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : evalItem.phase === 'ADVANCED'
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-pink-50 text-pink-600 border-pink-200'
                      }`}>
                        {evalItem.phaseName}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getLevelColor(evalItem.overallLevel)}`}>
                        {evalItem.overallLevel}
                      </span>
                      {evalItem.status === 'COMPLETED' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">{evalItem.problem}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(evalItem.createdAt).toLocaleDateString('vi-VN')}
                      {evalItem.completedAt && ` — Hoàn thành: ${new Date(evalItem.completedAt).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        {evalItem.totalScore}/{evalItem.maxScore}
                      </p>
                      <p className="text-xs text-gray-400">điểm</p>
                    </div>
                    {expandedEvals.has(evalItem.exerciseId)
                      ? <ChevronUp className="w-5 h-5 text-gray-400" />
                      : <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </button>

                {/* Expanded Step Details */}
                {expandedEvals.has(evalItem.exerciseId) && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      {/* Step Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {evalItem.steps.map((step) => (
                          <div
                            key={step.step}
                            className={`rounded-xl p-4 border ${step.passed ? 'bg-white' : 'bg-gray-100/50 border-dashed'}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                                  {step.step}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  {step.stepName}
                                </span>
                              </div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getLevelColor(step.levelLabel)}`}>
                                {step.levelLabel}
                              </span>
                            </div>

                            {/* Score Bar */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Điểm</span>
                                <span className="font-bold text-gray-700">{step.score}/8</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${getScoreBarColor(step.score)}`}
                                  style={{ width: `${(step.score / 8) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span>Số lần thử: {step.attemptCount}</span>
                              <span>Gợi ý: {step.hintCount}</span>
                            </div>

                            {/* AI Notes */}
                            {step.aiNotes && (
                              <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">
                                📝 {step.aiNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Errors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Lỗi thường gặp</h3>
          {commonErrors.length > 0 ? (
            <div className="space-y-3">
              {commonErrors.map((error, index) => (
                <div key={index} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-800 text-sm">{translateErrorType(error.errorType)}</span>
                    <span className="text-red-600 font-bold text-sm">{error.count} lần</span>
                  </div>
                  {error.examples.length > 0 && (
                    <div className="text-xs text-red-600 space-y-1">
                      {error.examples.map((ex, i) => (
                        <p key={i} className="truncate">• {ex}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Không có lỗi nào</p>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Bảng xếp hạng theo chủ đề</h3>
          {leaderboardEntries.length > 0 ? (
            <div className="space-y-2">
              {leaderboardEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{entry.topicName}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      <span>Chính xác: {Math.round(entry.accuracy * 100)}%</span>
                      <span>Thời gian: {Math.round(entry.timeMs / 1000)}s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-800">{entry.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
