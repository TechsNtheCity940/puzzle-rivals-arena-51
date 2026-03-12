import type {
  BackendPuzzleSelection as MatchPuzzleSelection,
  MatchPlayablePuzzleType,
  PuzzleCatalogEntry,
} from "@/lib/backend";

export type { MatchPlayablePuzzleType, MatchPuzzleSelection };

export interface MatchPuzzleMeta extends PuzzleCatalogEntry {}

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

export function isPlayableMatchPuzzle(type: string): type is MatchPlayablePuzzleType {
  return MATCH_PLAYABLE_PUZZLES.includes(type as MatchPlayablePuzzleType);
}
