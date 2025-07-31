// src/services/dadataService.ts

import {
    DaDataConfig,
    DaDataAddressRequest,
    DaDataResponse,
    DaDataSuggestion,
    DaDataApiError,
    DADATA_DEFAULTS,
    FormattedAddress
} from './dadata';

// ============================================
// СЕРВИС ДЛЯ РАБОТЫ С DADATA API
// ============================================

export class DaDataService {
    private config: Required<DaDataConfig>;
    private controller: AbortController | null = null;

    constructor(config: DaDataConfig) {
        this.config = {
            baseUrl: config.baseUrl || DADATA_DEFAULTS.baseUrl,
            timeout: config.timeout || DADATA_DEFAULTS.timeout,
            apiKey: config.apiKey
        };
    }

    // ============================================
    // ПОИСК АДРЕСОВ
    // ============================================
    async searchAddresses(query: string, options?: Partial<DaDataAddressRequest>): Promise<DaDataSuggestion[]> {
        if (!query || query.length < 2) {
            return [];
        }

        // Отменяем предыдущий запрос
        this.cancelRequest();

        // Создаем новый контроллер для отмены
        this.controller = new AbortController();

        const requestBody: DaDataAddressRequest = {
            query,
            count: DADATA_DEFAULTS.count,
            ...options
        };

        try {
            const response = await fetch(`${this.config.baseUrl}/suggest/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${this.config.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: this.controller.signal
            });

            if (!response.ok) {
                throw new DaDataApiError(
                    response.status,
                    `HTTP error! status: ${response.status}`,
                    await response.text()
                );
            }

            const data: DaDataResponse = await response.json();
            return data.suggestions || [];

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Запрос был отменен - не считаем это ошибкой
                return [];
            }

            if (error instanceof DaDataApiError) {
                throw error;
            }

            throw new DaDataApiError(
                0,
                'Ошибка сети при обращении к DaData API',
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            this.controller = null;
        }
    }

    // ============================================
    // ПОИСК АДРЕСА ПО ФИАС ID
    // ============================================
    async getAddressByFiasId(fiasId: string): Promise<DaDataSuggestion | null> {
        try {
            const response = await fetch(`${this.config.baseUrl}/findById/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    query: fiasId
                })
            });

            if (!response.ok) {
                throw new DaDataApiError(
                    response.status,
                    `HTTP error! status: ${response.status}`
                );
            }

            const data: DaDataResponse = await response.json();
            return data.suggestions?.[0] || null;

        } catch (error) {
            if (error instanceof DaDataApiError) {
                throw error;
            }

            throw new DaDataApiError(
                0,
                'Ошибка при получении адреса по ФИАС ID',
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    // ============================================
    // ОТМЕНА ТЕКУЩЕГО ЗАПРОСА
    // ============================================
    cancelRequest(): void {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
    }

    // ============================================
    // ФОРМАТИРОВАНИЕ АДРЕСА
    // ============================================
    static formatAddress(suggestion: DaDataSuggestion): FormattedAddress {
        const { value, unrestricted_value, data } = suggestion;

        const parts = {
            region: data.region,
            city: data.city || data.settlement,
            street: data.street,
            house: data.house,
            flat: data.flat
        };

        const coordinates = data.geo_lat && data.geo_lon ? {
            lat: parseFloat(data.geo_lat),
            lon: parseFloat(data.geo_lon)
        } : undefined;

        return {
            full: unrestricted_value,
            short: value,
            parts,
            coordinates,
            fiasId: data.fias_id,
            postalCode: data.postal_code
        };
    }

    // ============================================
    // ПОЛУЧЕНИЕ КРАТКОГО АДРЕСА ДЛЯ ОТОБРАЖЕНИЯ
    // ============================================
    static getShortAddress(suggestion: DaDataSuggestion): string {
        const { data } = suggestion;
        const parts: any = [];

        if (data.city || data.settlement) {
            parts.push(data.city || data.settlement);
        }

        if (data.street) {
            parts.push(data.street_with_type || data.street);
        }

        if (data.house) {
            parts.push(`д. ${data.house}`);
        }

        if (data.flat) {
            parts.push(`кв. ${data.flat}`);
        }

        return parts.join(', ');
    }

    // ============================================
    // ПРОВЕРКА ПОЛНОТЫ АДРЕСА
    // ============================================
    static isCompleteAddress(suggestion: DaDataSuggestion): boolean {
        const { data } = suggestion;
        
        // Адрес считается полным, если есть минимум город и улица
        return !!(
            (data.city || data.settlement) &&
            data.street &&
            data.house
        );
    }

    // ============================================
    // ПОЛУЧЕНИЕ КООРДИНАТ ИЗ АДРЕСА
    // ============================================
    static getCoordinates(suggestion: DaDataSuggestion): { lat: number; lon: number } | null {
        const { data } = suggestion;
        
        if (data.geo_lat && data.geo_lon) {
            const lat = parseFloat(data.geo_lat);
            const lon = parseFloat(data.geo_lon);
            
            if (!isNaN(lat) && !isNaN(lon)) {
                return { lat, lon };
            }
        }
        
        return null;
    }

    // ============================================
    // СТАТИЧЕСКИЙ МЕТОД ДЛЯ СОЗДАНИЯ ЭКЗЕМПЛЯРА
    // ============================================
    static create(apiKey: string, options?: Partial<DaDataConfig>): DaDataService {
        return new DaDataService({
            apiKey,
            ...options
        });
    }
}

// ============================================
// ХЕЛПЕРЫ ДЛЯ РАБОТЫ С АДРЕСАМИ
// ============================================

export const AddressHelpers = {
    // Получить только город из адреса
    getCityFromAddress: (suggestion: DaDataSuggestion): string => {
        return suggestion.data.city || suggestion.data.settlement || '';
    },

    // Получить улицу с типом
    getStreetFromAddress: (suggestion: DaDataSuggestion): string => {
        return suggestion.data.street_with_type || suggestion.data.street || '';
    },

    // Получить дом
    getHouseFromAddress: (suggestion: DaDataSuggestion): string => {
        return suggestion.data.house || '';
    },

    // Получить квартиру
    getFlatFromAddress: (suggestion: DaDataSuggestion): string => {
        return suggestion.data.flat || '';
    },

    // Проверить, является ли адрес в указанном городе
    isInCity: (suggestion: DaDataSuggestion, cityName: string): boolean => {
        const city = suggestion.data.city || suggestion.data.settlement || '';
        return city.toLowerCase().includes(cityName.toLowerCase());
    },

    // Получить иерархию адреса
    getAddressHierarchy: (suggestion: DaDataSuggestion): string[] => {
        const { data } = suggestion;
        const hierarchy: any = [];

        if (data.region) hierarchy.push(data.region);
        if (data.area) hierarchy.push(data.area);
        if (data.city) hierarchy.push(data.city);
        if (data.settlement && !data.city) hierarchy.push(data.settlement);
        if (data.street) hierarchy.push(data.street);
        if (data.house) hierarchy.push(`д. ${data.house}`);
        if (data.flat) hierarchy.push(`кв. ${data.flat}`);

        return hierarchy;
    }
};

// ============================================
// ЭКСПОРТ ДЕФОЛТНОГО ЭКЗЕМПЛЯРА
// ============================================
let defaultInstance: DaDataService | null = null;

export const getDefaultDaDataService = (): DaDataService => {
    if (!defaultInstance) {
        const apiKey = process.env.REACT_APP_DADATA_API_KEY;
        if (!apiKey) {
            throw new Error('REACT_APP_DADATA_API_KEY не установлен в переменных окружения');
        }
        defaultInstance = DaDataService.create(apiKey);
    }
    return defaultInstance;
};

export default DaDataService;