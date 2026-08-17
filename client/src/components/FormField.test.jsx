import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from './FormField';

const noop = () => {};

const renderField = props =>
  render(
    <FormField
      label="Username"
      name="username"
      value=""
      onChange={noop}
      onBlur={noop}
      {...props}
    />,
  );

describe('FormField', () => {
  it('ties the label to the input, so clicking it focuses the box', async () => {
    renderField();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows the hint when there is no error', () => {
    renderField({ hint: 'No spaces.' });
    expect(screen.getByText('No spaces.')).toBeInTheDocument();
  });

  it('replaces the hint with the error rather than showing both', () => {
    renderField({ hint: 'No spaces.', error: 'Username is required.' });

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.queryByText('No spaces.')).not.toBeInTheDocument();
  });

  it('marks the input invalid so screen readers announce it', () => {
    renderField({ error: 'Username is required.' });
    expect(screen.getByLabelText('Username')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('points aria-describedby at whichever line is on screen', () => {
    const { rerender } = renderField({ hint: 'No spaces.' });
    expect(screen.getByLabelText('Username')).toHaveAttribute(
      'aria-describedby',
      'username-hint',
    );

    rerender(
      <FormField
        label="Username"
        name="username"
        value=""
        onChange={noop}
        onBlur={noop}
        hint="No spaces."
        error="Username is required."
      />,
    );
    expect(screen.getByLabelText('Username')).toHaveAttribute(
      'aria-describedby',
      'username-error',
    );
  });

  describe('password toggle', () => {
    const renderPassword = () =>
      renderField({ label: 'Password', name: 'password', type: 'password' });

    it('hides the password to begin with', () => {
      renderPassword();
      expect(screen.getByLabelText('Password')).toHaveAttribute(
        'type',
        'password',
      );
    });

    it('reveals it when pressed, and hides it again', async () => {
      const user = userEvent.setup();
      renderPassword();

      await user.click(screen.getByRole('button', { name: 'Show password' }));
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');

      await user.click(screen.getByRole('button', { name: 'Hide password' }));
      expect(screen.getByLabelText('Password')).toHaveAttribute(
        'type',
        'password',
      );
    });

    it('is not rendered for an ordinary field', () => {
      renderField();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('reports typing back to the parent', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderField({ onChange });

    await user.type(screen.getByLabelText('Username'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
