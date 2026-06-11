import { Note } from '../types/note';

export function filterNotes(notes: Note[], query: string): Note[] {
  if (!query) return notes;
  const lower = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lower) || note.content.toLowerCase().includes(lower),
  );
}
