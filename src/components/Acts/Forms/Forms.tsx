import React from 'react';
import { 
  FormFieldProps, 
  TextAreaFieldProps, 
  ReadOnlyFieldProps, 
  FormSectionProps, 
  FormRowProps 
} from './types';
import './Forms.css';


// === ПЕРЕИСПОЛЬЗУЕМЫЕ UI КОМПОНЕНТЫ ===

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  placeholder, 
  value, 
  onChange, 
  error, 
  className = '', 
  readOnly = false,
  hint 
}) => (
  <div className="form-group">
    <label>{label}{required && '*'}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${error ? 'error' : ''} ${readOnly ? 'readonly' : ''} ${className}`}
      required={required}
      readOnly={readOnly}
    />
    {hint && <small className="field-hint">{hint}</small>}
    {error && <span className="error-message">{error}</span>}
  </div>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
  label, 
  name, 
  required = false, 
  placeholder, 
  value, 
  onChange, 
  error, 
  rows = 3 
}) => (
  <div className="form-group">
    <label>{label}{required && '*'}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? 'error' : ''}
      required={required}
      rows={rows}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
);

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ 
  label, 
  value, 
  hint 
}) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type="text"
      value={value}
      readOnly
      className="readonly"
    />
    {hint && <small className="field-hint">{hint}</small>}
  </div>
);

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children 
}) => (
  <div className="form-section">
    <h3>{title}</h3>
    {children}
  </div>
);

export const FormRow: React.FC<FormRowProps> = ({ 
  children 
}) => (
  <div className="form-row">
    {children}
  </div>
);