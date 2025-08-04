import React, { useEffect, useRef, useState } from 'react';

// ============================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  className?: string;
}

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  className?: string;
}

// ============================================
// КОМПОНЕНТЫ
// ============================================

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = '' 
}) => (
  <div className={`form-section ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>
);

export const FormRow: React.FC<FormRowProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`form-row ${className}`}>
    {children}
  </div>
);

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  readonly = false,
  required = false,
  className = ''
}) => (
  <div className={`form-group ${className}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readonly}
      className={`${error ? 'error' : ''} ${readonly ? 'readonly' : ''}`}
    />
    {error && <span className="error-text">{error}</span>}
  </div>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  readonly = false,
  required = false,
  rows = 3,
  className = ''
}) => (
  <div className={`form-group ${className}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readonly}
      rows={rows}
      className={`${error ? 'error' : ''} ${readonly ? 'readonly' : ''}`}
    />
    {error && <span className="error-text">{error}</span>}
  </div>
);

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  className = ''
}) => (
  <div className={`form-group ${className}`}>
    <label>{label}</label>
    <input
      type="text"
      value={value}
      readOnly
      className="readonly"
    />
  </div>
);


export const PrintRow = ({ prefix, data }) => {
  const dataRef = useRef(null);
  const containerRef = useRef(null);
  const [textParts, setTextParts] = useState({ current: data, remaining: '' });
  const [containerWidth, setContainerWidth] = useState(0);

  const measureText = (text, font) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if( ctx ){
      ctx.font = font;
      return ctx.measureText(text).width;
    } else return 0
  };

  const splitTextToFit = (text, maxWidth, font) => {
    if (!text || maxWidth <= 0) return { current: text, remaining: '' };
    
    const fullWidth = measureText(text, font);
    if (fullWidth <= maxWidth) {
      return { current: text, remaining: '' };
    }

    const words = text.split(' ');
    let currentText = '';
    let remainingWords = [];
    let foundSplit = false;

    for (let i = 0; i < words.length; i++) {
      const testText = currentText + (currentText ? ' ' : '') + words[i];
      const testWidth = measureText(testText, font);
      
      if (testWidth > maxWidth && currentText) {
        remainingWords = words.slice(i);
        foundSplit = true;
        break;
      } else {
        currentText = testText;
      }
    }

    if (!foundSplit) {
      // Если даже одно слово не помещается, разделяем по символам
      for (let i = 1; i < text.length; i++) {
        const testText = text.substring(0, i);
        const testWidth = measureText(testText, font);
        
        if (testWidth > maxWidth) {
          return {
            current: text.substring(0, i - 1),
            remaining: text.substring(i - 1)
          };
        }
      }
    }

    return {
      current: currentText,
      remaining: remainingWords.join(' ')
    };
  };

  // ResizeObserver для отслеживания изменения размера контейнера
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = (containerRef.current as any).clientWidth;
        setContainerWidth(width);
      }
    };

    updateContainerWidth();

    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Дополнительная проверка через requestAnimationFrame для первого рендера
    const rafId = requestAnimationFrame(updateContainerWidth);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Пересчет текста при изменении data или ширины контейнера
  useEffect(() => {
    if (dataRef.current && data && containerWidth > 0) {

      const prefixWidth = (dataRef.current as any).previousElementSibling?.offsetWidth || 0;
      const availableWidth = containerWidth - prefixWidth - prefix.length; // -8 для отступов
      
      if (availableWidth > 0) {
        const styles = getComputedStyle(dataRef.current);
        const font = `${styles.fontSize} ${styles.fontFamily}`;
        
        const parts = splitTextToFit(data, availableWidth, font);
        setTextParts(parts);
      }
    }
  }, [data, containerWidth]);

  return (
    <div className="w-100 ">
      <div ref={containerRef} className="w-100 flex">
        <div className="fs-bold">{ prefix !== "" ? prefix : "" }</div>
            {
              data !== ''
                ? <>
                  <div 
                    ref={dataRef}
                    className={ prefix ==='' ? "t-underline flex-grow fs-italic" : 't-underline flex-grow ml-05 fs-italic' }
                  >
                      { textParts.current}
                  </div>
                </>
                : <></>
            }
      </div>
      
      {textParts.remaining && (
        <PrintRow prefix = "" data={textParts.remaining} />
      )}
    </div>
  );
};
