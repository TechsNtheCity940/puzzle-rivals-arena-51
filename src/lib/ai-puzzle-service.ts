interface MatchPuzzleMeta {
  type: MatchPlayablePuzzleType;
  label: string;
  icon: string;
  description: string;
}

export type MatchPlayablePuzzleType =
  | "rotate_pipes"
  | "number_grid"
  | "pattern_match"
  | "word_scramble"
  | "tile_slide"
  | "sudoku_mini"
  | "maze"
  | "memory_grid"
  | "riddle_choice"
  | "wordle_guess"
  | "chess_tactic"
  | "checkers_tactic";

export interface MatchPuzzleSelection {
  lobbyId: string;
  puzzleType: MatchPlayablePuzzleType;
  meta: MatchPuzzleMeta;
  difficulty: 1 | 2 | 3 | 4 | 5;
  practiceSeed: number;
  liveSeed: number;
}

const MATCH_PLAYABLE_PUZZLES: MatchPlayablePuzzleType[] = [
  "rotate_pipes",
  "number_grid",
  "pattern_match",
  "word_scramble",
  "tile_slide",
  "sudoku_mini",
  "maze",
  "memory_grid",
  "riddle_choice",
  "wordle_guess",
  "chess_tactic",
  "checkers_tactic",
];

const MATCH_PUZZLE_META: Record<MatchPlayablePuzzleType, MatchPuzzleMeta> = {
  rotate_pipes: {
    type: "rotate_pipes",
    label: "Pipe Flow",
    icon: "🔧",
    description: "Rotate the tiles until the source path connects cleanly to the sink.",
  },
  number_grid: {
    type: "number_grid",
    label: "Number Crunch",
    icon: "🔢",
    description: "Fill the empty cells so every row and column matches the target sum.",
  },
  pattern_match: {
    type: "pattern_match",
    label: "Pattern Eye",
    icon: "👁",
    description: "Identify the missing piece by reading the shape and color rule.",
  },
  word_scramble: {
    type: "word_scramble",
    label: "Word Blitz",
    icon: "🔤",
    description: "Tap the scrambled letters in order to spell the hidden word.",
  },
  tile_slide: {
    type: "tile_slide",
    label: "Tile Shift",
    icon: "⬜",
    description: "Slide tiles into the empty space until the board returns to order.",
  },
  sudoku_mini: {
    type: "sudoku_mini",
    label: "Sudoku Sprint",
    icon: "🧩",
    description: "Fill 1-4 so each row, column, and 2x2 box has no repeats.",
  },
  maze: {
    type: "maze",
    label: "Maze Rush",
    icon: "🏁",
    description: "Guide the runner through the maze and reach the goal square.",
  },
  memory_grid: {
    type: "memory_grid",
    label: "Memory Flash",
    icon: "🧠",
    description: "Memorize the highlighted pattern, then tap the same cells back.",
  },
  riddle_choice: {
    type: "riddle_choice",
    label: "Riddle Relay",
    icon: "❓",
    description: "Solve rapid-fire riddles with multiple-choice answers.",
  },
  wordle_guess: {
    type: "wordle_guess",
    label: "Word Strike",
    icon: "🟩",
    description: "Guess the five-letter word using color feedback from each attempt.",
  },
  chess_tactic: {
    type: "chess_tactic",
    label: "Chess Shot",
    icon: "♞",
    description: "Pick the best tactical move from the presented chess position.",
  },
  checkers_tactic: {
    type: "checkers_tactic",
    label: "Checkers Trap",
    icon: "⚫",
    description: "Choose the strongest capture or positional follow-up in a checkers setup.",
  },
};

let uniqueSeedCounter = 0;
const sessionSeeds = new Set<number>();

function createLobbyId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const nonce = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LOB-${stamp.slice(-4)}-${nonce}`;
}

function allocateUniqueSeed(offset = 0) {
  let seed = (Date.now() + offset + uniqueSeedCounter * 7919) % 2147483646;
  if (seed <= 0) seed += 2147483645;

  while (sessionSeeds.has(seed)) {
    seed = (seed + 104729) % 2147483646;
    if (seed <= 0) seed += 2147483645;
  }

  sessionSeeds.add(seed);
  uniqueSeedCounter += 1;
  return seed;
}

export function getMatchPlayablePuzzles() {
  return MATCH_PLAYABLE_PUZZLES.map((type) => getPuzzleMeta(type));
}

export function getPuzzleMeta(type: MatchPlayablePuzzleType): MatchPuzzleMeta {
  return MATCH_PUZZLE_META[type];
}

export function getAdaptiveDifficulty(averageElo: number, mode: string): 1 | 2 | 3 | 4 | 5 {
  let difficulty = 1;

  if (averageElo >= 3200) difficulty = 5;
  else if (averageElo >= 2600) difficulty = 4;
  else if (averageElo >= 1800) difficulty = 3;
  else if (averageElo >= 1000) difficulty = 2;

  if (mode === "ranked" && difficulty < 5) difficulty += 1;
  if (mode === "casual" && difficulty > 1) difficulty -= 1;

  return difficulty as 1 | 2 | 3 | 4 | 5;
}

export function createMatchPuzzleSelection(averageElo: number, mode: string): MatchPuzzleSelection {
  const puzzleType =
    MATCH_PLAYABLE_PUZZLES[Math.floor(Math.random() * MATCH_PLAYABLE_PUZZLES.length)];
  const difficulty = getAdaptiveDifficulty(averageElo, mode);
  const practiceSeed = allocateUniqueSeed(11);
  const liveSeed = allocateUniqueSeed(29);

  return {
    lobbyId: createLobbyId(),
    puzzleType,
    meta: getPuzzleMeta(puzzleType),
    difficulty,
    practiceSeed,
    liveSeed,
  };
}

export function isPlayableMatchPuzzle(type: string): type is MatchPlayablePuzzleType {
  return MATCH_PLAYABLE_PUZZLES.includes(type as MatchPlayablePuzzleType);
}
