import React, { useEffect, useRef, useState } from 'react';
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
