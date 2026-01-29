'use client';

import { create } from 'zustand';

interface GameState {
  // Current exercise tracking
  currentExerciseIndex: number;
  currentQuestionIndex: number;
  userExerciseIds: string[];
  
  // Timer
  timeRemaining: number;
  isTimerRunning: boolean;
  
  // Score
  totalScore: number;
  exerciseScores: number[];
  
  // Answers
  answers: Record<string, string[]>; // questionId -> selectedOptionIds
  
  // Phase
  currentPhase: 1 | 2 | 3;
  
  // Actions
  setExercises: (ids: string[]) => void;
  nextQuestion: () => void;
  nextExercise: () => void;
  selectOption: (questionId: string, optionId: string, isMultiple: boolean) => void;
  addScore: (points: number) => void;
  setTimeRemaining: (time: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  setPhase: (phase: 1 | 2 | 3) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentExerciseIndex: 0,
  currentQuestionIndex: 0,
  userExerciseIds: [],
  timeRemaining: 420, // 7 minutes total
  isTimerRunning: false,
  totalScore: 0,
  exerciseScores: [0, 0, 0],
  answers: {},
  currentPhase: 1,

  setExercises: (ids) => set({ userExerciseIds: ids }),

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1,
  })),

  nextExercise: () => set((state) => ({
    currentExerciseIndex: state.currentExerciseIndex + 1,
    currentQuestionIndex: 0,
  })),

  selectOption: (questionId, optionId, isMultiple) =>
    set((state) => {
      const current = state.answers[questionId] || [];
      let newSelection: string[];

      if (isMultiple) {
        if (current.includes(optionId)) {
          newSelection = current.filter((id) => id !== optionId);
        } else {
          newSelection = [...current, optionId];
        }
      } else {
        newSelection = [optionId];
      }

      return {
        answers: {
          ...state.answers,
          [questionId]: newSelection,
        },
      };
    }),

  addScore: (points) =>
    set((state) => {
      const newExerciseScores = [...state.exerciseScores];
      newExerciseScores[state.currentExerciseIndex] += points;
      return {
        totalScore: state.totalScore + points,
        exerciseScores: newExerciseScores,
      };
    }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  startTimer: () => set({ isTimerRunning: true }),

  stopTimer: () => set({ isTimerRunning: false }),

  setPhase: (phase) => set({ currentPhase: phase }),

  resetGame: () =>
    set({
      currentExerciseIndex: 0,
      currentQuestionIndex: 0,
      userExerciseIds: [],
      timeRemaining: 420,
      isTimerRunning: false,
      totalScore: 0,
      exerciseScores: [0, 0, 0],
      answers: {},
    }),
}));
