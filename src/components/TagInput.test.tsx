import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

const defaultProps = {
  tags: ['react', 'work'],
  inputValue: '',
  onInputChange: vi.fn(),
  onKeyDown: vi.fn(),
  onRemove: vi.fn(),
};

describe('TagInput', () => {
  it('should render a badge for each tag in tags prop', () => {
    render(<TagInput {...defaultProps} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('should render × button on each badge', () => {
    render(<TagInput {...defaultProps} />);
    expect(screen.getAllByRole('button', { name: /×/ })).toHaveLength(2);
  });

  it('should call onRemove with the tag when × button is clicked', async () => {
    const onRemove = vi.fn();
    render(<TagInput {...defaultProps} tags={['react']} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: /×/ }));
    expect(onRemove).toHaveBeenCalledWith('react');
  });

  it('should render input field with current inputValue', () => {
    render(<TagInput {...defaultProps} inputValue="typ" />);
    expect(screen.getByRole('textbox')).toHaveValue('typ');
  });

  it('should render no badges when tags is empty array', () => {
    render(<TagInput {...defaultProps} tags={[]} />);
    expect(screen.queryAllByRole('button', { name: /×/ })).toHaveLength(0);
  });

  it('should call onInputChange when input value changes', async () => {
    const onInputChange = vi.fn();
    render(<TagInput {...defaultProps} onInputChange={onInputChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onInputChange).toHaveBeenCalled();
  });

  it('should call onKeyDown when a key is pressed in input field', async () => {
    const onKeyDown = vi.fn();
    render(<TagInput {...defaultProps} onKeyDown={onKeyDown} />);
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onKeyDown).toHaveBeenCalled();
  });
});
