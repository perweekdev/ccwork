import { useState, KeyboardEvent } from 'react';

export function useTagInput(initialTags: string[]) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');

  const addTag = (value: string) => {
    const normalized = value.toLowerCase().trim().replace(/\s+/g, '');
    if (normalized === '') return;
    if (normalized.length > 20) return;
    if (tags.includes(normalized)) return;
    setTags((prev) => [...prev, normalized]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return { tags, setTags, inputValue, setInputValue, addTag, removeTag, handleKeyDown };
}
