// ============================================
// БАЗОВЫЙ ШАБЛОН ДЛЯ PDF ДОКУМЕНТОВ
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig, FieldPosition, SignatureData, TextOptions } from '../types';
import { TextUtils } from '../utils/textUtils';
import { MeasureUtils } from '../utils/measureUtils';
import { FIELD_SETTINGS, SIGNATURE_SETTINGS } from '../config';

export abstract class BaseTemplate {
    protected doc: jsPDF;
    protected config: PDFConfig;
    protected currentY: number;
    protected pageWidth: number;
    protected pageHeight: number;
    protected contentWidth: number;

    constructor(doc: jsPDF, config: PDFConfig) {
        this.doc = doc;
        this.config = config;
        this.currentY = config.margins.top;
        
        // Получаем размеры страницы
        const pageSize = this.doc.internal.pageSize;
        this.pageWidth = pageSize.getWidth();
        this.pageHeight = pageSize.getHeight();
        this.contentWidth = this.pageWidth - config.margins.left - config.margins.right;
    }

    // ============================================
    // АБСТРАКТНЫЕ МЕТОДЫ
    // ============================================

    abstract renderDocument(data: any): void;

    // ============================================
    // БАЗОВЫЕ МЕТОДЫ РЕНДЕРИНГА
    // ============================================

    /**
     * Добавляет текст с опциями
     */
    protected addText(text: string, x: number, y?: number, options?: TextOptions): number {
        if (y !== undefined) {
            this.currentY = y;
        }

        // Устанавливаем параметры шрифта
        if (options?.fontSize) {
            this.doc.setFontSize(options.fontSize);
        }
        
        if (options?.fontStyle) {
            this.doc.setFont(this.config.fonts.regular.family, options.fontStyle);
        }

        if (options?.color) {
            this.doc.setTextColor(options.color);
        }

        // Обработка многострочного текста
        if (options?.maxWidth) {
            const lines = TextUtils.wrapText(this.doc, text, options.maxWidth);
            lines.forEach((line, index) => {
                const lineY = this.currentY + (index * this.config.elements.lineHeight);
                
                if (options?.align === 'center') {
                    const centerX = TextUtils.centerText(this.doc, line, this.pageWidth, this.config.margins.left);
                    this.doc.text(line, centerX, lineY);
                } else if (options?.align === 'right') {
                    this.doc.text(line, x, lineY, { align: 'right' });
                } else {
                    this.doc.text(line, x, lineY);
                }
            });
            
            this.currentY += lines.length * this.config.elements.lineHeight;
        } else {
            if (options?.align === 'center') {
                const centerX = TextUtils.centerText(this.doc, text, this.pageWidth, this.config.margins.left);
                this.doc.text(text, centerX, this.currentY);
            } else if (options?.align === 'right') {
                this.doc.text(text, x, this.currentY, { align: 'right' });
            } else {
                this.doc.text(text, x, this.currentY);
            }
            
            this.currentY += this.config.elements.lineHeight;
        }

        return this.currentY;
    }

    /**
     * Добавляет поле ввода с подчеркиванием
     */
    protected addInputField(x: number, y: number, width: number, value?: string, label?: string): void {
        // Добавляем подчеркивание
        const underlineY = y + FIELD_SETTINGS.fieldPadding;
        this.doc.line(x, underlineY, x + width, underlineY);

        // Добавляем значение если есть
        if (value) {
            this.doc.setFontSize(this.config.fonts.regular.size);
            this.doc.text(value, x + 1, y);
        }

        // Добавляем подпись под полем если есть
        if (label) {
            this.doc.setFontSize(8);
            this.doc.setTextColor('#666666');
            this.doc.text(label, x, y + 8, { align: 'center', maxWidth: width });
            this.doc.setTextColor('#000000');
            this.doc.setFontSize(this.config.fonts.regular.size);
        }
    }

    /**
     * Добавляет поле с рамкой (для больших текстовых областей)
     */
    protected addTextArea(x: number, y: number, width: number, height: number, value?: string): void {
        // Рисуем рамку
        this.doc.rect(x, y, width, height);

        // Добавляем текст если есть
        if (value) {
            const lines = TextUtils.wrapText(this.doc, value, width - 4);
            let textY = y + this.config.elements.lineHeight;
            
            lines.forEach(line => {
                if (textY < y + height - 2) {
                    this.doc.text(line, x + 2, textY);
                    textY += this.config.elements.lineHeight;
                }
            });
        }
    }

    /**
     * Добавляет линию
     */
    protected addLine(x1: number, y1: number, x2: number, y2: number, color?: string): void {
        if (color) {
            this.doc.setDrawColor(color);
        }
        this.doc.line(x1, y1, x2, y2);
        if (color) {
            this.doc.setDrawColor('#000000'); // Возвращаем черный цвет
        }
    }

    /**
     * Добавляет секцию подписей
     */
    protected addSignatureSection(signatures: SignatureData[], startY?: number): number {
        if (startY) {
            this.currentY = startY;
        }

        this.currentY += this.config.elements.sectionSpacing;

        signatures.forEach(signature => {
            // Линия для подписи
            const signatureY = this.currentY;
            this.doc.line(
                this.config.margins.left + 100, 
                signatureY, 
                this.config.margins.left + 100 + SIGNATURE_SETTINGS.lineLength, 
                signatureY
            );

            // Если есть изображение подписи
            if (signature.signature) {
                try {
                    this.doc.addImage(
                        signature.signature, 
                        'PNG', 
                        this.config.margins.left + 100, 
                        signatureY - 10, 
                        30, 
                        10
                    );
                } catch (error) {
                    console.warn('Не удалось добавить изображение подписи:', error);
                }
            }

            // Подпись под линией
            this.doc.setFontSize(10);
            this.doc.text(
                `${signature.position}, ${signature.name}`, 
                this.config.margins.left + 100, 
                signatureY + SIGNATURE_SETTINGS.labelSpacing
            );

            this.currentY += SIGNATURE_SETTINGS.lineSpacing + SIGNATURE_SETTINGS.labelSpacing;
        });

        return this.currentY;
    }

    /**
     * Проверяет необходимость перехода на новую страницу
     */
    protected checkPageBreak(requiredHeight: number): boolean {
        if (!MeasureUtils.checkPageSpace(this.currentY, requiredHeight, this.pageHeight, this.config.margins.bottom)) {
            this.addNewPage();
            return true;
        }
        return false;
    }

    /**
     * Добавляет новую страницу
     */
    protected addNewPage(): void {
        this.doc.addPage();
        this.currentY = this.config.margins.top;
    }

    /**
     * Добавляет отступ
     */
    protected addSpacing(spacing?: number): void {
        this.currentY += spacing || this.config.elements.sectionSpacing;
    }

    /**
     * Сбрасывает стили текста на стандартные
     */
    protected resetTextStyle(): void {
        this.doc.setFont(this.config.fonts.regular.family, 'normal');
        this.doc.setFontSize(this.config.fonts.regular.size);
        this.doc.setTextColor('#000000');
    }

    /**
     * Устанавливает стиль заголовка
     */
    protected setTitleStyle(): void {
        this.doc.setFont(this.config.fonts.title.family, this.config.fonts.title.style);
        this.doc.setFontSize(this.config.fonts.title.size);
    }

    /**
     * Устанавливает жирный стиль
     */
    protected setBoldStyle(): void {
        this.doc.setFont(this.config.fonts.bold.family, this.config.fonts.bold.style);
        this.doc.setFontSize(this.config.fonts.bold.size);
    }

    /**
     * Получает текущую позицию Y
     */
    protected getCurrentY(): number {
        return this.currentY;
    }

    /**
     * Устанавливает позицию Y
     */
    protected setCurrentY(y: number): void {
        this.currentY = y;
    }
}