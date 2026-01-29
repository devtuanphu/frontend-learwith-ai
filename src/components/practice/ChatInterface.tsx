'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, User, Sparkles, MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useChat } from '@/hooks/useQuiz';
import type { RobotEmotion } from '@/components/3d/AIRobot';

// Dynamic import to avoid SSR issues with Three.js
const AIRobot = dynamic(() => import('@/components/3d/AIRobot'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
    </div>
  ),
});

interface ChatInterfaceProps {
  phase: 2 | 3;
  onComplete: () => void;
}

export function ChatInterface({ phase, onComplete }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    exercise,
    startPractice,
    startApplication,
    sendMessage,
    completeSession,
  } = useChat();
  const [input, setInput] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      if (phase === 2) {
        startPractice();
      } else {
        startApplication();
      }
    }
  }, [phase, startPractice, startApplication]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine robot emotion based on AI response (evaluated by Gemini)
  const robotEmotion: RobotEmotion = useMemo(() => {
    if (isLoading) return 'thinking';

    const lastAiMessage = [...messages].reverse().find((m) => m.role === 'AI');
    if (!lastAiMessage) return 'idle';

    // Use emotion from Gemini evaluation if available
    if (lastAiMessage.emotion) {
      return lastAiMessage.emotion as RobotEmotion;
    }

    // Fallback based on promptType (for backward compatibility)
    switch (lastAiMessage.promptType) {
      case 'FEEDBACK':
        return 'happy';
      case 'SCAFFOLDING_4':
        return 'happy';
      case 'SCAFFOLDING_3':
        return 'encouraging';
      case 'SCAFFOLDING_1':
      case 'SCAFFOLDING_2':
        return 'happy';
      default:
        return 'idle';
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const message = textareaRef.current?.value.trim() || '';
    if (!message || isLoading) return;
    
    // Increment key to force textarea remount (most reliable way to clear)
    setInputKey(k => k + 1);
    setInput('');
    
    // Send message (don't await to prevent blocking)
    sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Don't need to await here, just fire and forget
      void handleSend();
    }
  };

  const getScaffoldingLabel = (promptType?: string) => {
    switch (promptType) {
      case 'SCAFFOLDING_1':
        return 'Bước 1: Hiểu bài toán';
      case 'SCAFFOLDING_2':
        return 'Bước 2: Lập kế hoạch';
      case 'SCAFFOLDING_3':
        return 'Bước 3: Thực hiện';
      case 'SCAFFOLDING_4':
        return 'Bước 4: Kiểm tra';
      case 'FEEDBACK':
        return '🎉 Nhận xét';
      default:
        return null;
    }
  };

  const getEmotionText = () => {
    switch (robotEmotion) {
      case 'thinking':
        return 'Đang suy nghĩ...';
      case 'happy':
        return 'Tuyệt vời!';
      case 'encouraging':
        return 'Cố gắng lên!';
      case 'celebrating':
        return 'Chúc mừng! 🎉';
      default:
        return 'Sẵn sàng giúp bạn!';
    }
  };

  const handleComplete = async () => {
    await completeSession();
    onComplete();
  };

  const lastMessage = messages[messages.length - 1];
  
  // Only show completion if promptType is FEEDBACK AND we detect completion keywords
  // This prevents the button from showing up just because we are in the feedback loop
  const isScaffoldingComplete = useMemo(() => {
    if (phase === 3) return false; // Application phase handles completion differently
    if (lastMessage?.promptType !== 'FEEDBACK') return false;
    
    const content = lastMessage.content.toLowerCase();
    const completionKeywords = [
      'hoàn thành', 'chúc mừng', 'tuyệt vời', 'xuất sắc', 'chính xác', 
      'sang phần tiếp theo', 'qua phần tiếp', 'bài toán kết thúc',
      'đã xong', 'giỏi lắm'
    ];
    // Also check that it DOESN'T contain negative feedback (double safety)
    const negativeKeywords = ['chưa đúng', 'sai rồi', 'thử lại', 'xem lại', 'nhầm lẫn'];
    
    const hasCompletion = completionKeywords.some(kw => content.includes(kw));
    const hasNegative = negativeKeywords.some(kw => content.includes(kw));
    
    return hasCompletion && !hasNegative;
  }, [lastMessage, phase]);

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] max-w-7xl mx-auto p-4">
      {/* Left Panel - Robot */}
      <div className="w-[400px] flex flex-col gap-4 shrink-0">
        {/* Robot Container */}
        <div className="flex-1 relative">
          <AIRobot emotion={robotEmotion} />

          {/* Robot Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                  }`}
                />
                <span className="font-medium text-gray-700">{getEmotionText()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Info Card */}
        {exercise && (
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bài toán:</p>
                <p className="text-gray-700 text-sm leading-relaxed">{exercise.scenario}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
        {/* Chat Header */}
        <div className="bg-linear-to-r from-purple-600 to-pink-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">
                {phase === 2 ? '💪 Luyện tập - Sửa lỗi' : '🚀 Vận dụng thực tiễn'}
              </h2>
              <p className="text-sm text-white/80">Trò chuyện với Trợ lí AI</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Hỗ Trợ</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => {
            const scaffoldingLabel =
              message.role === 'AI' ? getScaffoldingLabel(message.promptType) : null;

            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'USER' ? 'order-1' : 'order-2'}`}>
                  {scaffoldingLabel && (
                    <span className="text-xs text-purple-600 font-semibold mb-1 block">
                      {scaffoldingLabel}
                    </span>
                  )}
                  <div
                    className={`flex items-start gap-2 ${
                      message.role === 'USER' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'USER'
                          ? 'bg-blue-500 text-white'
                          : 'bg-linear-to-br from-purple-500 to-pink-500 text-white'
                      }`}
                    >
                      {message.role === 'USER' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <span className="text-sm">🤖</span>
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'USER'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white shadow-md rounded-bl-md border border-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-100">
                <span className="text-lg">🤖</span>
                <span className="text-gray-500 text-sm">Đang suy nghĩ</span>
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Complete Button */}
        {isScaffoldingComplete && (
          <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 border-t border-green-200">
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {phase === 2 ? 'Tiếp tục với Vận dụng thực tiễn →' : 'Hoàn thành bài học! 🎉'}
            </button>
          </div>
        )}

        {/* Input */}
        {!isScaffoldingComplete && (
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-3">
              <textarea
                key={inputKey}
                ref={textareaRef}
                defaultValue=""
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu trả lời của bạn..."
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-5 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
