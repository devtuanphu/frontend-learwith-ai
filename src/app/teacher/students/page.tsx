'use client';

import { useEffect, useState } from 'react';
import { teacherApi } from '@/lib/api';
import {
  Search,
  Clock,
  TrendingUp,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface StudentSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalExercises: number;
  completedExercises: number;
  currentPhase: number;
  averageScore: number;
  warmupScore: number;
  lastActiveAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'phase'>('name');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    teacherApi.getStudents().then((data: StudentSummary[]) => {
      setStudents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleRemove = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${studentName} khỏi lớp?`)) return;
    setDeleting(studentId);
    try {
      await teacherApi.removeStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch {
      alert('Không thể xóa học sinh');
    } finally {
      setDeleting(null);
    }
  };

  const phaseName = (phase: number) => {
    switch (phase) {
      case 1: return 'Khởi động';
      case 2: return 'Luyện tập';
      case 3: return 'Vận dụng';
      default: return 'Chưa bắt đầu';
    }
  };

  const phaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filtered = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.averageScore - a.averageScore;
        case 'phase': return b.currentPhase - a.currentPhase;
        default: return a.name.localeCompare(b.name);
      }
    });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách học sinh</h1>
          <p className="text-gray-500 mt-1">{students.length} học sinh trong lớp</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'phase')}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="name">Tên A-Z</option>
            <option value="score">Điểm cao nhất</option>
            <option value="phase">Giai đoạn</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((student) => (
            <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
              <div className="p-5 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{student.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phaseColor(student.currentPhase)}`}>
                      {phaseName(student.currentPhase)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{student.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Điểm TB</span>
                    </div>
                    <p className="font-bold text-gray-800">{student.averageScore}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Bài tập</div>
                    <p className="font-bold text-gray-800">{student.completedExercises}/{student.totalExercises}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hoạt động</span>
                    </div>
                    <p className="text-sm text-gray-600">{timeAgo(student.lastActiveAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemove(student.id, student.name)}
                    disabled={deleting === student.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa khỏi lớp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/teacher/students/${student.id}`}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-400 text-lg">
            {search ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào trong lớp'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Chia sẻ mã lớp để học sinh tham gia
          </p>
        </div>
      )}
    </div>
  );
}
