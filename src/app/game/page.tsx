'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Shapes,
  ChevronRight,
  Gamepad2,
  Lock,
  Trophy,
} from 'lucide-react';
import { categoriesApi, Category, Topic } from '@/lib/api';

interface MenuLevel {
  type: 'categories' | 'topics';
  parentId: string | null;
  title: string;
}

export default function GameMenuPage() {
  const router = useRouter();
  const [menuStack, setMenuStack] = useState<MenuLevel[]>([
    { type: 'categories', parentId: null, title: 'Học toán' },
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLevel = menuStack[menuStack.length - 1];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentLevel.type === 'categories') {
        if (currentLevel.parentId === null) {
          // Load from "game" category (level 1)
          const children = await categoriesApi.getChildren('game');
          setCategories(children);
        } else {
          const children = await categoriesApi.getChildren(currentLevel.parentId);
          if (children.length > 0) {
            setCategories(children);
          } else {
            // No more children, switch to topics
            const topicList = await categoriesApi.getTopics(currentLevel.parentId);
            setTopics(topicList);
            setMenuStack((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...currentLevel, type: 'topics' };
              return updated;
            });
          }
        }
      } else {
        const topicList = await categoriesApi.getTopics(currentLevel.parentId!);
        setTopics(topicList);
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setMenuStack((prev) => [
      ...prev,
      { type: 'categories', parentId: category.id, title: category.name },
    ]);
  };

  const handleTopicClick = (topic: Topic) => {
    if (topic.isGameSupported) {
      // Store selected topic and start game directly
      localStorage.setItem('selectedTopicId', topic.id);
      localStorage.setItem('selectedTopicName', topic.name);
      router.push('/learn/game');
    }
  };

  const handleBack = () => {
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
    } else {
      router.push('/dashboard');
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'num_ops':
        return <Calculator className="w-8 h-8" />;
      case 'geometry':
        return <Shapes className="w-8 h-8" />;
      default:
        return <Gamepad2 className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Trò chơi</h1>
            <p className="text-white/70 text-sm">
              {menuStack.map((m) => m.title).join(' > ')}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : currentLevel.type === 'categories' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left hover:bg-white/20 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl text-white shadow-lg">
                    {getCategoryIcon(category.id)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white group-hover:text-yellow-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/60 text-sm">Nhấn để xem chi tiết</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {topics.map((topic, index) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                disabled={!topic.isGameSupported}
                className={`group flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 ${
                  topic.isGameSupported
                    ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-[1.01]'
                    : 'bg-white/5 border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    topic.isGameSupported
                      ? 'bg-linear-to-br from-green-400 to-emerald-600 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 text-left">
                  <h3
                    className={`font-medium ${
                      topic.isGameSupported
                        ? 'text-white group-hover:text-yellow-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {topic.name}
                  </h3>
                  {topic.isGameSupported && (
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Có trò chơi
                    </p>
                  )}
                </div>
                {topic.isGameSupported ? (
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
