/**
 * Game Store (Zustand) Unit Tests
 * Tests core game state management: scoring, answers, navigation
 */
import { useGameStore } from '@/store/game';

// Reset store state before each test
beforeEach(() => {
  useGameStore.getState().resetGame();
});

describe('Game Store — Initial State', () => {
  it('should start at exercise 0, question 0', () => {
    const state = useGameStore.getState();
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
  });

  it('should start with 0 total score', () => {
    expect(useGameStore.getState().totalScore).toBe(0);
  });

  it('should start with 420s timer', () => {
    expect(useGameStore.getState().timeRemaining).toBe(420);
  });

  it('should start with empty answers', () => {
    expect(useGameStore.getState().answers).toEqual({});
  });

  it('should start with empty game results', () => {
    expect(useGameStore.getState().gameResults).toEqual([]);
  });

  it('should start at phase 1', () => {
    expect(useGameStore.getState().currentPhase).toBe(1);
  });
});

describe('Game Store — Navigation', () => {
  it('nextQuestion should increment question index', () => {
    useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().currentQuestionIndex).toBe(1);
    useGameStore.getState().nextQuestion();
    expect(useGameStore.getState().currentQuestionIndex).toBe(2);
  });

  it('nextExercise should increment exercise and reset question to 0', () => {
    useGameStore.getState().nextQuestion(); // question 1
    useGameStore.getState().nextExercise();
    const state = useGameStore.getState();
    expect(state.currentExerciseIndex).toBe(1);
    expect(state.currentQuestionIndex).toBe(0);
  });
});

describe('Game Store — Option Selection', () => {
  it('SINGLE select should replace previous selection', () => {
    const store = useGameStore.getState();
    store.selectOption('q1', 'opt-a', false);
    expect(useGameStore.getState().answers['q1']).toEqual(['opt-a']);

    store.selectOption('q1', 'opt-b', false);
    expect(useGameStore.getState().answers['q1']).toEqual(['opt-b']);
  });

  it('MULTIPLE select should toggle options', () => {
    const store = useGameStore.getState();
    store.selectOption('q2', 'opt-a', true);
    store.selectOption('q2', 'opt-b', true);
    expect(useGameStore.getState().answers['q2']).toEqual(['opt-a', 'opt-b']);

    // Deselect opt-a
    store.selectOption('q2', 'opt-a', true);
    expect(useGameStore.getState().answers['q2']).toEqual(['opt-b']);
  });
});

describe('Game Store — Scoring', () => {
  it('addScore should accumulate total and per-exercise scores', () => {
    const store = useGameStore.getState();
    store.addScore(12);
    store.addScore(4);
    const state = useGameStore.getState();
    expect(state.totalScore).toBe(16);
    expect(state.exerciseScores[0]).toBe(16);
  });

  it('addScore should track per-exercise after navigating', () => {
    const store = useGameStore.getState();
    store.addScore(10); // exercise 0
    store.nextExercise();
    store.addScore(5); // exercise 1
    const state = useGameStore.getState();
    expect(state.totalScore).toBe(15);
    expect(state.exerciseScores[0]).toBe(10);
    expect(state.exerciseScores[1]).toBe(5);
  });
});

describe('Game Store — Game Results', () => {
  it('addGameResult should append to results', () => {
    useGameStore.getState().addGameResult({
      exerciseIndex: 0,
      exerciseType: 'APPLICATION',
      questionIndex: 0,
      questionContent: 'Test Q',
      selectedOption: 'A',
      correctOption: 'A',
      isCorrect: true,
      timeSpent: 5,
      earnedPoints: 12,
    });
    expect(useGameStore.getState().gameResults).toHaveLength(1);
    expect(useGameStore.getState().gameResults[0].isCorrect).toBe(true);
  });
});

describe('Game Store — Reset', () => {
  it('resetGame should restore all defaults', () => {
    const store = useGameStore.getState();
    store.addScore(100);
    store.nextExercise();
    store.nextQuestion();
    store.selectOption('q1', 'opt-a', false);
    store.setPhase(3);

    store.resetGame();
    const state = useGameStore.getState();
    expect(state.totalScore).toBe(0);
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.answers).toEqual({});
    expect(state.gameResults).toEqual([]);
    expect(state.timeRemaining).toBe(420);
  });
});
