'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, Trophy, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { useGameStore } from '@/store/game';

export function QuizGame({ onComplete }: { onComplete: () => void }) {
  const {
    currentExercise,
    currentQuestion,
    currentExerciseIndex,
    currentQuestionIndex,
    isLoading,
    error,
    isLastQuestion,
    isLastExercise,
    answers,
    selectOption,
    startWarmUp,
    submitAnswer,
  } = useQuiz();

  const { timeRemaining, setTimeRemaining, totalScore } = useGameStore();
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    question: typeof currentQuestion;
    selectedOptions: string[];
    exerciseIndex: number;
    questionIndex: number;
    totalQuestionsInExercise: number;
    scenario: string;
    wasLastQuestion: boolean;
    wasLastExercise: boolean;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; earnedPoints: number } | null>(null);

  // Initialize game
  useEffect(() => {
    startWarmUp();
  }, [startWarmUp]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, setTimeRemaining]);

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex, currentExerciseIndex]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || isSubmitting) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    // Store question data BEFORE submitAnswer advances to next question
    const answeredQuestion = currentQuestion;
    const answeredSelectedOptions = answers[currentQuestion.id] || [];
    setIsSubmitting(true);

    try {
      const result = await submitAnswer(timeSpent);
      // Store the answered question data for feedback display
      setFeedbackData({
        question: answeredQuestion,
        selectedOptions: answeredSelectedOptions,
        exerciseIndex: currentExerciseIndex,
        questionIndex: currentQuestionIndex,
        totalQuestionsInExercise: currentExercise?.exercise?.questions?.length || 1,
        scenario: currentExercise?.exercise?.scenario || '',
        wasLastQuestion: isLastQuestion,
        wasLastExercise: isLastExercise,
      });
      setLastResult(result);
      setShowFeedback(true);
      // Don't auto-advance - let user read feedback and click Next
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, isSubmitting, questionStartTime, submitAnswer, answers, currentExerciseIndex, currentQuestionIndex, currentExercise?.exercise?.questions?.length, currentExercise?.exercise?.scenario, isLastQuestion, isLastExercise]);

  // Handle moving to next question after reading feedback
  const handleNextQuestion = useCallback(() => {
    // Use stored values from feedbackData to avoid race condition
    // where current state has already advanced to next question
    const wasLastQuestion = feedbackData?.wasLastQuestion;
    const wasLastExercise = feedbackData?.wasLastExercise;
    
    setShowFeedback(false);
    setLastResult(null);
    setFeedbackData(null);
    
    if (wasLastQuestion && wasLastExercise) {
      onComplete();
    }
  }, [feedbackData?.wasLastQuestion, feedbackData?.wasLastExercise, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exerciseTypes = ['Cơ bản', 'Vận dụng', 'Giải quyết vấn đề'];
  const exerciseColors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tạo bài tập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => startWarmUp()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!currentExercise || !currentQuestion) {
    return <div className="text-center py-8">Không có bài tập</div>;
  }

  // During feedback, show the answered question; otherwise show current question
  const displayQuestion = showFeedback && feedbackData?.question ? feedbackData.question : currentQuestion;
  const displaySelectedOptions = showFeedback && feedbackData ? feedbackData.selectedOptions : (answers[currentQuestion.id] || []);
  const displayExerciseIndex = showFeedback && feedbackData ? feedbackData.exerciseIndex : currentExerciseIndex;
  const displayQuestionIndex = showFeedback && feedbackData ? feedbackData.questionIndex : currentQuestionIndex;
  const displayTotalQuestions = showFeedback && feedbackData ? feedbackData.totalQuestionsInExercise : (currentExercise?.exercise?.questions?.length || 1);
  const displayScenario = showFeedback && feedbackData ? feedbackData.scenario : (currentExercise?.exercise?.scenario || '');
  const isMultiple = displayQuestion.type === 'MULTIPLE';

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xl font-bold">{totalScore} điểm</span>
          </div>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i === currentExerciseIndex
                  ? 'bg-white text-blue-600 scale-110'
                  : i < currentExerciseIndex
                  ? 'bg-green-400 text-white'
                  : 'bg-blue-400/50 text-white/70'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Type Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${exerciseColors[displayExerciseIndex]}`}>
          Bài {displayExerciseIndex + 1}: {exerciseTypes[displayExerciseIndex]}
        </span>
        <span className="ml-3 text-gray-500">
          Câu {displayQuestionIndex + 1}/{displayTotalQuestions}
        </span>
      </div>

      {/* Scenario */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
        <p className="text-gray-700">{displayScenario}</p>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {displayQuestion.content}
        </h2>
      

        {/* Options */}
        <div className="space-y-3">
          {displayQuestion.options.map((option, index) => {
            const isSelected = displaySelectedOptions.includes(option.id);
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                key={option.id}
                onClick={() => selectOption(displayQuestion.id, option.id, isMultiple)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                  showFeedback
                    ? option.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {optionLabel}
                </span>
                <span className="flex-1">{option.content}</span>
                {showFeedback && option.isCorrect && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {showFeedback && isSelected && !option.isCorrect && (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && lastResult && (() => {
          // Get feedback from ALL selected options
          const selectedOptions = displayQuestion.options.filter(
            opt => displaySelectedOptions.includes(opt.id)
          );

          return (
            <div className={`mt-4 p-4 rounded-lg ${lastResult.isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      Chính xác! +{lastResult.earnedPoints} điểm
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-orange-700">
                      Chưa đúng, bạn nhận được {lastResult.earnedPoints} điểm
                    </span>
                  </>
                )}
              </div>
              {/* Show feedback for ALL selected options */}
              <div className="space-y-2 mt-2">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((opt) => (
                    <div 
                      key={opt.id}
                      className={`text-sm p-2 rounded ${
                        opt.isCorrect 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + displayQuestion.options.findIndex(o => o.id === opt.id))}:</span>{' '}
                      {opt.feedback || `[Không có feedback - isCorrect: ${opt.isCorrect}]`}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Không tìm thấy option đã chọn</p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Submit Button */}
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={displaySelectedOptions.length === 0 || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            displaySelectedOptions.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-linear-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              Gửi câu trả lời
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      )}

      {/* Next Button - shown after feedback */}
      {showFeedback && (
        <button
          onClick={handleNextQuestion}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-lg"
        >
          {isLastQuestion && isLastExercise ? 'Hoàn thành' : 'Câu tiếp theo'}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
