// ============================================
// ИСПРАВЛЕННЫЙ БАЗОВЫЙ ШАБЛОН ДЛЯ PDF ДОКУМЕНТОВ
// ============================================

import jsPDF from 'jspdf';
import { PDFConfig, FieldPosition, SignatureData, TextOptions } from '../types';
import { FontLoader } from '../utils/fontLoader';

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
     * Добавляет текст с опциями (безопасно)
     */
    protected addText(text: string, x?: number, y?: number, options?: TextOptions): number {
        try {
            if (y !== undefined) {
                this.currentY = y;
            }

            const xPos = x || this.config.margins.left;

            // Устанавливаем параметры шрифта безопасно
            if (options?.fontSize) {
                this.doc.setFontSize(options.fontSize);
            }
            
            if (options?.fontStyle) {
                FontLoader.setFontSafe(this.doc, this.config.fonts.regular.family, options.fontStyle);
            }

            if (options?.color) {
                this.doc.setTextColor(options.color);
            }

            // Проверяем и очищаем текст
            const safeText = this.sanitizeText(text);

            // Обработка многострочного текста
            if (options?.maxWidth) {
                const lines = this.doc.splitTextToSize(safeText, options.maxWidth);
                
                lines.forEach((line: string, index: number) => {
                    const lineY = this.currentY + (index * this.config.elements.lineHeight);
                    
                    if (options?.align === 'center') {
                        const centerX = this.getCenterX(line);
                        FontLoader.addTextSafe(this.doc, line, centerX, lineY);
                    } else if (options?.align === 'right') {
                        const rightX = this.pageWidth - this.config.margins.right;
                        FontLoader.addTextSafe(this.doc, line, rightX, lineY);
                    } else {
                        FontLoader.addTextSafe(this.doc, line, xPos, lineY);
                    }
                });
                
                this.currentY += lines.length * this.config.elements.lineHeight;
            } else {
                if (options?.align === 'center') {
                    const centerX = this.getCenterX(safeText);
                    FontLoader.addTextSafe(this.doc, safeText, centerX, this.currentY);
                } else if (options?.align === 'right') {
                    const rightX = this.pageWidth - this.config.margins.right;
                    FontLoader.addTextSafe(this.doc, safeText, rightX, this.currentY);
                } else {
                    FontLoader.addTextSafe(this.doc, safeText, xPos, this.currentY);
                }
                
                this.currentY += this.config.elements.lineHeight;
            }

            return this.currentY;
        } catch (error) {
            console.error('Ошибка добавления текста:', error);
            this.currentY += this.config.elements.lineHeight;
            return this.currentY;
        }
    }

    /**
     * Добавляет простое поле ввода с подчеркиванием
     */
    protected addInputField(x: number, y: number, width: number, value?: string, label?: string): void {
        try {
            // Добавляем подчеркивание
            const underlineY = y + 3;
            this.doc.setLineWidth(0.5);
            this.doc.line(x, underlineY, x + width, underlineY);

            // Добавляем значение если есть
            if (value) {
                this.doc.setFontSize(this.config.fonts.regular.size);
                FontLoader.addTextSafe(this.doc, this.sanitizeText(value), x + 2, y);
            }

            // Добавляем подпись под полем если есть
            if (label) {
                this.doc.setFontSize(8);
                this.doc.setTextColor('#666666');
                FontLoader.addTextSafe(this.doc, label, x + width / 2, y + 8);
                this.doc.setTextColor('#000000');
                this.doc.setFontSize(this.config.fonts.regular.size);
            }
        } catch (error) {
            console.error('Ошибка добавления поля ввода:', error);
        }
    }

    /**
     * Добавляет поле с рамкой (упрощенное)
     */
    protected addTextArea(x: number, y: number, width: number, height: number, value?: string): void {
        try {
            // Рисуем рамку
            this.doc.setLineWidth(0.5);
            this.doc.rect(x, y, width, height, 'S');

            // Добавляем текст если есть
            if (value) {
                const safeValue = this.sanitizeText(value);
                const lines = this.doc.splitTextToSize(safeValue, width - 4);
                let textY = y + this.config.elements.lineHeight;
                
                lines.forEach((line: string) => {
                    if (textY < y + height - 2) {
                        FontLoader.addTextSafe(this.doc, line, x + 2, textY);
                        textY += this.config.elements.lineHeight;
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка добавления текстовой области:', error);
        }
    }

    /**
     * Добавляет линию
     */
    protected addLine(x1: number, y1: number, x2: number, y2: number, color?: string): void {
        try {
            if (color) {
                this.doc.setDrawColor(color);
            }
            this.doc.setLineWidth(0.5);
            this.doc.line(x1, y1, x2, y2);
            if (color) {
                this.doc.setDrawColor('#000000'); // Возвращаем черный цвет
            }
        } catch (error) {
            console.error('Ошибка добавления линии:', error);
        }
    }

    /**
     * Добавляет секцию подписей (упрощенная)
     */
    protected addSignatureSection(signatures: SignatureData[], startY?: number): number {
        try {
            if (startY) {
                this.currentY = startY;
            }

            this.currentY += this.config.elements.sectionSpacing;

            signatures.forEach((signature, index) => {
                // Линия для подписи
                const signatureY = this.currentY;
                const lineLength = 60;
                const startX = this.config.margins.left + (index * 100);
                
                this.doc.line(startX, signatureY, startX + lineLength, signatureY);

                // Подпись под линией
                this.doc.setFontSize(10);
                const signatureText = `${signature.position || ''} ${signature.name || ''}`.trim();
                FontLoader.addTextSafe(this.doc, signatureText, startX, signatureY + 8);

                if (index === signatures.length - 1) {
                    this.currentY += 15;
                }
            });

            this.doc.setFontSize(this.config.fonts.regular.size);
            return this.currentY;
        } catch (error) {
            console.error('Ошибка добавления подписей:', error);
            this.currentY += 20;
            return this.currentY;
        }
    }

    /**
     * Проверяет необходимость перехода на новую страницу
     */
    protected checkPageBreak(requiredHeight: number): boolean {
        const spaceLeft = this.pageHeight - this.config.margins.bottom - this.currentY;
        if (spaceLeft < requiredHeight) {
            this.addNewPage();
            return true;
        }
        return false;
    }

    /**
     * Добавляет новую страницу
     */
    protected addNewPage(): void {
        try {
            this.doc.addPage();
            this.currentY = this.config.margins.top;
        } catch (error) {
            console.error('Ошибка добавления новой страницы:', error);
        }
    }

    /**
     * Добавляет отступ
     */
    protected addSpacing(spacing?: number): void {
        this.currentY += spacing || this.config.elements.sectionSpacing;
    }

    // ============================================
    // УТИЛИТЫ И HELPERS
    // ============================================

    /**
     * Очищает и проверяет текст
     */
    protected sanitizeText(text: string): string {
        if (!text) return '';
        
        try {
            // Удаляем или заменяем проблемные символы
            return String(text)
                .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Удаляем контрольные символы
                .trim();
        } catch (error) {
            console.warn('Ошибка очистки текста:', error);
            return String(text || '').substring(0, 100);
        }
    }

    /**
     * Получает позицию для центрирования текста
     */
    protected getCenterX(text: string): number {
        try {
            const textWidth = this.doc.getTextWidth(text);
            return this.config.margins.left + (this.contentWidth - textWidth) / 2;
        } catch (error) {
            return this.config.margins.left + this.contentWidth / 2;
        }
    }

    /**
     * Сбрасывает стили текста на стандартные
     */
    protected resetTextStyle(): void {
        try {
            FontLoader.setFontSafe(this.doc, this.config.fonts.regular.family, 'normal', this.config.fonts.regular.size);
            this.doc.setTextColor('#000000');
        } catch (error) {
            console.warn('Ошибка сброса стилей:', error);
        }
    }

    /**
     * Устанавливает стиль заголовка
     */
    protected setTitleStyle(): void {
        try {
            FontLoader.setFontSafe(this.doc, this.config.fonts.title.family, this.config.fonts.title.style, this.config.fonts.title.size);
        } catch (error) {
            console.warn('Ошибка установки стиля заголовка:', error);
        }
    }

    /**
     * Устанавливает жирный стиль
     */
    protected setBoldStyle(): void {
        try {
            FontLoader.setFontSafe(this.doc, this.config.fonts.bold.family, this.config.fonts.bold.style, this.config.fonts.bold.size);
        } catch (error) {
            console.warn('Ошибка установки жирного стиля:', error);
        }
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
        this.currentY = Math.max(y, this.config.margins.top);
    }

    /**
     * Получает информацию о странице
     */
    protected getPageInfo(): {
        width: number;
        height: number;
        contentWidth: number;
        contentHeight: number;
        currentY: number;
        spaceLeft: number;
    } {
        return {
            width: this.pageWidth,
            height: this.pageHeight,
            contentWidth: this.contentWidth,
            contentHeight: this.pageHeight - this.config.margins.top - this.config.margins.bottom,
            currentY: this.currentY,
            spaceLeft: this.pageHeight - this.config.margins.bottom - this.currentY
        };
    }
}