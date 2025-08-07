// ============================================
// ИСПРАВЛЕННЫЕ ЭКСПОРТЫ PDF МОДУЛЯ
// ============================================

// Основные классы
export { PDFGenerator } from './PDFGenerator';
export { PDFGeneratorComponent } from './PDFGeneratorComponent';

// Шаблоны
export { BaseTemplate } from './templates/BaseTemplate';
export { ActOrderTemplate } from './templates/ActOrderTemplate';
export { ActPlombTemplate } from './templates/ActplombTemplate';

// Утилиты
export { FontLoader } from './utils/fontLoader';
export { TextUtils } from './utils/textUtils';
export { MeasureUtils } from './utils/measureUtils';

// Типы
export type {
    ActOrderData,
    ActPlombData,
    PlombMeterData,
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
    SectionSpacing,
    PDFGenerationResult,
    PDFGenerationOptions,
    TemplateRenderOptions,
    TemplateValidationResult,
    TextMeasurement,
    FontInfo
} from './types';

// Конфигурация
export {
    DEFAULT_PDF_CONFIG,
    PAGE_DIMENSIONS,
    CORPORATE_SETTINGS,
    FIELD_SETTINGS,
    SIGNATURE_SETTINGS,
    ACT_PLOMB_CONFIG,
    CYRILLIC_CONFIG,
    ConfigUtils
} from './config';

import { PDFGenerator } from './PDFGenerator';
// CSS стили (импортируется автоматически при использовании компонентов)
import './PDFGenerator.css';
import { ActOrderData, ActPlombData } from './types';
import { ACT_PLOMB_CONFIG } from './config';

// ============================================
// ИСПРАВЛЕННЫЕ ФУНКЦИИ КОНВЕРТАЦИИ
// ============================================

/**
 * Исправленная конвертация данных формы акта пломбирования в формат ActPlombData
 */
export function convertFormDataToActPlomb(formData: any): ActPlombData {
    // Очистка и валидация строковых полей
    const cleanString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    };

    // Очистка и валидация массива счетчиков
    const cleanMeters = (meters: any[]): any[] => {
        if (!Array.isArray(meters)) return [];
        
        return meters
            .filter(meter => meter && typeof meter === 'object')
            .map((meter, index) => ({
                meter_number: cleanString(meter.meter_number),
                seal_number: cleanString(meter.seal_number),
                current_reading: meter.current_reading ? cleanString(meter.current_reading) : '',
                meter_type: cleanString(meter.meter_type),
                notes: cleanString(meter.notes),
                sequence_order: index + 1
            }))
            .filter(meter => meter.meter_number || meter.seal_number);
    };

    // Форматирование даты
    const formatDate = (dateValue: any): string => {
        if (!dateValue) return new Date().toISOString().split('T')[0];
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                return new Date().toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.warn('Ошибка форматирования даты:', error);
            return new Date().toISOString().split('T')[0];
        }
    };

    // Формирование полного адреса
    const createFullAddress = (street: string, house: string, apartment: string, existingAddress?: string): string => {
        if (existingAddress && existingAddress.trim()) {
            return existingAddress.trim();
        }
        
        const parts = [
            street ? street : '',
            house ? `д. ${house}` : '',
            apartment ? `кв. ${apartment}` : ''
        ].filter(part => part);
        
        return parts.join(', ') || '';
    };

    // Основная конвертация
    try {
        const street = cleanString(formData.street);
        const house = cleanString(formData.house);
        const apartment = cleanString(formData.apartment);
        
        const result: ActPlombData = {
            id: formData.id ? cleanString(formData.id) : undefined,
            act_number: formData.act_number ? cleanString(formData.act_number) : undefined,
            act_date: formatDate(formData.act_date),
            subscriber_name: cleanString(formData.subscriber_name),
            usd_representative: cleanString(formData.usd_representative),
            street: street,
            house: house,
            apartment: apartment,
            address: createFullAddress(street, house, apartment, formData.address),
            notes: cleanString(formData.notes),
            invoice_id: formData.invoice_id ? cleanString(formData.invoice_id) : undefined,
            recipient_signature: formData.recipient_signature ? cleanString(formData.recipient_signature) : undefined,
            receipt_date: formData.receipt_date ? formatDate(formData.receipt_date) : undefined,
            created_at: formData.created_at ? cleanString(formData.created_at) : undefined,
            updated_at: formData.updated_at ? cleanString(formData.updated_at) : undefined,
            meters: cleanMeters(formData.meters || [])
        };

        console.log('✅ Данные успешно конвертированы для PDF:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Ошибка конвертации данных формы:', error);
        
        // Возвращаем минимальный объект при ошибке
        return {
            act_date: new Date().toISOString().split('T')[0],
            subscriber_name: cleanString(formData.subscriber_name) || 'Не указано',
            street: cleanString(formData.street) || '',
            house: cleanString(formData.house) || '',
            apartment: cleanString(formData.apartment) || '',
            usd_representative: cleanString(formData.usd_representative) || 'Не указано',
            meters: []
        };
    }
}

// ============================================
// ИСПРАВЛЕННЫЕ ХЕЛПЕРЫ ДЛЯ БЫСТРОГО ИСПОЛЬЗОВАНИЯ
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
 * ИСПРАВЛЕННАЯ быстрая генерация АКТА ПЛОМБИРОВАНИЯ
 */
export async function generateActPlombPDF(data: ActPlombData, filename?: string): Promise<Blob> {
    const generator = new PDFGenerator(ACT_PLOMB_CONFIG);
    
    try {
        console.log('🔄 Начинаем генерацию PDF для акта пломбирования...');
        
        await generator.initialize();
        await generator.generateActPlomb(data);
        
        if (filename) {
            generator.savePDF(filename);
            console.log(`✅ PDF сохранен как: ${filename}`);
        }
        
        const blob = generator.getBlob();
        console.log('✅ PDF blob создан, размер:', blob.size, 'байт');
        
        return blob;
        
    } catch (error: any) {
        console.error('❌ Ошибка генерации PDF акта пломбирования:', error);
        throw new Error(`Не удалось создать PDF: ${error.message}`);
    } finally {
        generator.dispose();
    }
}

/**
 * ИСПРАВЛЕННЫЙ быстрый предпросмотр АКТА ПЛОМБИРОВАНИЯ
 */
export async function previewActPlombPDF(data: ActPlombData): Promise<string> {
    const generator = new PDFGenerator(ACT_PLOMB_CONFIG);
    
    try {
        console.log('🔄 Создаем предпросмотр PDF для акта пломбирования...');
        
        await generator.initialize();
        await generator.generateActPlomb(data);
        
        const url = generator.getPreviewUrl();
        console.log('✅ URL предпросмотра создан');
        
        return url;
        
    } catch (error: any) {
        console.error('❌ Ошибка создания предпросмотра PDF:', error);
        throw new Error(`Не удалось создать предпросмотр: ${error.message}`);
    }
    // Не вызываем dispose() для предпросмотра, так как URL должен остаться активным
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
            subscriber: formData.subscriber || ''
        },
        execution: {
            datetime: formData.executionDatetime || '',
            equipment_description: formData.equipmentDescription || '',
            apartment: formData.apartment || '',
            house: formData.house || '',
            street: formData.street || ''
        },
        reconnection: {
            representative: formData.representative || '',
            subscriber: formData.subscriber || '',
            apartment: formData.apartment || '',
            house: formData.house || '',
            street: formData.street || '',
            connection_date: formData.connectionDate || ''
        },
        signatures: {
            representative: formData.representative || '',
            subscriber: formData.subscriber || ''
        }
    };
}

/**
 * ИСПРАВЛЕННАЯ валидация данных акта пломбирования
 */
export function validateActPlombData(data: ActPlombData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.act_date) {
        errors.push('Дата акта обязательна');
    }

    if (!data.subscriber_name?.trim()) {
        errors.push('ФИО абонента обязательно');
    }

    if (!data.street?.trim()) {
        errors.push('Улица обязательна');
    }

    if (!data.house?.trim()) {
        errors.push('Номер дома обязателен');
    }

    if (!data.apartment?.trim()) {
        errors.push('Номер квартиры обязателен');
    }

    if (!data.usd_representative?.trim()) {
        errors.push('ФИО представителя УСД обязательно');
    }

    // Проверяем счетчики только если они есть
    if (data.meters && data.meters.length > 0) {
        data.meters.forEach((meter, index) => {
            if (!meter.meter_number?.trim()) {
                errors.push(`Номер счетчика #${index + 1} обязателен`);
            }
            if (!meter.seal_number?.trim()) {
                errors.push(`Номер пломбы #${index + 1} обязателен`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * ИСПРАВЛЕННАЯ генерация автоматического имени файла для акта пломбирования
 */
export function generateActPlombFilename(data: ActPlombData): string {
    try {
        const actNumber = data.act_number || 'новый';
        const cleanActNumber = actNumber.replace(/[^a-zA-Z0-9\-]/g, '_');
        
        const date = data.act_date ? new Date(data.act_date).toLocaleDateString('ru-RU').replace(/\./g, '-') : 'без_даты';
        
        const subscriberName = data.subscriber_name ? 
            data.subscriber_name.split(' ')[0].replace(/[^a-zA-Zа-яА-Я0-9]/g, '') : 
            'абонент';
            
        return `Акт_пломбирования_${cleanActNumber}_${subscriberName}_${date}.pdf`;
    } catch (error) {
        console.warn('⚠️ Ошибка генерации имени файла:', error);
        return `Акт_пломбирования_${new Date().toISOString().split('T')[0]}.pdf`;
    }
}

/**
 * Создает тестовые данные для отладки
 */
export function createTestActPlombData(): ActPlombData {
    return {
        act_number: 'АП-2025-0001',
        act_date: '2025-08-07',
        subscriber_name: 'Михеева Любовь Николаевна',
        street: 'село Пригородный, ул. Молодежная',
        house: '18/1',
        apartment: '1',
        address: 'Якутск: село Пригородный, ул. Молодежная, д. 18/1',
        usd_representative: 'Иванов И.И.',
        notes: 'Плановое пломбирование после установки',
        meters: [
            {
                meter_number: 'G4-123456',
                seal_number: 'ПЛ-2025-001',
                current_reading: '22',
                meter_type: 'G4',
                notes: 'Рабочее состояние',
                sequence_order: 1
            }
        ]
    };
}