// Оптимизированный DropdownFilter.tsx с корпоративными CSS классами
import React, { useState, useCallback, useMemo } from 'react';
import { DropdownFilterProps, DropdownOption } from './useFindLics';
import './DropDownFilter.css'

const DropdownFilter: React.FC<DropdownFilterProps> = ({ 
    options = [], 
    onSelect 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Мемоизированная фильтрация опций
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        
        return options.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Оптимизированные обработчики с useCallback
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setHighlightedIndex(-1);
        if (!isOpen) setIsOpen(true);
    }, [isOpen]);

    const handleOptionSelect = useCallback((option: DropdownOption) => {
        setSelectedOption(option);
        setSearchTerm(option.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        
        if (onSelect) {
            onSelect(option);
        }
    }, [onSelect]);

    const handleInputFocus = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleInputBlur = useCallback(() => {
        // Задержка для обработки клика по опции
        setTimeout(() => {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }, 200);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                setHighlightedIndex(prev => 
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                e.preventDefault();
                break;
            case 'ArrowUp':
                setHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                e.preventDefault();
                break;
            case 'Enter':
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleOptionSelect(filteredOptions[highlightedIndex]);
                }
                e.preventDefault();
                break;
        }
    }, [isOpen, filteredOptions, highlightedIndex, handleOptionSelect]);

    // Определяем CSS классы для input
    const inputClassName = useMemo(() => {
        const classes = ['dropdown-input'];
        if (selectedOption) classes.push('has-value');
        return classes.join(' ');
    }, [selectedOption]);

    // Определяем CSS классы для контейнера
    const containerClassName = useMemo(() => {
        const classes = ['dropdown-container'];
        if (options.length === 0) classes.push('loading');
        return classes.join(' ');
    }, [options.length]);

    return (
        <div className={containerClassName}>
            <input
                type="text"
                className={inputClassName}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="Начните вводить для поиска..."
                autoComplete="off"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                role="combobox"
            />
            
            {isOpen && (
                <div 
                    className="dropdown-list"
                    role="listbox"
                    data-count={filteredOptions.length}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const itemClasses = ['dropdown-item'];
                            if (index === highlightedIndex) {
                                itemClasses.push('dropdown-item--highlighted');
                            }
                            
                            return (
                                <div
                                    key={`${option.type}-${option.id}-${index}`}
                                    className={itemClasses.join(' ')}
                                    onClick={() => handleOptionSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    role="option"
                                    aria-selected={index === highlightedIndex}
                                    data-group={option.type}
                                >
                                    {option.name}
                                </div>
                            );
                        })
                    ) : (
                        <div className="dropdown-item dropdown-item--empty">
                            Не найдено
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(DropdownFilter, (prevProps, nextProps) => {
    // Кастомная функция сравнения для более точного контроля рендеринга
    return (
        prevProps.options === nextProps.options &&
        prevProps.onSelect === nextProps.onSelect
    );
});