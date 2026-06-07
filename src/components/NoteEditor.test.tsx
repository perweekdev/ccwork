import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteEditor } from './NoteEditor';

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: [
      {
        id: '1',
        title: 'Note 1',
        content: 'Body',
        createdAt: '',
        updatedAt: '',
        tags: ['react', 'work'],
      },
      { id: '2', title: 'Note 2', content: 'Body', createdAt: '', updatedAt: '', tags: [] },
    ],
    loading: false,
    error: null,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  }),
}));

const onDone = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NoteEditor', () => {
  it('should render TagInput component', () => {
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  it('should initialize tags as [] when isCreating is true', () => {
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);
    expect(screen.queryAllByRole('button', { name: /×/ })).toHaveLength(0);
  });

  it('should initialize tags from note.tags when an existing note is selected', () => {
    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('should reset tags to [] when switching to new note creation mode', () => {
    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />,
    );
    expect(screen.getByText('react')).toBeInTheDocument();

    rerender(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });
});
