// ============================================
// ИСПРАВЛЕННЫЙ ШАБЛОН ДЛЯ АКТА ПЛОМБИРОВАНИЯ
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig } from '../types';
import { FontLoader } from '../utils/fontLoader';
import { TextUtils } from '../utils/textUtils';

// ============================================
// ТИПЫ ДАННЫХ (исправленные)
// ============================================

export interface PlombMeterData {
    meter_number: string;
    seal_number: string;
    current_reading?: string | number;
    meter_type?: string;
    notes?: string;
    sequence_order?: number;
}

export interface ActPlombData {
    id?: string;
    act_number?: string;
    act_date: string;
    subscriber_name: string;
    address?: string;
    street: string;
    house: string;
    apartment: string;
    usd_representative: string;
    notes?: string;
    invoice_id?: string;
    meters: PlombMeterData[];
    recipient_signature?: string;
    receipt_date?: string;
    created_at?: string;
    updated_at?: string;
}

// ============================================
// УТИЛИТЫ ДЛЯ БЕЗОПАСНОГО ТЕКСТА
// ============================================

class SafeTextUtils {
    /**
     * Очищает и проверяет текст для PDF
     */
    static cleanText(text: string | undefined | null): string {
        if (!text) return '';
        return String(text)
            .replace(/[^\u0000-\u007F\u0400-\u04FF\u0500-\u052F]/g, '') // Оставляем латиницу и кириллицу
            .trim();
    }

    /**
     * Создает подчеркивания для пустых полей
     */
    static createUnderline(length: number = 20): string {
        return '_'.repeat(length);
    }

    /**
     * Форматирует поле с подчеркиваниями
     */
    static formatField(value: string | undefined | null, underlineLength: number = 20): string {
        const cleaned = this.cleanText(value);
        return cleaned || this.createUnderline(underlineLength);
    }
}

// ============================================
// КЛАСС ШАБЛОНА АКТА ПЛОМБИРОВАНИЯ
// ============================================

export class ActPlombTemplate {
    private doc: jsPDF;
    private config: PDFConfig;
    private currentY: number = 0;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number = 20;

    constructor(doc: jsPDF, config: PDFConfig) {
        this.doc = doc;
        this.config = config;
        this.pageWidth = doc.internal.pageSize.getWidth();
        this.pageHeight = doc.internal.pageSize.getHeight();
    }

    // ============================================
    // ОСНОВНОЙ МЕТОД РЕНДЕРИНГА
    // ============================================

    public renderDocument(data: ActPlombData): void {
        try {
            console.log('🔄 Начинаем рендеринг акта пломбирования с данными:', data);
            
            // Инициализация
            this.currentY = this.margin;
            
            // Устанавливаем кодировку для кириллицы
            this.setupCyrillicSupport();
            
            // Основные блоки документа
            this.renderHeader();
            this.renderCompanyDetails();
            this.renderDocumentTitle(data);
            this.renderMainContent(data);
            this.renderMetersSection(data);
            this.renderSignatures(data);
            
            console.log('✅ Акт пломбирования отрендерен успешно');
        } catch (error) {
            console.error('❌ Ошибка рендеринга акта пломбирования:', error);
            throw error;
        }
    }

    // ============================================
    // НАСТРОЙКА КИРИЛЛИЦЫ
    // ============================================

    private setupCyrillicSupport(): void {
        try {
            // Устанавливаем базовый шрифт Times с поддержкой кириллицы
            this.doc.setFont('times', 'normal');
            this.doc.setFontSize(12);
            this.doc.setTextColor(0, 0, 0);
            
            console.log('✅ Кириллица настроена');
        } catch (error) {
            console.warn('⚠️ Проблема с настройкой кириллицы:', error);
        }
    }

    // ============================================
    // БЕЗОПАСНОЕ ДОБАВЛЕНИЕ ТЕКСТА
    // ============================================

    private addSafeText(text: string, x: number, y: number): void {
        try {
            const safeText = SafeTextUtils.cleanText(text);
            this.doc.text(safeText, x, y);
        } catch (error) {
            console.warn('⚠️ Ошибка добавления текста:', error, 'Текст:', text);
            // Fallback - добавляем пустую строку или подчеркивания
            this.doc.text(SafeTextUtils.createUnderline(10), x, y);
        }
    }

    // ============================================
    // ЗАГОЛОВОК С ЛОГОТИПОМ
    // ============================================

    private renderHeader(): void {
        try {
            // Логотип УСД (левый верхний угол)
            this.doc.setFont('times', 'bold');
            this.doc.setFontSize(10);
            this.doc.setTextColor(0, 100, 150);
            this.addSafeText('САХАТРАНСНЕФТЕГАЗ', this.margin, this.currentY + 8);
            this.addSafeText('УСД', this.margin + 5, this.currentY + 16);
            
            // QR код placeholder (правый верхний угол)
            this.doc.setTextColor(0, 0, 0);
            this.doc.rect(this.pageWidth - 35, this.currentY, 15, 15);
            this.doc.setFontSize(8);
            this.addSafeText('QR', this.pageWidth - 30, this.currentY + 8);
            
            // Разделительная линия
            this.currentY += 25;
            this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
            this.currentY += 5;
            
        } catch (error) {
            console.warn('⚠️ Ошибка рендеринга заголовка:', error);
        }
    }

    // ============================================
    // РЕКВИЗИТЫ ОРГАНИЗАЦИИ
    // ============================================

    private renderCompanyDetails(): void {
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);
        
        const details = [
            'Структурное подразделение Управление по сбытовой деятельности «Сахатранснефтегаз»',
            'ИНН 1435142972, КПП 140045003, ОГРН 1031402073097',
            'Адрес пункта приема платежей: г.Якутск, ул. П.Алексеева, 64Б, тел/факс: 46-00-93, 46-00-41',
            'Время работы: будни с 8:00 до 17:00, обед с 12:00 до 13:00; суббота, воскресенье - выходной'
        ];

        details.forEach(detail => {
            this.addSafeText(detail, this.margin, this.currentY);
            this.currentY += 4.5;
        });

        this.currentY += 10;
    }

    // ============================================
    // ЗАГОЛОВОК ДОКУМЕНТА
    // ============================================

    private renderDocumentTitle(data: ActPlombData): void {
        // Основной заголовок
        this.doc.setFont('times', 'bold');
        this.doc.setFontSize(14);
        const title = 'АКТ ПЛОМБИРОВАНИЯ ПРИБОРА УЧЕТА ГАЗА';
        const titleWidth = this.doc.getTextWidth(title);
        const titleX = (this.pageWidth - titleWidth) / 2;
        this.addSafeText(title, titleX, this.currentY);
        
        this.currentY += 15;

        // Дата документа
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(12);
        const dateText = this.formatDate(data.act_date);
        const dateWidth = this.doc.getTextWidth(dateText);
        const dateX = this.pageWidth - this.margin - dateWidth;
        this.addSafeText(dateText, dateX, this.currentY);
        
        this.currentY += 20;
    }

    private formatDate(dateString: string): string {
        try {
            if (!dateString) return 'от «___»_______________202__г.';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'от «___»_______________202__г.';
            
            const months = [
                'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
            ];
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear().toString().slice(-2);
            
            return `от «${day}» ${month} 20${year}г.`;
        } catch (error) {
            console.warn('⚠️ Ошибка форматирования даты:', error);
            return 'от «___»_______________202__г.';
        }
    }

    // ============================================
    // ОСНОВНОЕ СОДЕРЖИМОЕ
    // ============================================

    private renderMainContent(data: ActPlombData): void {
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(12);

        // ФИО абонента
        this.renderTextLine('Дан(а) ФИО:', SafeTextUtils.formatField(data.subscriber_name, 50));
        
        // Адрес
        const fullAddress = data.address || `${data.street || ''}, ${data.house || ''}, кв. ${data.apartment || ''}`.trim();
        this.renderTextLine('По адресу', SafeTextUtils.formatField(fullAddress, 60));
        
        this.currentY += 10;
        
        // Заголовок секции приборов
        this.addSafeText('Прибор учета расхода газа опломбирован:', this.margin, this.currentY);
        this.currentY += 15;
    }

    private renderTextLine(prefix: string, value: string): void {
        const fullLine = `${prefix} ${value}`;
        this.addSafeText(fullLine, this.margin, this.currentY);
        this.currentY += 10;
    }

    // ============================================
    // СЕКЦИЯ ПРИБОРОВ УЧЕТА
    // ============================================

    private renderMetersSection(data: ActPlombData): void {
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(12);

        // Обеспечиваем минимум 3 строки для счетчиков
        const metersToRender = Math.max(3, data.meters?.length || 0);
        
        for (let i = 0; i < metersToRender; i++) {
            const meter = data.meters?.[i];
            if (meter) {
                this.renderMeter(meter, i + 1);
            } else {
                this.renderEmptyMeter(i + 1);
            }
        }
    }

    private renderMeter(meter: PlombMeterData, index: number): void {
        const meterNumber = SafeTextUtils.formatField(meter.meter_number, 15);
        const sealNumber = SafeTextUtils.formatField(meter.seal_number, 20);
        const notes = SafeTextUtils.formatField(meter.notes, 25);
        const reading = SafeTextUtils.formatField(String(meter.current_reading || ''), 15);
        
        // Первая строка счетчика
        const line1 = `${index}.G- № сч ${meterNumber} пломба №${sealNumber} примечания ${notes}`;
        this.addSafeText(line1, this.margin, this.currentY);
        this.currentY += 8;
        
        // Вторая строка - показания
        const line2 = `   текущие показания прибора учета газа: ${reading}м³`;
        this.addSafeText(line2, this.margin, this.currentY);
        this.currentY += 13;
    }

    private renderEmptyMeter(index: number): void {
        const line1 = `${index}.G- № сч________________ пломба №_____________________ примечания ____________________`;
        this.addSafeText(line1, this.margin, this.currentY);
        this.currentY += 8;
        
        const line2 = '   текущие показания прибора учета газа: ________________м³';
        this.addSafeText(line2, this.margin, this.currentY);
        this.currentY += 13;
    }

    // ============================================
    // ПОДПИСИ
    // ============================================

    private renderSignatures(data: ActPlombData): void {
        this.currentY += 20;
        
        this.doc.setFont('times', 'normal');
        this.doc.setFontSize(12);

        // Подпись представителя УСД
        const usdRep = SafeTextUtils.formatField(data.usd_representative, 30);
        this.addSafeText(`УСД АО «Сахатранснефтегаз» ____________________/${usdRep}/`, this.margin, this.currentY);
        
        this.currentY += 15;
        
        // Подпись получателя
        this.addSafeText('АКТ ПОЛУЧИЛ(А): ____________________/_______________________________/', this.margin, this.currentY);
        
        this.currentY += 15;
        
        // Дата получения
        const receiptDate = data.receipt_date ? this.formatReceiptDate(data.receipt_date) : '_____________';
        this.addSafeText(`Дата ${receiptDate}`, this.pageWidth - this.margin - 80, this.currentY);
    }

    private formatReceiptDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '_____________';
            return date.toLocaleDateString('ru-RU');
        } catch (error) {
            return '_____________';
        }
    }
}