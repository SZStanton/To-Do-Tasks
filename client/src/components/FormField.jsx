import { useState } from 'react';

//=== FORM FIELD ===
// Label, input, and either a hint or an inline error underneath.
// The parent owns the value and the error, this only owns the password toggle
function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  hint,
  error,
  placeholder,
  autoComplete,
}) {
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;

  // Point aria-describedby at whichever line is actually on screen
  const messageId = error ? `${name}-error` : `${name}-hint`;
  const hasMessage = Boolean(error || hint);

  const input = (
    <input
      id={name}
      name={name}
      type={inputType}
      className={`form-control${error ? ' is-invalid' : ''}`}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={Boolean(error)}
      aria-describedby={hasMessage ? messageId : undefined}
    />
  );

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>

      {isPassword ? (
        <div className="input-group">
          {input}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setRevealed(shown => !shown)}
            aria-pressed={revealed}
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {/* Icon shows the current state, open eye means you can read it */}
            <i
              className={revealed ? 'bi bi-eye' : 'bi bi-eye-slash'}
              aria-hidden="true"
            />
          </button>
        </div>
      ) : (
        input
      )}

      {/* d-block because bootstrap hides invalid-feedback outside its own markup */}
      {error ? (
        <div id={`${name}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      ) : (
        hint && (
          <div id={`${name}-hint`} className="form-text">
            {hint}
          </div>
        )
      )}
    </div>
  );
}

export default FormField;
