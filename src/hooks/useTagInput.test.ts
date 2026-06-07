import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  it('should initialize tags with given initialTags array', () => {
    const { result } = renderHook(() => useTagInput(['react', 'typescript']));
    expect(result.current.tags).toEqual(['react', 'typescript']);
  });

  it('should initialize tags as empty array when initialTags is []', () => {
    const { result } = renderHook(() => useTagInput([]));
    expect(result.current.tags).toEqual([]);
  });
});

describe('useTagInput.addTag', () => {
  it('should append tag to tags array when called with non-empty string', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.addTag('work');
    });
    expect(result.current.tags).toEqual(['work']);
  });

  it('should clear inputValue after tag is added', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.setInputValue('work');
    });
    act(() => {
      result.current.addTag('work');
    });
    expect(result.current.inputValue).toBe('');
  });

  it('should do nothing when called with empty string', () => {
    const { result } = renderHook(() => useTagInput(['existing']));
    act(() => {
      result.current.addTag('');
    });
    expect(result.current.tags).toEqual(['existing']);
  });
});

describe('useTagInput.removeTag', () => {
  it('should remove tag from tags array when called with existing tag', () => {
    const { result } = renderHook(() => useTagInput(['react', 'work']));
    act(() => {
      result.current.removeTag('work');
    });
    expect(result.current.tags).toEqual(['react']);
  });

  it('should not mutate tags array when called with non-existing tag', () => {
    const { result } = renderHook(() => useTagInput(['react']));
    act(() => {
      result.current.removeTag('nonexistent');
    });
    expect(result.current.tags).toEqual(['react']);
  });
});

describe('useTagInput.handleKeyDown', () => {
  it('should call addTag when Enter key is pressed', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.setInputValue('work');
    });
    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.tags).toContain('work');
  });

  it('should call addTag when comma(,) key is pressed', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.setInputValue('design');
    });
    act(() => {
      result.current.handleKeyDown({
        key: ',',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.tags).toContain('design');
  });

  it('should not call addTag when other keys are pressed', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.setInputValue('wor');
    });
    act(() => {
      result.current.handleKeyDown({
        key: 'k',
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.tags).toEqual([]);
  });
});
