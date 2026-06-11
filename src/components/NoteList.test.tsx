import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteList } from './NoteList';
import { filterNotes } from '../utils/filterNotes';
import type { Note } from '../types/note';

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: [
      {
        id: '1',
        title: 'React 입문',
        content: '리액트 기초',
        createdAt: '',
        updatedAt: '',
        tags: [],
      },
      {
        id: '2',
        title: 'Vue 기초',
        content: '뷰 입문 내용',
        createdAt: '',
        updatedAt: '',
        tags: [],
      },
      {
        id: '3',
        title: '오늘 학습',
        content: 'typescript 내용',
        createdAt: '',
        updatedAt: '',
        tags: [],
      },
    ],
    loading: false,
    error: null,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  }),
}));

const mockNotes: Note[] = [
  { id: '1', title: 'React 입문', content: '리액트 기초', createdAt: '', updatedAt: '', tags: [] },
  { id: '2', title: 'Vue 기초', content: '뷰 입문 내용', createdAt: '', updatedAt: '', tags: [] },
  {
    id: '3',
    title: '오늘 학습',
    content: 'typescript 내용',
    createdAt: '',
    updatedAt: '',
    tags: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// Issue 1: 검색창 UI & 실시간 필터링

describe('filterNotes', () => {
  it('should return notes whose title contains the query', () => {
    const result = filterNotes(mockNotes, 'react');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React 입문');
  });

  it('should return notes whose content contains the query', () => {
    const result = filterNotes(mockNotes, 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('오늘 학습');
  });

  it('should return all notes when query is empty string', () => {
    const result = filterNotes(mockNotes, '');
    expect(result).toHaveLength(3);
  });

  it('should return empty array when no notes match query', () => {
    const result = filterNotes(mockNotes, 'angular');
    expect(result).toHaveLength(0);
  });

  it('should match case-insensitively (uppercase query matches lowercase title)', () => {
    const result = filterNotes(mockNotes, 'REACT');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React 입문');
  });

  it('should match case-insensitively (lowercase query matches mixed-case content)', () => {
    const result = filterNotes(mockNotes, 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('오늘 학습');
  });
});

describe('NoteList', () => {
  it('should render search input with placeholder "노트 검색..."', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('노트 검색...')).toBeInTheDocument();
  });

  it('should show only matching notes when search query is typed', async () => {
    const user = userEvent.setup();
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('노트 검색...');
    await user.type(searchInput, 'react');

    expect(screen.getByText('React 입문')).toBeInTheDocument();
    expect(screen.queryByText('Vue 기초')).not.toBeInTheDocument();
  });

  it('should show all notes when search query is cleared to empty string', async () => {
    const user = userEvent.setup();
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('노트 검색...');
    await user.type(searchInput, 'react');
    await user.clear(searchInput);

    expect(screen.getByText('React 입문')).toBeInTheDocument();
    expect(screen.getByText('Vue 기초')).toBeInTheDocument();
  });
});
