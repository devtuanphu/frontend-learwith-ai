'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, BookOpen, ChevronRight, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePolyaChat, PracticeType } from '@/hooks/usePolyaChat';
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

interface PolyaChatInterfaceProps {
  practiceType?: PracticeType;
  onComplete: () => void;
}



export function PolyaChatInterface({ practiceType = 'basic', onComplete }: PolyaChatInterfaceProps) {
  const {
    problem,
    messages,
    isLoading,
    exerciseCompleted,
    startPractice,
    sendMessage,
    resetSession,
  } = usePolyaChat(practiceType);
  
  const [input, setInput] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      startPractice();
    }
  }, [startPractice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine robot emotion
  const robotEmotion: RobotEmotion = isLoading ? 'thinking' : 
    messages[messages.length - 1]?.passed ? 'celebrating' : 'happy';

  const handleSend = async () => {
    const message = textareaRef.current?.value.trim() || '';
    if (!message || isLoading) return;
    
    setInputKey(k => k + 1);
    setInput('');
    sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleComplete = () => {
    resetSession();
    onComplete();
  };

  const handleRestart = () => {
    resetSession();
    isInitializedRef.current = false;
    startPractice();
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)] max-w-7xl mx-auto p-4">
      {/* Left Panel - Robot + Progress */}
      <div className="w-[320px] flex flex-col gap-4 shrink-0">
        {/* Robot Container */}
        <div className="flex-1 relative min-h-[300px] rounded-2xl overflow-hidden shadow-xl">
          <AIRobot emotion={robotEmotion} />
          
          {/* Robot Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                  }`}
                />
                <span className="font-medium text-gray-700 text-sm">
                  {isLoading ? 'Đang suy nghĩ...' : 'Sẵn sàng giúp bạn!'}
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">
                  {practiceType === 'application' 
                    ? 'Vận dụng' 
                    : practiceType === 'advanced' 
                      ? 'Luyện tập nâng cao' 
                      : 'Luyện tập cơ bản'}
                </h1>
                <p className="text-white/70 text-xs">Học cùng Trợ lý học tập ảo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <span className="text-white text-sm font-medium">🤖 Trợ lý AI</span>
            </div>
          </div>
        </div>
        
        {/* PINNED Problem Card */}
        {problem && (
          <div className="shrink-0 border-b border-slate-200 bg-linear-to-r from-amber-50 to-orange-50">
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Bài toán</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{problem}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%]">
                  {/* Progress indicator for AI */}
                  {message.role === 'AI' && message.passed && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        ✓ Chính xác!
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex items-end gap-2 ${message.role === 'USER' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'USER'
                          ? 'bg-blue-500 text-white'
                          : 'bg-linear-to-br from-purple-500 to-pink-500 text-white'
                      }`}
                    >
                      {message.role === 'USER' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-xs">🤖</span>
                      )}
                    </div>
                    
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        message.role === 'USER'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white shadow-sm border border-slate-100 rounded-bl-sm text-slate-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-sm">🤖</span>
                  <span className="text-slate-400 text-xs">Đang suy nghĩ</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Complete Button */}
        {exerciseCompleted && (
          <div className="shrink-0 p-4 bg-linear-to-r from-green-50 to-emerald-50 border-t border-green-200">
            <button
              onClick={handleComplete}
              className="w-full py-3.5 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>
                {practiceType === 'application' 
                  ? 'Hoàn thành bài học' 
                  : practiceType === 'advanced' 
                    ? 'Tiếp tục Vận dụng' 
                    : 'Tiếp tục Luyện tập nâng cao'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Input Area */}
        {!exerciseCompleted && (
          <div className="shrink-0 p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                title="Làm lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <textarea
                key={inputKey}
                ref={textareaRef}
                defaultValue=""
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu trả lời của bạn..."
                rows={1}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-700 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-4 rounded-xl transition-all flex items-center justify-center ${
                  input.trim() && !isLoading
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
