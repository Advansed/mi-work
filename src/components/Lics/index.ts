// ============================================
// ЭКСПОРТЫ МОДУЛЯ LICS
// ============================================

// Основные компоненты
export { default as Lics } from './Lics';
export { default as LicsList } from './components/List/LicsList';

// Хуки
export { useLics } from './useLics';

// Типы
export type {
    IDebt,
    ICounter,
    IAgree,
    IEquip,
    ILicAccount,
    ILicsResponse
} from './useLics';

// Компоненты поиска
export { default as FindLics } from './components/FindLic/FindLics';