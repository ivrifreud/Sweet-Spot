/** Street name from community-card count for the table HUD. */
export function streetLabelForBoard(boardLength: number): string {
  if (boardLength >= 5) return 'River';
  if (boardLength === 4) return 'Turn';
  if (boardLength === 3) return 'Flop';
  return 'Pre-flop';
}
