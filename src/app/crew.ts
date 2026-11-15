// AI-assisted: written with Claude Code, reviewed by the team.

/** One line style per crew member. None of these is a status color, and each has its own dash so color is never the only cue. */
export const CREW_STYLE = [
  { color: '#58d8e8', dash: undefined },
  { color: '#bc9cff', dash: '7 4' },
  { color: '#7aa2ff', dash: '2 4' },
  { color: '#f2a2d0', dash: '10 4 2 4' },
] as const;

/** Two letters for a badge or a line label: first letters of two words, or the first two letters of a single call sign. */
export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts.map((part) => part[0] ?? '').join('') : name.trim()).slice(0, 2).toUpperCase();
};
