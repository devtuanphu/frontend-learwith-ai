'use client';

import { useState, useCallback } from 'react';
import { progressApi, learningApi } from '@/lib/api';
import { useGameStore } from '@/store/game';

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

interface HistoryMessage {
  id: string;
  role: 'USER' | 'user' | 'AI' | 'model';
  content: string;
  promptType?: string;
  emotion?: string;
}

interface ApiSessionResponse {
  session: { id: string };
  exercise: Exercise;
  welcomeMessage: string;
}

export function useQuiz() {
  const [userExercises, setUserExercises] = useState<UserExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ aiFeedback: string } | null>(null);
  
  const {
    currentExerciseIndex,
    currentQuestionIndex,
    answers,
    selectOption,
    addScore,
    nextQuestion,
    nextExercise,
    setExercises,
  } = useGameStore();

  const currentExercise = userExercises[currentExerciseIndex];
  const currentQuestion = currentExercise?.exercise.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestion && 
    currentQuestionIndex === currentExercise.exercise.questions.length - 1;
  const isLastExercise = currentExerciseIndex === userExercises.length - 1;

  const startWarmUp = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const exercises = await progressApi.startWarmUp();
      setUserExercises(exercises);
      setExercises(exercises.map((e: UserExercise) => e.id));
    } catch (err) {
      setError('Không thể bắt đầu trò chơi. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [setExercises]);

  const submitAnswer = useCallback(async (timeSpent: number) => {
    if (!currentExercise || !currentQuestion) return;

    const selectedOptionIds = answers[currentQuestion.id] || [];
    
    try {
      const response = await progressApi.submitAnswer({
        userExerciseId: currentExercise.id,
        questionId: currentQuestion.id,
        selectedOptionIds,
        timeSpent,
      });
      
      addScore(response.earnedPoints);
      
      if (isLastQuestion) {
        await progressApi.completeExercise(currentExercise.id);
        if (!isLastExercise) {
          nextExercise();
        }
      } else {
        nextQuestion();
      }
      
      return response;
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  }, [currentExercise, currentQuestion, answers, addScore, isLastQuestion, isLastExercise, nextExercise, nextQuestion]);

  const getResult = useCallback(async () => {
    if (!currentExercise) return;
    try {
      const res = await progressApi.getResult(currentExercise.id);
      setResult(res);
      return res;
    } catch (err) {
      console.error('Error getting result:', err);
    }
  }, [currentExercise]);

  return {
    userExercises,
    currentExercise,
    currentQuestion,
    currentExerciseIndex,
    currentQuestionIndex,
    isLoading,
    error,
    result,
    isLastQuestion,
    isLastExercise,
    answers,
    selectOption,
    startWarmUp,
    submitAnswer,
    getResult,
    totalQuestions: currentExercise?.exercise.questions.length || 0,
  };
}

export function useChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'USER' | 'AI';
    content: string;
    promptType?: string;
    emotion?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  const loadSession = async (key: string, apiCall: () => Promise<ApiSessionResponse>) => {
    setIsLoading(true);
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const { sessionId, exercise } = JSON.parse(savedData);
        try {
          const history = await learningApi.getMessages(sessionId);
          setSessionId(sessionId);
          setExercise(exercise);
          setMessages(history.map((msg: HistoryMessage) => ({
            id: msg.id,
            role: (msg.role === 'USER' || msg.role === 'user') ? 'USER' : 'AI',
            content: msg.content,
            promptType: msg.promptType,
            emotion: msg.emotion
          })));
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem(key);
        }
      }

      const response = await apiCall();
      setSessionId(response.session.id);
      setExercise(response.exercise);
      setMessages([{
        id: Date.now().toString(),
        role: 'AI',
        content: response.welcomeMessage,
        promptType: 'SCAFFOLDING_1',
        emotion: 'happy',
      }]);
      
      localStorage.setItem(key, JSON.stringify({
        sessionId: response.session.id,
        exercise: response.exercise
      }));
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPractice = useCallback(() => {
    return loadSession('practice_session', learningApi.startPractice);
  }, []);

  const startApplication = useCallback(() => {
    return loadSession('application_session', learningApi.startApplication);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return;

    // Add user message
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'USER',
      content,
    }]);

    setIsLoading(true);
    try {
      const response = await learningApi.chat(sessionId, content);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: response.aiResponse,
        promptType: response.promptType,
        emotion: response.emotion, // Now comes from Gemini evaluation
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const completeSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await learningApi.completeSession(sessionId);
      // Clear storage for both potential session types to clean up
      localStorage.removeItem('practice_session');
      localStorage.removeItem('application_session');
    } catch (err) {
      console.error('Error completing session:', err);
    }
  }, [sessionId]);

  return {
    sessionId,
    messages,
    isLoading,
    exercise,
    startPractice,
    startApplication,
    sendMessage,
    completeSession,
  };
}
