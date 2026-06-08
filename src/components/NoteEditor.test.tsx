import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';

const { createNoteMock, updateNoteMock } = vi.hoisted(() => ({
  createNoteMock: vi.fn(),
  updateNoteMock: vi.fn(),
}));

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
    createNote: createNoteMock,
    updateNote: updateNoteMock,
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

// Issue 4: 태그 포함 일괄 저장

describe('NoteEditor.handleSave — createNote에 tags 전달', () => {
  it('should call createNote with tags array when save is clicked in create mode', async () => {
    const user = userEvent.setup();
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);

    const tagInputEl = within(screen.getByTestId('tag-input')).getByRole('textbox');
    await user.type(tagInputEl, 'vue');
    await user.keyboard('{Enter}');

    await user.type(screen.getByPlaceholderText('제목'), '새 노트');

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(createNoteMock).toHaveBeenCalledWith('새 노트', '', ['vue']);
  });

  it('should call createNote with empty tags array when no tags are added in create mode', async () => {
    const user = userEvent.setup();
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={onDone} />);

    await user.type(screen.getByPlaceholderText('제목'), '새 노트');

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(createNoteMock).toHaveBeenCalledWith('새 노트', '', []);
  });
});

describe('NoteEditor.handleSave — updateNote에 tags 전달', () => {
  it('should call updateNote with updates including tags array when save is clicked in edit mode', async () => {
    const user = userEvent.setup();
    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />);

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNoteMock).toHaveBeenCalledWith('1', {
      title: 'Note 1',
      content: 'Body',
      tags: ['react', 'work'],
    });
  });
});

describe('NoteEditor — 저장 없이 이동 시 태그 변경 폐기', () => {
  it('should discard unsaved tag changes when switching to a different note', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />,
    );

    const tagInputEl = within(screen.getByTestId('tag-input')).getByRole('textbox');
    await user.type(tagInputEl, 'unsaved');
    await user.keyboard('{Enter}');
    expect(screen.getByText('unsaved')).toBeInTheDocument();

    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={onDone} />);

    expect(screen.queryByText('unsaved')).not.toBeInTheDocument();
    expect(updateNoteMock).not.toHaveBeenCalled();
  });
});
