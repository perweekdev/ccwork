import { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { filterNotes } from '../utils/filterNotes';
import { ConfirmDialog } from './ConfirmDialog';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteList({ selectedNoteId, onSelect }: NoteListProps) {
  const { notes, loading, error, deleteNote } = useNotes();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-8">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive text-center py-8">오류: {error}</p>;
  }

  const filteredNotes = filterNotes(notes, searchQuery);

  return (
    <>
      <input
        type="text"
        placeholder="노트 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 transition-colors"
      />
      {filteredNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">노트가 없습니다</p>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground px-1 pb-1">
            노트 {filteredNotes.length}개
          </p>
          {filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={onSelect}
              onDelete={setPendingDeleteId}
            />
          ))}
        </>
      )}
      {pendingDeleteId && (
        <ConfirmDialog
          message="이 노트를 삭제하시겠습니까?"
          onConfirm={() => {
            deleteNote(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </>
  );
}
