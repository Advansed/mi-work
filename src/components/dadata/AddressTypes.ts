// src/components/dadata/incrementalTypes.ts

// ============================================
// ТИПЫ ДЛЯ ИНКРЕМЕНТАЛЬНОГО ПОИСКА DADATA
// ============================================

export type AddressLevel = 'region' | 'city' | 'street' | 'house';

export interface AddressChain {
    region: DaDataSuggestion | null;
    city: DaDataSuggestion | null;
    street: DaDataSuggestion | null;
    house: DaDataSuggestion | null;
}

export interface LevelState {
    suggestions: DaDataSuggestion[];
    loading: boolean;
    error: string | null;
    query: string;
}

export interface IncrementalSearchState {
    levels: Record<AddressLevel, LevelState>;
    chain: AddressChain;
    cache: Map<string, DaDataSuggestion[]>;
}

export interface IncrementalSearchOptions {
    apiKey?: string;
    debounceMs?: number;
    maxSuggestions?: number;
    minQueryLength?: number;
}

export interface LevelConfig {
    fromBound: string;
    toBound: string;
    placeholder: string;
    label: string;
    parentLevel?: AddressLevel;
}

// Импорт типа из существующего файла
import type { DaDataSuggestion } from './dadata';