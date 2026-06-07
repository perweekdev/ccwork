/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

export function useTagInput(_initialTags: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addTag: (value: string) => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} {
  const [tags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  return {
    tags,
    inputValue,
    setInputValue,
    addTag: (_value: string) => {},
    removeTag: (_tag: string) => {},
    handleKeyDown: (_e: React.KeyboardEvent<HTMLInputElement>) => {},
  };
}
