// ============================================
// ЭКСПОРТЫ PDF МОДУЛЯ
// ============================================

// Основные классы
export { PDFGenerator } from './PDFGenerator';
export { PDFGeneratorComponent } from './PDFGeneratorComponent';

// Шаблоны
export { BaseTemplate } from './templates/BaseTemplate';
export { ActOrderTemplate } from './templates/ActOrderTemplate';

// Утилиты
export { FontLoader } from './utils/fontLoader';
export { TextUtils } from './utils/textUtils';
export { MeasureUtils } from './utils/measureUtils';

// Типы
export type {
    ActOrderData,
    RepresentativeData,
    OrderData,
    ExecutionData,
    ReconnectionData,
    SignatureData,
    PDFConfig,
    FontConfig,
    TextOptions,
    FieldPosition,
    TemplateLayout,
    FieldPositions,
    SectionSpacing
} from './types';

// Конфигурация
export {
    DEFAULT_PDF_CONFIG,
    PAGE_DIMENSIONS,
    CORPORATE_SETTINGS,
    FIELD_SETTINGS,
    SIGNATURE_SETTINGS
} from './config';

import { PDFGenerator } from './PDFGenerator';
// CSS стили (импортируется автоматически при использовании компонентов)
import './PDFGenerator.css';
import { ActOrderData } from './types';

// ============================================
// ХЕЛПЕРЫ ДЛЯ БЫСТРОГО ИСПОЛЬЗОВАНИЯ
// ============================================

/**
 * Быстрая генерация АКТ-НАРЯДА
 */
export async function generateActOrderPDF(data: ActOrderData, filename?: string): Promise<Blob> {
    const generator = new PDFGenerator();
    await generator.initialize();
    await generator.generateActOrder(data);
    
    if (filename) {
        generator.savePDF(filename);
    }
    
    return generator.getBlob();
}

/**
 * Быстрый предпросмотр АКТ-НАРЯДА
 */
export async function previewActOrderPDF(data: ActOrderData): Promise<string> {
    const generator = new PDFGenerator();
    await generator.initialize();
    await generator.generateActOrder(data);
    
    return generator.getPreviewUrl();
}

/**
 * Конвертирует данные формы в формат ActOrderData
 */
export function convertFormDataToActOrder(formData: any): ActOrderData {
    return {
        actNumber: formData.actNumber || '',
        date: formData.date || new Date().toISOString(),
        representative: {
            name: formData.representative || '',
            position: formData.position || '',
            reason: formData.reason || ''
        },
        order: {
            equipment: formData.equipment || '',
            apartment: formData.apartment || '',
            house: formData.house || '',
            street: formData.street || '',
            subscriber: formData.subscriber || '',
            orderGiver: {
                name: formData.orderGiver || '',
                position: 'Мастер'
            },
            orderReceiver: {
                name: formData.orderReceiver || '',
                position: 'Слесарь'
            }
        },
        execution: {
            executor: formData.executor || '',
            executionDate: formData.executionDate || '',
            executionTime: formData.executionTime || '',
            disconnectedEquipment: formData.disconnectedEquipment || '',
            representativeSignature: {
                name: formData.executor || '',
                position: 'Представитель эксплуатационной организации'
            },
            subscriberSignature: {
                name: formData.subscriber || '',
                position: 'Ответственный квартиросъёмщик (абонент)'
            }
        },
        reconnection: {
            reconnectionDate: formData.reconnectionDate || '',
            reconnectionBy: formData.reconnectionBy || '',
            reconnectionOrder: formData.reconnectionOrder || '',
            apartment: formData.apartment || '',
            house: formData.house || '',
            street: formData.street || '',
            subscriber: formData.subscriber || '',
            representativeSignature: {
                name: formData.reconnectionBy || '',
                position: 'Представитель эксплуатационной организации'
            },
            subscriberSignature: {
                name: formData.subscriber || '',
                position: 'Ответственный квартиросъёмщик (абонент)'
            }
        }
    };
}

// ============================================
// КОНСТАНТЫ ДЛЯ ЭКСПОРТА
// ============================================

export const PDF_CONSTANTS = {
    DEFAULT_FILENAME: 'act-order.pdf',
    SUPPORTED_FORMATS: ['a4', 'letter'] as const,
    SUPPORTED_ORIENTATIONS: ['portrait', 'landscape'] as const,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MIME_TYPE: 'application/pdf'
};

// ============================================
// ВЕРСИЯ МОДУЛЯ
// ============================================

export const PDF_MODULE_VERSION = '1.0.0';