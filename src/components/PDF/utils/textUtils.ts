// ============================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ТЕКСТОМ В PDF
// ============================================

import jsPDF from 'jspdf';

export class TextUtils {
    /**
     * Переносит текст по строкам с учетом максимальной ширины
     */
    public static wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
        if (!text) return [''];
        
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = doc.getTextWidth(testLine);

            if (width <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Если одно слово больше максимальной ширины
                    lines.push(word);
                }
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.length > 0 ? lines : [''];
    }

    /**
     * Измеряет ширину текста в текущем шрифте
     */
    public static measureText(doc: jsPDF, text: string): number {
        return doc.getTextWidth(text);
    }

    /**
     * Вычисляет позицию для центрирования текста
     */
    public static centerText(doc: jsPDF, text: string, pageWidth: number, leftMargin: number = 0): number {
        const textWidth = doc.getTextWidth(text);
        return leftMargin + (pageWidth - leftMargin * 2 - textWidth) / 2;
    }

    /**
     * Форматирует дату в российском формате
     */
    public static formatDate(date: string): string {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = this.getMonthName(dateObj.getMonth());
            const year = dateObj.getFullYear();
            
            return `${day} ${month} ${year}`;
        } catch {
            return date;
        }
    }

    /**
     * Получает название месяца на русском языке
     */
    private static getMonthName(monthIndex: number): string {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return months[monthIndex] || '';
    }

    /**
     * Форматирует время в формате ЧЧ:ММ
     */
    public static formatTime(time: string): { hours: string; minutes: string } {
        if (!time) return { hours: '', minutes: '' };
        
        const parts = time.split(':');
        return {
            hours: parts[0] || '',
            minutes: parts[1] || ''
        };
    }

    /**
     * Очищает и нормализует текст
     */
    public static normalizeText(text: string): string {
        if (!text) return '';
        
        return text
            .trim()
            .replace(/\s+/g, ' ')  // Убираем лишние пробелы
            .replace(/\n+/g, '\n'); // Убираем лишние переносы строк
    }

    /**
     * Разбивает длинный текст на части для полей
     */
    public static splitTextForFields(text: string, maxLength: number): string[] {
        if (!text || text.length <= maxLength) {
            return [text || ''];
        }

        const parts: string[] = [];
        let remaining = text;

        while (remaining.length > maxLength) {
            let splitIndex = maxLength;
            
            // Ищем ближайший пробел для разрыва
            const spaceIndex = remaining.lastIndexOf(' ', maxLength);
            if (spaceIndex > maxLength * 0.7) {
                splitIndex = spaceIndex;
            }

            parts.push(remaining.substring(0, splitIndex).trim());
            remaining = remaining.substring(splitIndex).trim();
        }

        if (remaining) {
            parts.push(remaining);
        }

        return parts;
    }

    /**
     * Вычисляет оптимальный размер шрифта для текста
     */
    public static getOptimalFontSize(doc: jsPDF, text: string, maxWidth: number, minSize: number = 8, maxSize: number = 14): number {
        if (!text) return maxSize;

        let fontSize = maxSize;
        
        while (fontSize >= minSize) {
            doc.setFontSize(fontSize);
            const width = doc.getTextWidth(text);
            
            if (width <= maxWidth) {
                return fontSize;
            }
            
            fontSize -= 0.5;
        }

        return minSize;
    }

    /**
     * Добавляет многострочный текст с автоматическим переносом
     */
    public static addMultilineText(
        doc: jsPDF, 
        text: string, 
        x: number, 
        y: number, 
        maxWidth: number, 
        lineHeight: number = 6
    ): number {
        const lines = this.wrapText(doc, text, maxWidth);
        let currentY = y;

        lines.forEach(line => {
            doc.text(line, x, currentY);
            currentY += lineHeight;
        });

        return currentY;
    }

    /**
     * Экранирует специальные символы для PDF
     */
    public static escapeText(text: string): string {
        if (!text) return '';
        
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }
}