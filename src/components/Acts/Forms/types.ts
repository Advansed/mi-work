// === ТИПЫ И ИНТЕРФЕЙСЫ ДЛЯ ФОРМ ===

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  readOnly?: boolean;
  hint?: string;
}

export interface TextAreaFieldProps {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
}

export interface ReadOnlyFieldProps {
  label: string;
  value: string;
  hint?: string;
}

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export interface FormRowProps {
  children: React.ReactNode;
}