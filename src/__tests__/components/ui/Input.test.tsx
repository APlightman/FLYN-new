import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../../components/ui/Input';

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('displays error message when error prop is set', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('applies fullWidth class when specified', () => {
    render(<Input fullWidth />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full');
  });

  it('applies filled variant correctly', () => {
    render(<Input variant="filled" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-slate-100');
  });

  it('applies outlined variant correctly', () => {
    render(<Input variant="outlined" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-2');
  });

  it('renders left icon when provided', () => {
    render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon when provided', () => {
    render(<Input rightIcon={<span data-testid="right-icon">✕</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies left padding when left icon is present', () => {
    render(<Input leftIcon={<span>icon</span>} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10');
  });

  it('applies right padding when right icon is present', () => {
    render(<Input rightIcon={<span>icon</span>} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('updates value on change', () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur handler when input loses focus', () => {
    const handleBlur = vi.fn();
    render(<Input onBlur={handleBlur} data-testid="blur-input" />);
    
    const input = screen.getByTestId('blur-input');
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus handler when input gains focus', () => {
    const handleFocus = vi.fn();
    render(<Input onFocus={handleFocus} data-testid="focus-input" />);
    
    const input = screen.getByTestId('focus-input');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('disables input when disabled prop is set', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('passes through additional HTML attributes', () => {
    render(
      <Input 
        type="email" 
        placeholder="test@example.com"
        aria-label="Email input"
        data-testid="email-input"
      />
    );
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('aria-label', 'Email input');
  });

  it('renders as required when required prop is set', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toHaveAttribute('required');
  });
});
