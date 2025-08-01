// Оптимизированный DropdownFilter.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { DropdownFilterProps, DropdownOption } from '../useLics';


const DropdownFilter: React.FC<DropdownFilterProps> = ({ 
    options = [], 
    onSelect 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);

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
        if (!isOpen) setIsOpen(true);
    }, [isOpen]);

    const handleOptionSelect = useCallback((option: DropdownOption) => {
        setSelectedOption(option);
        setSearchTerm(option.name);
        setIsOpen(false);
        
        if (onSelect) {
            onSelect(option);
        }
    }, [onSelect]);

    const handleInputFocus = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleInputBlur = useCallback(() => {
        // Задержка для обработки клика по опции
        setTimeout(() => setIsOpen(false), 200);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'Enter' && filteredOptions.length > 0) {
            handleOptionSelect(filteredOptions[0]);
        }
    }, [filteredOptions, handleOptionSelect]);

    return (
        <div className="dropdown-container">
            <input
                type="text"
                className="dropdown-input"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="Начните вводить для поиска..."
                autoComplete="off"
            />
            
            {isOpen && (
                <div className="dropdown-list">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={`${option.type}-${option.id}-${index}`}
                                className="dropdown-item"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option.name}
                            </div>
                        ))
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