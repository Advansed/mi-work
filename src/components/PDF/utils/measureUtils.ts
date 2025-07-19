// ============================================
// УТИЛИТЫ ДЛЯ ИЗМЕРЕНИЙ И ПОЗИЦИОНИРОВАНИЯ
// ============================================

import jsPDF from 'jspdf';
import { FieldPosition } from '../types';

export class MeasureUtils {
    /**
     * Конвертирует миллиметры в пункты (points)
     */
    public static mmToPt(mm: number): number {
        return mm * 2.834645669;
    }

    /**
     * Конвертирует пункты в миллиметры
     */
    public static ptToMm(pt: number): number {
        return pt / 2.834645669;
    }

    /**
     * Вычисляет ширину поля для заданного текста
     */
    public static calculateFieldWidth(doc: jsPDF, text: string, padding: number = 4): number {
        if (!text) return 20; // Минимальная ширина для пустого поля
        
        const textWidth = doc.getTextWidth(text);
        return Math.max(textWidth + padding, 20);
    }

    /**
     * Вычисляет позицию поля после текста
     */
    public static calculateFieldPosition(
        doc: jsPDF, 
        startX: number, 
        precedingText: string, 
        fieldWidth: number,
        spacing: number = 2
    ): FieldPosition {
        const textWidth = precedingText ? doc.getTextWidth(precedingText) : 0;
        
        return {
            x: startX + textWidth + spacing,
            y: 0, // Будет установлено при использовании
            width: fieldWidth
        };
    }

    /**
     * Проверяет, помещается ли элемент на текущей странице
     */
    public static checkPageSpace(currentY: number, requiredHeight: number, pageHeight: number, bottomMargin: number): boolean {
        return (currentY + requiredHeight) <= (pageHeight - bottomMargin);
    }

    /**
     * Вычисляет высоту многострочного текста
     */
    public static calculateTextHeight(lines: number, lineHeight: number, padding: number = 0): number {
        return (lines * lineHeight) + padding;
    }

    /**
     * Создает сетку для размещения элементов
     */
    public static createGrid(
        pageWidth: number, 
        pageHeight: number, 
        margins: { top: number; right: number; bottom: number; left: number },
        columns: number = 1
    ): {
        contentWidth: number;
        contentHeight: number;
        columnWidth: number;
        startX: number;
        startY: number;
    } {
        const contentWidth = pageWidth - margins.left - margins.right;
        const contentHeight = pageHeight - margins.top - margins.bottom;
        const columnWidth = contentWidth / columns;
        
        return {
            contentWidth,
            contentHeight,
            columnWidth,
            startX: margins.left,
            startY: margins.top
        };
    }

    /**
     * Выравнивает элементы по базовой линии
     */
    public static alignToBaseline(fontSize: number): number {
        // Приблизительная базовая линия для шрифта
        return fontSize * 0.8;
    }

    /**
     * Вычисляет оптимальную позицию для подчеркивания
     */
    public static getUnderlinePosition(y: number, fontSize: number): number {
        return y + fontSize * 0.2;
    }

    /**
     * Создает равномерно распределенные позиции
     */
    public static distributePositions(
        startX: number, 
        endX: number, 
        count: number
    ): number[] {
        if (count <= 1) return [startX];
        
        const spacing = (endX - startX) / (count - 1);
        const positions: number[] = [];
        
        for (let i = 0; i < count; i++) {
            positions.push(startX + (spacing * i));
        }
        
        return positions;
    }

    /**
     * Вычисляет размеры для пропорционального масштабирования
     */
    public static scaleProportionally(
        originalWidth: number, 
        originalHeight: number, 
        maxWidth: number, 
        maxHeight: number
    ): { width: number; height: number } {
        const widthRatio = maxWidth / originalWidth;
        const heightRatio = maxHeight / originalHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        
        return {
            width: originalWidth * ratio,
            height: originalHeight * ratio
        };
    }

    /**
     * Создает отступы вокруг элемента
     */
    public static addPadding(
        position: FieldPosition, 
        padding: number | { top: number; right: number; bottom: number; left: number }
    ): FieldPosition {
        if (typeof padding === 'number') {
            return {
                x: position.x + padding,
                y: position.y + padding,
                width: position.width - (padding * 2),
                height: position.height ? position.height - (padding * 2) : undefined
            };
        }
        
        return {
            x: position.x + padding.left,
            y: position.y + padding.top,
            width: position.width - padding.left - padding.right,
            height: position.height ? position.height - padding.top - padding.bottom : undefined
        };
    }

    /**
     * Проверяет пересечение двух областей
     */
    public static checkOverlap(area1: FieldPosition, area2: FieldPosition): boolean {
        const area1Right = area1.x + area1.width;
        const area1Bottom = area1.y + (area1.height || 0);
        const area2Right = area2.x + area2.width;
        const area2Bottom = area2.y + (area2.height || 0);
        
        return !(area1Right < area2.x || 
                area2Right < area1.x || 
                area1Bottom < area2.y || 
                area2Bottom < area1.y);
    }

    /**
     * Вычисляет центральную позицию для элемента
     */
    public static centerElement(
        elementWidth: number, 
        elementHeight: number, 
        containerWidth: number, 
        containerHeight: number,
        containerX: number = 0,
        containerY: number = 0
    ): FieldPosition {
        return {
            x: containerX + (containerWidth - elementWidth) / 2,
            y: containerY + (containerHeight - elementHeight) / 2,
            width: elementWidth,
            height: elementHeight
        };
    }
}