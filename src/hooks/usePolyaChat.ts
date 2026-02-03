'use client';

import { useState, useCallback } from 'react';
import { learningApi } from '@/lib/api';

interface PolyaChatMessage {
  id: string;
  role: 'USER' | 'AI';
  content: string;
  step?: number;
  passed?: boolean;
}

interface PracticeExercise {
  id: string;
  problem: string;
  currentPolyaStep: number;
}

export type PracticeType = 'basic' | 'advanced' | 'application';

export function usePolyaChat(practiceType: PracticeType = 'basic') {
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState<PolyaChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Storage key based on practice type
  const storageKey = practiceType === 'application'
    ? 'polya_application_session'
    : practiceType === 'advanced' 
      ? 'polya_advanced_session' 
      : 'polya_practice_session';

  const startPractice = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check localStorage first
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        setExerciseId(data.exerciseId);
        setProblem(data.problem);
        setCurrentStep(data.currentStep || 1);
        if (data.messages) {
          setMessages(data.messages);
        }
        setIsLoading(false);
        return;
      }

      // Start new session based on practice type
      let response;
      if (practiceType === 'application') {
        response = await learningApi.startApplicationPractice();
      } else if (practiceType === 'advanced') {
        response = await learningApi.startAdvancedPractice();
      } else {
        response = await learningApi.startBasicPractice2();
      }
      const exercise = response.practiceExercise as PracticeExercise;
      
      setExerciseId(exercise.id);
      setProblem(exercise.problem);
      setCurrentStep(exercise.currentPolyaStep);
      
      // Add welcome message
      const welcomeMsg: PolyaChatMessage = {
        id: Date.now().toString(),
        role: 'AI',
        content: response.welcomeMessage,
        step: 1,
      };
      setMessages([welcomeMsg]);

      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify({
        exerciseId: exercise.id,
        problem: exercise.problem,
        currentStep: exercise.currentPolyaStep,
        messages: [welcomeMsg],
      }));
    } catch (err) {
      console.error('Error starting Polya practice:', err);
    } finally {
      setIsLoading(false);
    }
  }, [practiceType, storageKey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!exerciseId) return;

    // Add user message
    const userMsg: PolyaChatMessage = {
      id: Date.now().toString(),
      role: 'USER',
      content,
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);
    try {
      const response = await learningApi.polyaChat(exerciseId, content);
      
      // Add AI response
      const aiMsg: PolyaChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: response.aiResponse,
        step: response.currentStep,
        passed: response.passed,
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setCurrentStep(response.currentStep);
      
      if (response.exerciseCompleted) {
        setExerciseCompleted(true);
        localStorage.removeItem(storageKey);
      } else {
        // Update localStorage
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        saved.currentStep = response.currentStep;
        saved.messages = [...(saved.messages || []), userMsg, aiMsg];
        localStorage.setItem(storageKey, JSON.stringify(saved));
      }
    } catch (err) {
      console.error('Error sending Polya message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, storageKey]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(storageKey);
    setExerciseId(null);
    setProblem(null);
    setCurrentStep(1);
    setMessages([]);
    setExerciseCompleted(false);
  }, [storageKey]);

  return {
    exerciseId,
    problem,
    currentStep,
    messages,
    isLoading,
    exerciseCompleted,
    startPractice,
    sendMessage,
    resetSession,
  };
}
