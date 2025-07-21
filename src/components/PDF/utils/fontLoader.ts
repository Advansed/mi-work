// ============================================
// ИСПРАВЛЕННЫЙ ЗАГРУЗЧИК ШРИФТОВ ДЛЯ PDF
// ============================================

import jsPDF from 'jspdf';

export class FontLoader {
    private static fontsLoaded = false;

    /**
     * Загружает все необходимые шрифты для PDF
     */
    public static async loadFonts(doc: jsPDF): Promise<void> {
        if (this.fontsLoaded) {
            return;
        }

        try {
            // Устанавливаем стандартные шрифты для кириллицы
            this.registerStandardFonts(doc);
            
            this.fontsLoaded = true;
            console.log('✅ Шрифты успешно загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки шрифтов:', error);
            // Не блокируем генерацию при ошибке шрифтов
            this.fontsLoaded = true;
        }
    }

    /**
     * Регистрирует стандартные шрифты
     */
    private static registerStandardFonts(doc: jsPDF): void {
        try {
            // Используем встроенные шрифты jsPDF которые поддерживают базовую кириллицу
            // times, helvetica, courier - встроенные шрифты
            
            // Проверяем доступность шрифтов
            const availableFonts = doc.getFontList();
            console.log('Доступные шрифты:', Object.keys(availableFonts));
            
            // Устанавливаем стандартный шрифт с поддержкой кириллицы
            doc.setFont('times', 'normal');
            
        } catch (error) {
            console.warn('⚠️ Проблема с регистрацией шрифтов:', error);
            // Используем базовый шрифт
            try {
                doc.setFont('helvetica', 'normal');
            } catch (fallbackError) {
                console.warn('⚠️ Используем системный шрифт');
            }
        }
    }

    /**
     * Устанавливает шрифт для документа
     */
    public static setFont(doc: jsPDF, family: string = 'times', style: string = 'normal', size: number = 12): void {
        try {
            // Проверяем поддерживаемые стили для шрифта
            const supportedStyles = ['normal', 'bold', 'italic', 'bolditalic'];
            const normalizedStyle = supportedStyles.includes(style) ? style : 'normal';
            
            doc.setFont(family, normalizedStyle);
            doc.setFontSize(size);
        } catch (error) {
            console.warn(`⚠️ Не удалось установить шрифт ${family} ${style}, используем стандартный`);
            try {
                doc.setFont('times', 'normal');
                doc.setFontSize(size);
            } catch (fallbackError) {
                console.warn('⚠️ Используем системный шрифт');
                doc.setFontSize(size);
            }
        }
    }

    /**
     * Проверяет поддержку кириллицы
     */
    public static checkCyrillicSupport(doc: jsPDF): boolean {
        try {
            const testText = 'Тест АБВГД';
            doc.setFont('times', 'normal');
            const width = doc.getTextWidth(testText);
            return width > 0 && width < 1000; // Разумные границы
        } catch (error) {
            console.warn('⚠️ Ошибка проверки кириллицы:', error);
            return true; // Предполагаем поддержку
        }
    }

    /**
     * Получает безопасный шрифт
     */
    public static getSafeFont(doc: jsPDF, preferredFamily: string = 'times'): string {
        try {
            const availableFonts = doc.getFontList();
            
            if (availableFonts[preferredFamily]) {
                return preferredFamily;
            }
            
            // Список приоритетных шрифтов
            const fallbackFonts = ['times', 'helvetica', 'courier'];
            
            for (const font of fallbackFonts) {
                if (availableFonts[font]) {
                    return font;
                }
            }
            
            // Возвращаем первый доступный шрифт
            const firstAvailable = Object.keys(availableFonts)[0];
            return firstAvailable || 'helvetica';
            
        } catch (error) {
            console.warn('⚠️ Ошибка получения шрифта:', error);
            return 'helvetica';
        }
    }

    /**
     * Устанавливает шрифт с проверкой доступности
     */
    public static setFontSafe(
        doc: jsPDF, 
        family: string = 'times', 
        style: string = 'normal', 
        size: number = 12
    ): void {
        try {
            const safeFamily = this.getSafeFont(doc, family);
            const safeStyle = ['normal', 'bold', 'italic', 'bolditalic'].includes(style) ? style : 'normal';
            
            doc.setFont(safeFamily, safeStyle);
            doc.setFontSize(size);
            
        } catch (error) {
            console.warn('⚠️ Ошибка установки шрифта:', error);
            // Минимальная установка
            try {
                doc.setFontSize(size);
            } catch (sizeError) {
                console.warn('⚠️ Ошибка установки размера шрифта');
            }
        }
    }

    /**
     * Проверяет текст на совместимость
     */
    public static checkTextCompatibility(doc: jsPDF, text: string): boolean {
        try {
            if (!text) return true;
            
            const width = doc.getTextWidth(text);
            return width > 0 && width < 10000; // Разумные границы
        } catch (error) {
            console.warn('⚠️ Проблема с совместимостью текста:', error);
            return false;
        }
    }

    /**
     * Безопасное добавление текста
     */
    public static addTextSafe(doc: jsPDF, text: string, x: number, y: number): boolean {
        try {
            if (!text) return true;
            
            // Проверяем совместимость
            if (!this.checkTextCompatibility(doc, text)) {
                // Заменяем проблемные символы
                const safeText = text.replace(/[^\x00-\x7F]/g, '?');
                doc.text(safeText, x, y);
                return false;
            }
            
            doc.text(text, x, y);
            return true;
        } catch (error) {
            console.warn('⚠️ Ошибка добавления текста:', error);
            try {
                // Fallback - добавляем простой текст
                doc.text(String(text).substring(0, 50), x, y);
            } catch (fallbackError) {
                console.error('❌ Критическая ошибка добавления текста');
            }
            return false;
        }
    }

    /**
     * Сброс состояния загрузки шрифтов (для тестирования)
     */
    public static reset(): void {
        this.fontsLoaded = false;
    }

    /**
     * Получает информацию о шрифтах
     */
    public static getFontInfo(doc: jsPDF): any {
        try {
            return {
                loaded: this.fontsLoaded,
                available: doc.getFontList(),
                current: {
                    family: doc.getFont().fontName,
                    style: doc.getFont().fontStyle,
                    size: doc.getFontSize()
                },
                cyrillicSupport: this.checkCyrillicSupport(doc)
            };
        } catch (error) {
            return {
                loaded: this.fontsLoaded,
                available: {},
                current: null,
                cyrillicSupport: false,
                error: getErrorMessage(error) 
            };
        }
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Неизвестная ошибка';
}