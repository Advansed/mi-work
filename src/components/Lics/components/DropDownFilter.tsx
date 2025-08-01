import React, { useState, useEffect, useRef } from 'react';
import { DropdownFilterProps, DropdownOption } from '../useLics';

const DropdownFilter: React.FC<DropdownFilterProps> = ({ options = [], onSelect }) => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const filtered = options.filter(item => 
    item.name.toLowerCase().includes(value.toLowerCase())
  );

  // Сброс выделения при изменении фильтра
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  // Автоскролл к выделенному элементу
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          selectItem(filtered[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const selectItem = (item: DropdownOption) => {
    setValue(item.name);
    setOpen(false);
    setHighlightedIndex(-1);
    onSelect?.(item);
    inputRef.current?.focus();
  };

  const handleMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputBlur = () => {
    // Задержка для обработки клика по элементу списка
    setTimeout(() => {
      setOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  return (
    <div className="dropdown-container">
      <input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="dropdown-input"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={
          highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined
        }
      />
      
      {open && filtered.length > 0 && (
        <div 
          ref={listRef}
          className="dropdown-list"
          role="listbox"
        >
          {filtered.map((item, index) => (
            <div
              key={item.id}
              id={`option-${index}`}
              onClick={() => selectItem(item)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`dropdown-item ${
                index === highlightedIndex ? 'dropdown-item--highlighted' : ''
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      
      {open && filtered.length === 0 && value && (
        <div className="dropdown-list">
          <div className="dropdown-item dropdown-item--empty">
            Нет результатов
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;