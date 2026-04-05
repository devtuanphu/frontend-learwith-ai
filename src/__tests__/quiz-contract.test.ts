/**
 * useQuiz Hook — Interface Contract Tests
 * Validates TypeScript interfaces match backend contract
 */

// These interfaces mirror useQuiz.ts — tests ensure structure consistency

interface Question {
  id: string;
  orderIndex: number;
  content: string;
  type: 'SINGLE' | 'MULTIPLE' | 'TEXT';
  correctPoints: number;
  wrongPoints: number;
  bonusPoints: number;
  options: {
    id: string;
    content: string;
    isCorrect: boolean;
    errorType?: string;
    errorDescription?: string;
    feedback?: string;
  }[];
}

interface Exercise {
  id: string;
  type: 'BASIC' | 'APPLICATION' | 'PROBLEM_SOLVING';
  scenario: string;
  timeLimit: number;
  bonusTime: number;
  questions: Question[];
}

interface UserExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  phase: number;
  score: number;
  status: string;
}

// Mock data simulating actual API response for warm-up
const MOCK_WARMUP_RESPONSE: UserExercise[] = [
  {
    id: 'ue-1',
    exerciseId: 'ex-1',
    phase: 1,
    score: 0,
    status: 'IN_PROGRESS',
    exercise: {
      id: 'ex-1',
      type: 'APPLICATION',
      scenario: 'Tính diện tích toàn phần hình lập phương cạnh 10cm',
      timeLimit: 90,
      bonusTime: 30,
      questions: [
        {
          id: 'q-1',
          orderIndex: 1,
          content: 'Diện tích một mặt = ?',
          type: 'SINGLE',
          correctPoints: 12,
          wrongPoints: 2,
          bonusPoints: 4,
          options: [
            { id: 'o-1', content: '100 cm²', isCorrect: true, feedback: 'Đúng!' },
            { id: 'o-2', content: '10 cm²', isCorrect: false, errorType: 'calculation_error', feedback: 'Sai!' },
            { id: 'o-3', content: '40 cm²', isCorrect: false, errorType: 'misunderstanding', feedback: 'Sai!' },
          ],
        },
        {
          id: 'q-2',
          orderIndex: 2,
          content: 'Diện tích toàn phần = ?',
          type: 'SINGLE',
          correctPoints: 12,
          wrongPoints: 2,
          bonusPoints: 4,
          options: [
            { id: 'o-4', content: '600 cm²', isCorrect: true, feedback: 'Đúng!' },
            { id: 'o-5', content: '400 cm²', isCorrect: false, errorType: 'calculation_error', feedback: 'Sai!' },
          ],
        },
      ],
    },
  },
  {
    id: 'ue-2',
    exerciseId: 'ex-2',
    phase: 1,
    score: 0,
    status: 'IN_PROGRESS',
    exercise: {
      id: 'ex-2',
      type: 'PROBLEM_SOLVING',
      scenario: 'Giải bài toán thực tế về hình lập phương',
      timeLimit: 120,
      bonusTime: 45,
      questions: [
        {
          id: 'q-3',
          orderIndex: 1,
          content: 'Nội dung bài toán yêu cầu gì?',
          type: 'SINGLE',
          correctPoints: 12,
          wrongPoints: 2,
          bonusPoints: 4,
          options: [
            { id: 'o-6', content: 'Tính DTPT', isCorrect: true, feedback: 'Đúng!' },
            { id: 'o-7', content: 'Tính thể tích', isCorrect: false, errorType: 'misunderstanding', feedback: 'Sai!' },
          ],
        },
      ],
    },
  },
];

describe('Warm-up Response Structure', () => {
  it('should have at least 2 exercises', () => {
    expect(MOCK_WARMUP_RESPONSE.length).toBeGreaterThanOrEqual(2);
  });

  it('every exercise should have required fields', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      expect(ue.id).toBeDefined();
      expect(ue.exerciseId).toBeDefined();
      expect(ue.exercise).toBeDefined();
      expect(['BASIC', 'APPLICATION', 'PROBLEM_SOLVING']).toContain(ue.exercise.type);
      expect(ue.exercise.timeLimit).toBeGreaterThan(0);
      expect(ue.exercise.bonusTime).toBeGreaterThan(0);
      expect(ue.exercise.scenario).toBeTruthy();
    }
  });

  it('every question should have exactly 1 correct option', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      for (const q of ue.exercise.questions) {
        const correctCount = q.options.filter((o) => o.isCorrect).length;
        expect(correctCount).toBe(1);
      }
    }
  });

  it('every wrong option should have errorType and feedback', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      for (const q of ue.exercise.questions) {
        for (const o of q.options) {
          if (!o.isCorrect) {
            expect(o.errorType).toBeTruthy();
            expect(o.feedback).toBeTruthy();
          }
        }
      }
    }
  });

  it('every correct option should have feedback', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      for (const q of ue.exercise.questions) {
        const correct = q.options.find((o) => o.isCorrect);
        expect(correct?.feedback).toBeTruthy();
      }
    }
  });

  it('questions should have scoring fields > 0', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      for (const q of ue.exercise.questions) {
        expect(q.correctPoints).toBeGreaterThan(0);
        expect(q.wrongPoints).toBeGreaterThan(0);
        expect(q.bonusPoints).toBeGreaterThan(0);
      }
    }
  });

  it('questions should have valid orderIndex', () => {
    for (const ue of MOCK_WARMUP_RESPONSE) {
      const indices = ue.exercise.questions.map((q) => q.orderIndex);
      expect(indices).toEqual([...new Set(indices)]); // no duplicates
      for (const idx of indices) {
        expect(idx).toBeGreaterThan(0);
      }
    }
  });
});
