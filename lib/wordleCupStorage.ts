export function getWordleCupStorageKey(params: {
    difficulty: "easy" | "hard";
    puzzleId: string;
  }) {
    return `wordlecup:${params.difficulty}:${params.puzzleId}`;
  }
  
  export function getWordleCupStreakKey(params: { difficulty: "easy" | "hard" }) {
    // streak is per difficulty (like Wordle “mode”)
    return `wordlecup:streak:${params.difficulty}`;
  }

