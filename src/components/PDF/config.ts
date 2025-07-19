// ============================================
// КОНФИГУРАЦИЯ PDF ГЕНЕРАТОРА
// ============================================

import { PDFConfig } from './types';

export const DEFAULT_PDF_CONFIG: PDFConfig = {
    format: 'a4',
    orientation: 'portrait',
    
    margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    
    fonts: {
        regular: {
            family: 'times',
            size: 12,
            style: 'normal'
        },
        bold: {
            family: 'times',
            size: 12,
            style: 'bold'
        },
        title: {
            family: 'times',
            size: 16,
            style: 'bold'
        }
    },
    
    colors: {
        primary: '#1E3A8A',     // var(--color-primary-dark)
        secondary: '#F97316',   // var(--color-accent)
        text: '#000000',
        lines: '#CCCCCC'
    },
    
    elements: {
        logoWidth: 40,
        logoHeight: 40,
        lineHeight: 6,
        fieldHeight: 8,
        sectionSpacing: 15
    }
};

// Размеры страницы A4 в мм
export const PAGE_DIMENSIONS = {
    width: 210,
    height: 297
};

// Корпоративные настройки
export const CORPORATE_SETTINGS = {
    companyName: 'САХАТРАНСНЕФТЕГАЗ',
    department: 'УСД',
    documentTitle: 'АКТ-НАРЯД',
    documentSubtitle: 'НА ОТКЛЮЧЕНИЕ ГАЗОИСПОЛЬЗУЮЩЕГО\nОБОРУДОВАНИЯ ЖИЛЫХ ЗДАНИЙ'
};

// Настройки полей ввода
export const FIELD_SETTINGS = {
    underlineThickness: 0.5,
    underlineColor: '#000000',
    fieldPadding: 2,
    minimumFieldWidth: 20
};

// Настройки подписей
export const SIGNATURE_SETTINGS = {
    lineLength: 60,
    lineSpacing: 8,
    labelSpacing: 3
};