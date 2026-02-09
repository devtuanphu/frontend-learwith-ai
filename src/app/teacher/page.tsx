'use client';

import { useEffect, useState } from 'react';
import { teacherApi } from '@/lib/api';
import {
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  Trophy,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface Statistics {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  phaseDistribution: {
    warmup: number;
    practice: number;
    application: number;
  };
  commonErrors: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    name: string;
    score: number;
  }>;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi.getStatistics().then((data: Statistics) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không thể tải dữ liệu
      </div>
    );
  }

  const totalPhaseStudents = stats.phaseDistribution.warmup + stats.phaseDistribution.practice + stats.phaseDistribution.application;

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan lớp học</h1>
        <p className="text-gray-500 mt-1">Theo dõi tiến độ học tập của học sinh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Tổng học sinh</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Đang hoạt động</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.activeStudents}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% tổng số
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Điểm trung bình</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.averageScore}</p>
        </div>

        <Link href="/teacher/students" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Xem chi tiết</span>
          </div>
          <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
            Danh sách học sinh
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Phân bổ giai đoạn học</h3>
          <div className="space-y-4">
            {[
              { label: 'Khởi động', count: stats.phaseDistribution.warmup, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
              { label: 'Luyện tập', count: stats.phaseDistribution.practice, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
              { label: 'Vận dụng', count: stats.phaseDistribution.application, color: 'bg-green-500', bgColor: 'bg-green-50' },
            ].map((phase) => (
              <div key={phase.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{phase.label}</span>
                  <span className="font-medium text-gray-800">{phase.count} học sinh</span>
                </div>
                <div className={`h-3 ${phase.bgColor} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${phase.color} rounded-full transition-all duration-500`}
                    style={{ width: totalPhaseStudents > 0 ? `${(phase.count / totalPhaseStudents) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Học sinh xuất sắc</h3>
          {stats.topPerformers.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformers.map((student, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{student.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-800">{student.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Common Errors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Lỗi thường gặp</h3>
          {stats.commonErrors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.commonErrors.map((error, index) => (
                <div key={index} className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-800 text-sm">{translateErrorType(error.errorType)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-700">{error.count}</span>
                    <span className="text-sm text-red-500">lần ({error.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu lỗi</p>
          )}
        </div>
      </div>
    </div>
  );
}
