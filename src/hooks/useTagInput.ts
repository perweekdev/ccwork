import { useState } from 'react';
import React from 'react';

export function useTagInput(initialTags: string[]) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');

  const addTag = (value: string) => {
    if (!value) return;
    setTags((prev) => [...prev, value]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return { tags, setTags, inputValue, setInputValue, addTag, removeTag, handleKeyDown };
}
