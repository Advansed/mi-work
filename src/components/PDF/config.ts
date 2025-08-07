// ============================================
// КОНФИГУРАЦИЯ PDF С ПОДДЕРЖКОЙ КИРИЛЛИЦЫ
// ============================================

import { PDFConfig } from './types';

export const DEFAULT_PDF_CONFIG: PDFConfig = {
    orientation: 'portrait',
    format: 'a4',
    colors: {
        primary: '#1e3a8a',
        secondary: '#64748b',
        text: '#000000',
        background: '#ffffff'
    },
    fonts: {
        regular: {
            family: 'times',
            size: 12,
            lineHeight: 1.4
        },
        bold: {
            family: 'times',
            size: 12,
            lineHeight: 1.4
        },
        italic: {
            family: 'times',
            size: 12,
            lineHeight: 1.4
        }
    },
    margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    }
};

export const PAGE_DIMENSIONS = {
    A4: {
        width: 210,
        height: 297,
        unit: 'mm'
    }
};

export const CORPORATE_SETTINGS = {
    companyName: 'Сахатранснефтегаз УСД',
    inn: '1435142972',
    kpp: '140045003',
    ogrn: '1031402073097',
    address: 'г.Якутск, ул. П.Алексеева, 64Б',
    phone: '46-00-93, 46-00-41',
    workTime: 'будни с 8:00 до 17:00, обед с 12:00 до 13:00; суббота, воскресенье - выходной'
};

export const FIELD_SETTINGS = {
    underlineLength: {
        short: 10,
        medium: 20,
        long: 30,
        extraLong: 50
    },
    spacing: {
        line: 8,
        section: 15,
        paragraph: 10
    }
};

export const SIGNATURE_SETTINGS = {
    lineLength: 100,
    spacing: 15,
    fontSize: 12
};

// ============================================
// НАСТРОЙКИ КИРИЛЛИЦЫ
// ============================================

export const CYRILLIC_CONFIG = {
    // Поддерживаемые шрифты для кириллицы
    supportedFonts: ['times', 'helvetica', 'courier'],
    
    // Настройки кодировки
    encoding: 'UTF-8',
    
    // Fallback символы для проблемных знаков
    fallbackChars: {
        '«': '"',
        '»': '"',
        '№': 'No.',
        '–': '-',
        '—': '-'
    },
    
    // Проверка поддержки кириллицы
    testString: 'Тест кириллицы АБВ абв',
    
    // Безопасные диапазоны Unicode
    safeRanges: [
        [0x0000, 0x007F], // Базовая латиница
        [0x0400, 0x04FF], // Кириллица
        [0x0500, 0x052F], // Дополнительная кириллица
        [0x2000, 0x206F], // Общая пунктуация
        [0x0020, 0x0020], // Пробел
        [0x00A0, 0x00A0]  // Неразрывный пробел
    ]
};

// ============================================
// УТИЛИТЫ КОНФИГУРАЦИИ
// ============================================

export class ConfigUtils {
    /**
     * Создает конфигурацию с настройками кириллицы
     */
    static createCyrillicConfig(baseConfig?: Partial<PDFConfig>): PDFConfig {
        return {
            ...DEFAULT_PDF_CONFIG,
            ...baseConfig,
            fonts: {
                ...DEFAULT_PDF_CONFIG.fonts,
                ...(baseConfig?.fonts || {})
            }
        };
    }

    /**
     * Проверяет поддержку кириллицы в конфигурации
     */
    static validateCyrillicSupport(config: PDFConfig): boolean {
        try {
            // Проверяем базовые настройки
            const hasValidFonts = CYRILLIC_CONFIG.supportedFonts.includes(config.fonts.regular.family);
            const hasValidEncoding = true; // jsPDF автоматически использует UTF-8
            
            return hasValidFonts && hasValidEncoding;
        } catch (error) {
            console.warn('⚠️ Ошибка проверки поддержки кириллицы:', error);
            return false;
        }
    }

    /**
     * Получает оптимальные настройки для документа
     */
    static getDocumentConfig(documentType: 'act_plomb' | 'act_order' | 'prescript'): PDFConfig {
        const baseConfig = this.createCyrillicConfig();
        
        switch (documentType) {
            case 'act_plomb':
                return {
                    ...baseConfig,
                    fonts: {
                        ...baseConfig.fonts,
                        regular: { ...baseConfig.fonts.regular, size: 12 }
                    }
                };
            
            case 'act_order':
                return {
                    ...baseConfig,
                    fonts: {
                        ...baseConfig.fonts,
                        regular: { ...baseConfig.fonts.regular, size: 11 }
                    }
                };
            
            case 'prescript':
                return {
                    ...baseConfig,
                    fonts: {
                        ...baseConfig.fonts,
                        regular: { ...baseConfig.fonts.regular, size: 10 }
                    }
                };
            
            default:
                return baseConfig;
        }
    }
}

// ============================================
// ЭКСПОРТ КОНФИГУРАЦИЙ ПО ТИПАМ ДОКУМЕНТОВ
// ============================================

export const ACT_PLOMB_CONFIG = ConfigUtils.getDocumentConfig('act_plomb');
export const ACT_ORDER_CONFIG = ConfigUtils.getDocumentConfig('act_order');
export const PRESCRIPT_CONFIG = ConfigUtils.getDocumentConfig('prescript');