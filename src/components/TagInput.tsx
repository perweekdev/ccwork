/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
}

export function TagInput(_props: TagInputProps) {
  return <div />;
}
