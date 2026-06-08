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

// Issue 3: 태그 입력 검증 (normalize & 중복 방지)

describe('useTagInput.addTag — normalize', () => {
  it('should store normalized value when input has uppercase letters', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.addTag(' React JS ');
    });
    expect(result.current.tags).toEqual(['reactjs']);
  });

  it('should clear inputValue after adding normalized tag', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.setInputValue(' React JS ');
    });
    act(() => {
      result.current.addTag(' React JS ');
    });
    expect(result.current.inputValue).toBe('');
    expect(result.current.tags).toContain('reactjs');
  });
});

describe('useTagInput.addTag — 길이 검증', () => {
  it('should add tag when normalized length is exactly 20 characters', () => {
    const { result } = renderHook(() => useTagInput([]));
    const twentyChars = 'a'.repeat(20);
    act(() => {
      result.current.addTag(twentyChars);
    });
    expect(result.current.tags).toEqual([twentyChars]);
  });

  it('should not add tag when normalized length exceeds 20 characters', () => {
    const { result } = renderHook(() => useTagInput([]));
    const twentyOneChars = 'a'.repeat(21);
    act(() => {
      result.current.addTag(twentyOneChars);
    });
    expect(result.current.tags).toEqual([]);
  });
});

describe('useTagInput.addTag — 공백 입력 거부', () => {
  it('should not add tag when input is whitespace-only string', () => {
    const { result } = renderHook(() => useTagInput([]));
    act(() => {
      result.current.addTag('   ');
    });
    expect(result.current.tags).toEqual([]);
  });
});

describe('useTagInput.addTag — 중복 방지', () => {
  it('should not add tag when normalized value already exists in tags array', () => {
    const { result } = renderHook(() => useTagInput(['react']));
    act(() => {
      result.current.addTag('react');
    });
    expect(result.current.tags).toEqual(['react']);
  });

  it('should not add tag when input differs only in case from existing tag', () => {
    const { result } = renderHook(() => useTagInput(['react']));
    act(() => {
      result.current.addTag('REACT');
    });
    expect(result.current.tags).toEqual(['react']);
  });
});
