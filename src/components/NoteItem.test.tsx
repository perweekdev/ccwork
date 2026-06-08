import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteItem } from './NoteItem';

const baseProps = {
  isSelected: false,
  onSelect: vi.fn(),
  onDelete: vi.fn(),
};

const noteWithTags = {
  id: '1',
  title: 'My Note',
  content: 'Note content',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tags: ['react', 'typescript'],
};

const noteWithoutTags = {
  ...noteWithTags,
  tags: [],
};

// Issue 5: NoteItem 사이드바 태그 뱃지 표시

describe('NoteItem — 태그 뱃지 렌더링', () => {
  it('should render a badge for each tag when note.tags contains values', () => {
    render(<NoteItem note={noteWithTags} {...baseProps} />);
    expect(screen.getAllByTestId('tag-badge')).toHaveLength(2);
  });

  it('should render tag text within each badge element', () => {
    render(<NoteItem note={noteWithTags} {...baseProps} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should not render any badge when note.tags is empty array', () => {
    render(<NoteItem note={noteWithoutTags} {...baseProps} />);
    expect(screen.queryAllByTestId('tag-badge')).toHaveLength(0);
  });
});

describe('NoteItem — tags prop 변경 반영', () => {
  it('should reflect updated tags when note prop is updated with new tags', () => {
    const { rerender } = render(<NoteItem note={noteWithTags} {...baseProps} />);
    rerender(<NoteItem note={{ ...noteWithTags, tags: ['vue'] }} {...baseProps} />);
    expect(screen.getByText('vue')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });
});
