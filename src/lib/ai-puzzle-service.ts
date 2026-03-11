import { PUZZLE_TYPES } from "@/lib/seed-data";
import type { PuzzleMeta, PuzzleType } from "@/lib/types";

export type MatchPlayablePuzzleType =
  | "rotate_pipes"
  | "number_grid"
  | "pattern_match"
  | "word_scramble"
  | "tile_slide"
  | "sudoku_mini";

export interface MatchPuzzleSelection {
  lobbyId: string;
  puzzleType: MatchPlayablePuzzleType;
  meta: PuzzleMeta;
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
];

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

export function getPuzzleMeta(type: MatchPlayablePuzzleType): PuzzleMeta {
  return PUZZLE_TYPES.find((p) => p.type === type) as PuzzleMeta;
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

export function isPlayableMatchPuzzle(type: PuzzleType): type is MatchPlayablePuzzleType {
  return MATCH_PLAYABLE_PUZZLES.includes(type as MatchPlayablePuzzleType);
}
