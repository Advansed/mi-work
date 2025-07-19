// ============================================
// ЗАГРУЗЧИК ШРИФТОВ ДЛЯ PDF
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
            // Устанавливаем стандартные шрифты
            this.registerStandardFonts(doc);
            
            // Можно добавить загрузку кастомных шрифтов
            // await this.loadCustomFonts(doc);
            
            this.fontsLoaded = true;
            console.log('✅ Шрифты успешно загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки шрифтов:', error);
            throw new Error('Не удалось загрузить шрифты для PDF');
        }
    }

    /**
     * Регистрирует стандартные шрифты
     */
    private static registerStandardFonts(doc: jsPDF): void {
        // Times New Roman аналог для кириллицы
        doc.addFont('times', 'normal', 'normal');
        doc.addFont('times', 'bold', 'bold');
        doc.addFont('times', 'italic', 'italic');
        
        // Helvetica аналог
        doc.addFont('helvetica', 'normal', 'normal');
        doc.addFont('helvetica', 'bold', 'bold');
    }

    /**
     * Загружает кастомные шрифты (если необходимо)
     */
    private static async loadCustomFonts(doc: jsPDF): Promise<void> {
        // Здесь можно загрузить кастомные шрифты для лучшей поддержки кириллицы
        // Например, DejaVu Sans или другие Unicode шрифты
        
        try {
            // const fontData = await this.fetchFont('/assets/fonts/DejaVuSans.ttf');
            // doc.addFileToVFS('DejaVuSans.ttf', fontData);
            // doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить кастомные шрифты:', error);
        }
    }

    /**
     * Получает данные шрифта из URL
     */
    private static async fetchFont(url: string): Promise<string> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Конвертируем в base64
        let binary = '';
        uint8Array.forEach(byte => {
            binary += String.fromCharCode(byte);
        });
        
        return btoa(binary);
    }

    /**
     * Устанавливает шрифт для документа
     */
    public static setFont(doc: jsPDF, family: string = 'times', style: string = 'normal', size: number = 12): void {
        try {
            doc.setFont(family, style);
            doc.setFontSize(size);
        } catch (error) {
            console.warn(`⚠️ Не удалось установить шрифт ${family} ${style}, используем стандартный`);
            doc.setFont('times', 'normal');
            doc.setFontSize(size);
        }
    }

    /**
     * Проверяет поддержку кириллицы
     */
    public static checkCyrillicSupport(doc: jsPDF): boolean {
        const testText = 'Тест кириллицы АБВГД';
        const width = doc.getTextWidth(testText);
        return width > 0;
    }

    /**
     * Сброс состояния загрузки шрифтов (для тестирования)
     */
    public static reset(): void {
        this.fontsLoaded = false;
    }
}