import { KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
}

export function TagInput({ tags, inputValue, onInputChange, onKeyDown, onRemove }: TagInputProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-muted text-foreground text-xs rounded-xl px-2.5 py-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="text-sm text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
