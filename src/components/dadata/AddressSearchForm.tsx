// src/components/AddressSearch/AddressSearchForm.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText
} from '@ionic/react';
import { locationOutline, checkmarkOutline } from 'ionicons/icons';
import './AddressSearchForm.css';

// ============================================
// ТИПЫ ДЛЯ DADATA
// ============================================
interface DaDataSuggestion {
    value: string;
    unrestricted_value: string;
    data: {
        postal_code?: string;
        country: string;
        region_with_type: string;
        area_with_type?: string;
        city_with_type?: string;
        settlement_with_type?: string;
        street_with_type?: string;
        house_type?: string;
        house?: string;
        flat_type?: string;
        flat?: string;
        fias_id?: string;
        fias_level?: string;
        geo_lat?: string;
        geo_lon?: string;
    };
}

interface DaDataResponse {
    suggestions: DaDataSuggestion[];
}

interface AddressSearchFormProps {
    onAddressSelect?: (address: DaDataSuggestion) => void;
    placeholder?: string;
    label?: string;
    initialValue?: string;
    disabled?: boolean;
}

// ============================================
// КОМПОНЕНТ ФОРМЫ ПОИСКА АДРЕСА
// ============================================
export const AddressSearchForm: React.FC<AddressSearchFormProps> = ({
    onAddressSelect,
    placeholder = "Введите адрес...",
    label = "Адрес",
    initialValue = "",
    disabled = false
}) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<DaDataSuggestion | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const inputRef = useRef<HTMLIonInputElement>(null);

    // ============================================
    // API КЛЮЧ DADATA (в реальном проекте - из env)
    // ============================================
    const DADATA_API_KEY    = "50bfb3453a528d091723900fdae5ca5a30369832";
    const DADATA_URL        = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

    // ============================================
    // ПОИСК АДРЕСОВ ЧЕРЕЗ DADATA API
    // ============================================
    const searchAddress = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(DADATA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${DADATA_API_KEY}`
                },
                body: JSON.stringify({
                    query: searchQuery,
                    count: 10,
                    locations: [{
                        country: "*"
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DaDataResponse = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Ошибка поиска адреса:', err);
            setError('Ошибка при поиске адреса');
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [DADATA_API_KEY]);

    // ============================================
    // ОБРАБОТЧИК ИЗМЕНЕНИЯ ТЕКСТА
    // ============================================
    const handleInputChange = useCallback((value: string) => {
        setQuery(value);
        setSelectedAddress(null);
        setShowSuggestions(true);

        // Очищаем предыдущий таймер
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Запускаем поиск с задержкой
        timeoutRef.current = setTimeout(() => {
            searchAddress(value);
        }, 300);
    }, [searchAddress]);

    // ============================================
    // ОБРАБОТЧИК ВЫБОРА АДРЕСА
    // ============================================
    const handleAddressSelect = useCallback((suggestion: DaDataSuggestion) => {
        setQuery(suggestion.value);
        setSelectedAddress(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        
        if (onAddressSelect) {
            onAddressSelect(suggestion);
        }
    }, [onAddressSelect]);

    // ============================================
    // ОЧИСТКА ТАЙМЕРА ПРИ РАЗМОНТИРОВАНИИ
    // ============================================
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // ============================================
    // ОБРАБОТЧИК ФОКУСА
    // ============================================
    const handleFocus = useCallback(() => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [suggestions]);

    // ============================================
    // ОБРАБОТЧИК ПОТЕРИ ФОКУСА
    // ============================================
    const handleBlur = useCallback(() => {
        // Задержка для обработки клика по подсказке
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    }, []);

    return (
        <div className="address-search-form">
            <IonItem className="address-input-item">
                <IonLabel position="stacked">{label}</IonLabel>
                <IonInput
                    ref={inputRef}
                    value={query}
                    placeholder={placeholder}
                    disabled={disabled}
                    onIonInput={(e) => handleInputChange(e.detail.value!)}
                    onIonFocus={handleFocus}
                    onIonBlur={handleBlur}
                    className="address-input"
                />
                {loading && (
                    <IonSpinner 
                        name="crescent" 
                        slot="end" 
                        className="address-spinner"
                    />
                )}
                {selectedAddress && (
                    <IonIcon 
                        icon={checkmarkOutline} 
                        slot="end" 
                        className="address-check-icon"
                    />
                )}
            </IonItem>

            {error && (
                <IonText color="danger" className="address-error">
                    <p>{error}</p>
                </IonText>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <IonCard className="address-suggestions">
                    <IonCardContent className="suggestions-content">
                        <IonList>
                            {suggestions.map((suggestion, index) => (
                                <IonItem
                                    key={index}
                                    button
                                    onClick={() => handleAddressSelect(suggestion)}
                                    className="suggestion-item"
                                >
                                    <IonIcon
                                        icon={locationOutline}
                                        slot="start"
                                        className="suggestion-icon"
                                    />
                                    <IonLabel>
                                        <h3 className="suggestion-value">
                                            {suggestion.value}
                                        </h3>
                                        {suggestion.data.postal_code && (
                                            <p className="suggestion-postal">
                                                Индекс: {suggestion.data.postal_code}
                                            </p>
                                        )}
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonCardContent>
                </IonCard>
            )}

            {selectedAddress && (
                <IonCard className="selected-address-info">
                    <IonCardContent>
                        <div className="address-details">
                            <h4>Выбранный адрес:</h4>
                            <p className="address-full">{selectedAddress.unrestricted_value}</p>
                            
                            {selectedAddress.data.postal_code && (
                                <p className="address-detail">
                                    <strong>Индекс:</strong> {selectedAddress.data.postal_code}
                                </p>
                            )}
                            
                            {selectedAddress.data.fias_id && (
                                <p className="address-detail">
                                    <strong>ФИАС ID:</strong> {selectedAddress.data.fias_id}
                                </p>
                            )}
                            
                            {selectedAddress.data.geo_lat && selectedAddress.data.geo_lon && (
                                <p className="address-detail">
                                    <strong>Координаты:</strong> {selectedAddress.data.geo_lat}, {selectedAddress.data.geo_lon}
                                </p>
                            )}
                        </div>
                    </IonCardContent>
                </IonCard>
            )}
        </div>
    );
};

export default AddressSearchForm;