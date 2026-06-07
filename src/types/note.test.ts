import { describe, it, expect } from 'vitest';
import type { Note } from './note';

describe('Note', () => {
  it('should accept tags: string[] field without TypeScript error', () => {
    const note: Note = {
      id: '1',
      title: 'Test',
      content: 'Body',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: ['work', 'personal'],
    };
    expect(note.tags).toEqual(['work', 'personal']);
  });

  it('should accept tags: [] (empty array) as valid value', () => {
    const note: Note = {
      id: '2',
      title: 'Empty Tags',
      content: 'Body',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: [],
    };
    expect(note.tags).toEqual([]);
  });
});
